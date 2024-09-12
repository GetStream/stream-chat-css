import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import * as sass from 'sass';
import Parser, { SyntaxNode } from 'tree-sitter';
// @ts-ignore
import CSS from 'tree-sitter-css';

type SDK = 'Angular' | 'React';

export type ComponentInfo = {
  name: string;
  variableTypes: ('theme' | 'layout')[];
  sdkRestriction?: SDK;
};

export const extractComponents = (fromGlob: string) => {
  const parser = new Parser();
  parser.setLanguage(CSS);

  const componentInfos: ComponentInfo[] = [];
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

    let sdkRestriction: SDK | undefined = undefined;
    let variableType: 'layout' | 'theme' | undefined = undefined;
    const ast = parser.parse(compilation.css);
    ast.rootNode.descendantsOfType('rule_set').forEach((ruleSet) => {
      const ruleSetComment = extractComment(ruleSet);
      if (ruleSetComment) {
        const matches = ruleSetComment.match(/Angular|React/g);
        if (matches) {
          sdkRestriction = matches[0] as SDK;
        }
      }
      for (let i = 0; i < ruleSet.descendantsOfType('declaration').length; i++) {
        const node = ruleSet.descendantsOfType('declaration')[i];
        const identifier = node.text;
        if (identifier.startsWith('--str-chat')) {
          variableType = file.includes('theme') ? 'theme' : 'layout';
          break;
        }
      }
    });

    if (variableType) {
      let componentInfo = componentInfos.find((c) => c.name === componentName);
      if (!componentInfo) {
        componentInfo = {
          name: componentName,
          variableTypes: [],
        };
        componentInfos.push(componentInfo);
      }

      componentInfo.variableTypes.push(variableType);
      componentInfo.variableTypes.sort().reverse();
      componentInfo.sdkRestriction = sdkRestriction;
    }
  });

  return componentInfos;
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
};
