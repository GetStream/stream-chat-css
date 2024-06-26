import dedent from 'dedent';
import prettier from 'prettier';
import type { VariableGroup, VariableInfo } from './parser';
import * as packagejson from '../package.json';

type Column = {
  name: string;
  key: keyof VariableInfo | 'usedIn';
  type: 'code' | 'text' | 'values';
};
type Group = { name: string; regexp: RegExp; columns: Column[]; definedIn?: Function };

const row = (v: VariableInfo, group: Group) => {
  const usedIn = [...v.referencedIn].map(componentThemeLink).join(', ');
  const info = { ...v, usedIn };
  return dedent`${group.columns.map((c) => `| ${getColumn(c, info)}`).join('')}|`;
};

const getColumn = (column: Column, info: VariableInfo & { usedIn?: string }) => {
  if (column.type === 'values') {
    return getValuesColumn(info);
  } else {
    return getTextOrCodeColumn(column, info);
  }
};

const getValuesColumn = (info: VariableInfo & { usedIn?: string }) => {
  return `<table>${info.values
    .map((v) => `<tr><th>\`${v.scope}\`</th></tr><tr><td>\`${v.value}\`</td></tr>`)
    .join('')}</table>`;
};

const getTextOrCodeColumn = (column: Column, info: VariableInfo & { usedIn?: string }) => {
  return `${column.type === 'code' ? '`' : ''}${info[column.key] || ''}${
    column.type === 'code' ? '`' : ''
  }`;
};

export const getGlobalVariablesOutput = (
  data: Map<string, VariableInfo>,
  type: 'theme' | 'layout',
) => {
  const nameColumn: Column = { name: 'Name', key: 'name', type: 'code' };
  const valueColumn: Column = { name: 'Value(s)', key: 'values', type: 'values' };
  const descriptionColumn: Column = { name: 'Description', key: 'description', type: 'text' };
  const usedInColumn: Column = { name: 'Used in', key: 'usedIn', type: 'text' };

  const groups = [
    {
      name: 'Colors',
      regexp: /color/,
      columns: [nameColumn, valueColumn, descriptionColumn, usedInColumn],
    },
    {
      name: 'Typography',
      regexp: /(__font|-text)/,
      columns: [nameColumn, valueColumn, descriptionColumn, usedInColumn],
    },
    { name: 'Spacing', regexp: /spacing/, columns: [nameColumn, valueColumn, descriptionColumn] },
    {
      name: 'Radius',
      regexp: /__border-radius/,
      columns: [nameColumn, valueColumn, descriptionColumn, usedInColumn],
    },
    { name: 'Others', regexp: /.*/, columns: [nameColumn, valueColumn, descriptionColumn] },
  ];

  const variablesByGroups: Map<Group, string[]> = new Map();

  data.forEach((variable) => {
    for (const group of groups) {
      if (group.regexp.test(variable.name)) {
        if (!variablesByGroups.get(group)) {
          variablesByGroups.set(group, []);
        }
        variablesByGroups.get(group)!.push(row(variable, group));
        break;
      }
    }
  });

  let output = '';
  groups.forEach((group) => {
    if (variablesByGroups.get(group)) {
      const header =
        group.columns.map((c) => `| ${c.name}`).join('') +
        `| \n` +
        group.columns.map(() => '|-').join('') +
        `|`;
      output += dedent`
        ### ${group.name}
        ${header}
        ${variablesByGroups.get(group)!.join('\n')}\n\n`;
    }
  });

  output += `All global ${type} variables are defined in: [https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/_global-${type}-variables.scss](https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/_global-${type}-variables.scss)\n\n`;

  return format(output);
};

export const getComponentVariablesOutput = (data: Map<string, VariableInfo>) => {
  const nameColumn: Column = { name: 'Name', key: 'name', type: 'code' };
  const valueColumn: Column = { name: 'Value(s)', key: 'values', type: 'values' };
  const descriptionColumn: Column = { name: 'Description', key: 'description', type: 'text' };

  const subgroupDefinitions = [
    {
      name: 'Theme variables',
      regexp: /color|border|box-shadow|overlay|background/,
      columns: [nameColumn, valueColumn, descriptionColumn],
      definedIn: componentThemeLink,
    },
    {
      name: 'Layout variables',
      regexp: /.*/,
      columns: [nameColumn, valueColumn, descriptionColumn],
      definedIn: componentLayoutLink,
    },
  ];

  const componentsGroups: Map<VariableGroup, Map<Group, string[]>> = new Map();
  data.forEach((v) => {
    const variableGroup = v.definedIn;
    if (variableGroup) {
      let existingVariableGroup = Array.from(componentsGroups.keys()).find(
        (g) => g.componentName === variableGroup.componentName,
      );
      if (!existingVariableGroup) {
        componentsGroups.set(variableGroup, new Map());
        existingVariableGroup = variableGroup;
      }
      const componentGroup = componentsGroups.get(existingVariableGroup)!;
      const subgroup = subgroupDefinitions.find((subgroup) => subgroup.regexp.test(v.name));
      if (subgroup) {
        if (!componentGroup.get(subgroup)) {
          componentGroup.set(subgroup, []);
        }
        componentGroup.get(subgroup)?.push(row(v, subgroup));
      }
    }
  });

  let output = '';
  Array.from(componentsGroups.entries())
    .sort((e1, e2) => e1[0].componentName.localeCompare(e2[0].componentName))
    .forEach(([variableGroup, variablesBySubgroups]) => {
      output += dedent`
      ## ${variableGroup.componentName}${
        variableGroup.sdkRestriction
          ? ` - Only available in ${variableGroup.sdkRestriction} SDK`
          : ''
      }\n`;

      subgroupDefinitions.forEach((group) => {
        if (variablesBySubgroups.get(group)) {
          const header =
            group.columns.map((c) => `| ${c.name}`).join('') +
            `| \n` +
            group.columns.map(() => '|-').join('') +
            `|`;
          output += dedent`
          ### ${group.name}
          ${header}
          ${variablesBySubgroups.get(group)!.join('\n')}\n
          Defined in: ${group.definedIn(variableGroup.componentName)}\n\n`;
        }
      });
    });

  return format(output);
};

export const getPaletteVariablesOutput = (data: Map<string, VariableInfo>) => {
  const row = (variableInfo: VariableInfo) => {
    return `| \`${variableInfo.name}\` | ${getValuesColumn(variableInfo)} |`;
  };
  const rows = Array.from(data.values()).map(row);

  let output = dedent`  
  | Name | Value(s) |
  |------|-------|
  ${rows.join('\n')}`;

  return format(output);
};

const componentThemeLink = (componentName: string) => {
  const pathInRepo = `https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/`;
  return `[${componentName}](${pathInRepo}#COMP#/#COMP#-theme.scss)`.replaceAll(
    '#COMP#',
    componentName,
  );
};

const componentLayoutLink = (componentName: string) => {
  const pathInRepo = `https://github.com/GetStream/stream-chat-css/tree/v${packagejson.version}/src/v2/styles/`;
  return `[${componentName}](${pathInRepo}#COMP#/#COMP#-layout.scss)`.replaceAll(
    '#COMP#',
    componentName,
  );
};

const format = (content: string) => {
  return prettier.format(content, {
    parser: 'markdown',
  });
};
