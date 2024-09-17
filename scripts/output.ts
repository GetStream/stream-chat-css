import dedent from 'dedent';
import prettier from 'prettier';
import type { ComponentInfo } from './parser';
import * as packagejson from '../package.json';

export const getGlobalVariablesOutput = (type: 'theme' | 'layout') => {
  const output = `([list of global ${type} variables](https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/_global-${type}-variables.scss))`;

  return format(output);
};

export const getComponentVariablesOutput = (componentInfos: ComponentInfo[]) => {
  const header = `Component name | Variables | \n |-|-| \n`;
  let output = header;
  componentInfos
    .sort((e1, e2) => e1.name.localeCompare(e2.name))
    .forEach((componentInfo) => {
      output += dedent`\`${componentInfo.name}\`${
        componentInfo.sdkRestriction ? ` (${componentInfo.sdkRestriction} SDK only)` : ''
      } | ${componentInfo.variableTypes
        .map((t) =>
          t === 'theme'
            ? componentThemeLink(componentInfo.name)
            : componentLayoutLink(componentInfo.name),
        )
        .join(', ')}|`;
      output += `\n`;
    });

  return format(output);
};

const componentThemeLink = (componentName: string) => {
  const pathInRepo = `https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/`;
  return `[theme variables](${pathInRepo}#COMP#/#COMP#-theme.scss)`.replaceAll(
    '#COMP#',
    componentName,
  );
};

const componentLayoutLink = (componentName: string) => {
  const pathInRepo = `https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/`;
  return `[layout variables](${pathInRepo}#COMP#/#COMP#-layout.scss)`.replaceAll(
    '#COMP#',
    componentName,
  );
};

const format = (content: string) => {
  return prettier.format(content, {
    parser: 'markdown',
  });
};
