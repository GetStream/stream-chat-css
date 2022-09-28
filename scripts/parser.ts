import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import * as sass from 'sass';
import Parser, { SyntaxNode } from 'tree-sitter';
// @ts-ignore
import CSS from 'tree-sitter-css';

type SDK = 'Angular' | 'React';
type ComponentName = string;
export type VariableGroup = {
  componentName: ComponentName,
  sdkRestriction?: SDK;
};

export type VariableInfo = {
  name: string;
  value: string;
  valueDarkMode?: string;
  theme?: string;
  description?: string;
  definedIn?: VariableGroup;
  blockComment?: string;
  referencedIn: Set<ComponentName>;
};

export const extractVariables = (fromGlob: string, dependencies?: Map<string, VariableInfo>) => {
  const parser = new Parser();
  parser.setLanguage(CSS);

  const componentVariables = new Map<string, VariableInfo>();
  const files = glob.sync(fromGlob);
  files.forEach((file) => {
    const [, componentName] = file.split(/.*\/(.*)-(theme|layout|variables)\.scss$/);
    // sass fails to resolve the `../utils` file for some reason, therefore
    // we promote it to "module" and then we announce it to the compiler via
    // the `loadPaths` configuration option.
    const content = fs
      .readFileSync(file, 'utf8')
      .replaceAll(`'../utils'`, `'utils'`)
      .replaceAll(`'../../utils'`, `'utils'`);
    const compilation = sass.compileString(content, {
      loadPaths: [path.resolve('./src/v2/styles')],
    });

    const ast = parser.parse(compilation.css);
    ast.rootNode.descendantsOfType('rule_set').forEach((ruleSet) => {
      const ruleSetComment = extractComment(ruleSet);
      let sdkRestriction: SDK | undefined = undefined;
      if (ruleSetComment) {
        const matches = ruleSetComment.match(/Angular|React/g);
        if (matches) {
          sdkRestriction = matches[0] as SDK;
        }
      }
      const variableGroup = {componentName, sdkRestriction};
      ruleSet.descendantsOfType('declaration').forEach(node => {
        const identifier = node.text;
        if (identifier.startsWith('--str-chat')) {
          const currentVariable = extractVariableInfo(node, variableGroup);
          const seenVariable = componentVariables.get(currentVariable.name);
          if (!seenVariable) {
            // we see this variable for a very first time, store it in the map
            componentVariables.set(currentVariable.name, currentVariable);
          } else {
            // we see the variable declared again, most likely due to theming override
            // update the values of the already stored variable accordingly: (dark -> light, light -> dark).
            if (seenVariable.theme !== 'dark' && currentVariable.theme === 'dark') {
              seenVariable.valueDarkMode = currentVariable.value;
            } else if (seenVariable.theme !== 'light' && currentVariable.theme === 'light') {
              seenVariable.value = currentVariable.value;
            }
          }
        }

        if (dependencies) {
          const value = node.text;
          // matches against multiple var() invocations in the same rule
          // e.g.: padding: var(--xs-p) var(--xl-p);
          const matches = value.match(/var\(([\w\s,-]+)\)/g);
          if (matches) {
            matches.forEach((match) => {
              // capture the variable name, e.g.: "var(--xl-p)" -> "--xl-p", "var(--xl-p, 8px)" -> "--xl-p"
              const [, variable] = match.match(/var\(([\w\s-]+)(\)|,)/)!;
              const dependantVariable = dependencies.get(variable.trim());
              dependantVariable?.referencedIn.add(componentName);
            });
          }
        }
      });
    });
  });

  return componentVariables;
};

const extractVariableInfo = (node: SyntaxNode, variableGroup: VariableGroup): VariableInfo => {
  // nodes in format: <name>: <value-1> <value-2> ... ;
  const [name, _, ...declValues] = node.children;
  const value = declValues
    .slice(0, -1) // omit ; terminator
    .map((n) => n.text.replaceAll('\n', '').trim())
    .join(' ')
    .trim();

  const description = extractComment(node);

  const theme = detectTheme(node);
  return {
    name: name.text.trim(),
    value,
    valueDarkMode: theme === 'dark' ? value : undefined,
    theme,
    description,
    definedIn: variableGroup,
    referencedIn: new Set<ComponentName>(),
  };
};

const extractComment = (node: SyntaxNode) => {
  if (node.previousSibling?.type === 'comment') {
    const match = node.previousSibling.text.match(/\*\s*(.+?)\*\//)!;
    if (match) {
      const [, comment] = match;
      return comment.trim();
    }
  } else {
    return undefined;
  }
}

const detectTheme = (node: SyntaxNode) => {
  let theme = undefined;
  let n = node;
  do {
    if (n.type === 'rule_set' && n.firstChild) {
      const selector = n.firstChild.text;
      if (selector.includes('str-chat__theme-light')) {
        theme = 'light';
      } else if (selector.includes('str-chat__theme-dark')) {
        theme = 'dark';
      }
    }
    n = n.parent!;
  } while (n != null && !theme);
  return theme;
};
