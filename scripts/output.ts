import dedent from 'dedent';
import prettier from 'prettier';
import type { VariableInfo } from './parser';

export const getThemeVariablesOutput = (data: Map<string, VariableInfo>) => {
  const row = (v: VariableInfo, includeTheme?: boolean) => {
    const usedIn = [...v.referencedIn].map(componentLink).join(', ');
    if (includeTheme) {
      return dedent`
     | \`${v.name}\` | \`${v.value}\` | \`${v.valueDarkMode || ''}\` | ${
        v.description || ''
      } | ${usedIn} |`;
    }
    return dedent`
     | \`${v.name}\` | \`${v.value}\` | ${v.description || ''} | ${usedIn} |`;
  };

  const colorMatcher = /color/;
  // [matcher, group name]
  const filters: [RegExp, string][] = [
    [/green|blue|red|grey|yellow/, 'Palette'],
    [/__font-family/, 'Fonts'],
    [/spacing/, 'Spacing'],
    [/__border-radius/, 'Radius'],
    [/.*/, 'Others'],
  ];

  const groups: Record<string, string[]> = Object.values(filters).reduce(
    (initialGroups, [, group]) => ({ ...initialGroups, [group]: [] }),
    {},
  );
  const colors: string[] = [];
  data.forEach((variable) => {
    if (colorMatcher.test(variable.name)) {
      // colors have special treatment (dark/light mode)
      colors.push(row(variable, true));
    } else {
      for (const [matcher, group] of filters) {
        if (matcher.test(variable.name)) {
          groups[group].push(row(variable));
          break;
        }
      }
    }
  });

  let output = dedent`
    ## Colors
    | Name | Value | Value (dark) | Description | Used in |
    |------|-------|--------------|-------------|---------|
    ${colors.join('\n')}\n\n
  `;

  Object.entries(groups).forEach(([group, rows]) => {
    output += dedent`
      ## ${group}
      | Name | Value | Description | Used in |
      |------|-------|-------------|---------|
      ${rows.join('\n')}\n\n`;
  });

  return format(output);
};

export const getComponentVariablesOutput = (data: Map<string, VariableInfo>) => {
  const row = (v: VariableInfo) => {
    return `| \`${v.name}\` | \`${v.value}\` | ${v.description || ''} |`;
  };

  const componentsGroups: Record<string, string[]> = {};
  data.forEach((v) => {
    const componentName = v.definedIn;
    if (componentName) {
      if (!componentsGroups[componentName]) {
        componentsGroups[componentName] = [];
      }
      componentsGroups[componentName].push(row(v));
    }
  });

  let output = '';
  Object.entries(componentsGroups).forEach(([componentName, rows]) => {
    output += dedent`
      ## ${componentName}
      
      | Name | Value | Description |
      |------|-------|-------------|
      ${rows.join('\n')}
      
      Defined in: ${componentLink(componentName)}\n\n`;
  });

  return format(output);
};

const componentLink = (componentName: string) => {
  const pathInRepo = 'https://github.com/GetStream/stream-chat-css/blob/main/src/v2/styles/';
  return `[${componentName}](${pathInRepo}#COMP#/#COMP#-theme.scss)`.replaceAll(
    '#COMP#',
    componentName,
  );
};

const format = (content: string) => {
  return prettier.format(content, {
    parser: 'markdown',
  });
};
