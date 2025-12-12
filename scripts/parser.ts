import * as fs from 'fs';
import * as path from 'path';
import glob from 'glob';
import * as sass from 'sass';
import postcss, { Root, Rule, Declaration, Comment, Container } from 'postcss';

type SDK = 'Angular' | 'React';

export type ComponentInfo = {
  name: string;
  variableTypes: ('theme' | 'layout')[];
  sdkRestriction?: SDK;
};

export const extractComponents = (fromGlob: string) => {
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

    const css = compilation.css;
    const root: Root = postcss.parse(css);

    let sdkRestriction: SDK | undefined = undefined;
    let variableType: 'layout' | 'theme' | undefined = undefined;

    root.walkRules((rule: Rule) => {
      const ruleSetComment = extractLeadingComment(rule);
      if (ruleSetComment) {
        const matches = ruleSetComment.match(/Angular|React/g);
        if (matches) {
          sdkRestriction = matches[0] as SDK;
        }
      }

      rule.walkDecls((decl: Declaration) => {
        // custom property name is in decl.prop
        if (decl.prop.startsWith('--str-chat')) {
          variableType = file.includes('theme') ? 'theme' : 'layout';
        }
      });
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

const extractLeadingComment = (rule: Rule): string | undefined => {
  const parent = rule.parent as Container | undefined;
  if (!parent || !('nodes' in parent) || !parent.nodes) return;

  const idx = parent.nodes.indexOf(rule);
  if (idx <= 0) return;

  const prev = parent.nodes[idx - 1];
  if (prev.type === 'comment') {
    // PostCSS comment text is everything inside /* ... */
    const comment = (prev as Comment).text;
    return comment.trim();
  }

  return undefined;
};
