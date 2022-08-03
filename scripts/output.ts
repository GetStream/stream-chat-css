import dedent from 'dedent';
import prettier from 'prettier';
import type { VariableGroup, VariableInfo } from './parser';

type Column = {name: string, key: keyof VariableInfo | 'usedIn', type: 'code' | 'text'};
type Group = {name: string, regexp: RegExp, columns: Column[], definedIn?: Function};

const row = (v: VariableInfo, group: Group) => {
  const usedIn = [...v.referencedIn].map(componentThemeLink).join(', ');
  const info = {...v, usedIn};
  return dedent`${group.columns.map(c => `| ${c.type === 'code' ? '\`' : ''}${info[c.key] || ''}${c.type === 'code' ? '\`' : ''}`).join('')}|`;
};

export const getThemeVariablesOutput = (data: Map<string, VariableInfo>) => {
  const nameColumn: Column = {name: 'Name', key: 'name', type: 'code'};
  const valueColumn: Column = {name: 'Value', key: 'value', type: 'code'};
  const valueDarkColumn: Column = {name: 'Value (dark mode)', key: 'valueDarkMode', type: 'code'};
  const descriptionColumn: Column = {name: 'Description', key: 'description', type: 'text'};
  const usedInColumn: Column = {name: 'Used in', key: 'usedIn', type: 'text'}
  
  const groups = [
    {name: 'Colors', regexp: /color/, columns: [nameColumn, valueColumn, valueDarkColumn, descriptionColumn, usedInColumn]},
    {name: 'Fonts', regexp: /(__font|-text)/, columns: [nameColumn, valueColumn, descriptionColumn, usedInColumn]},
    {name: 'Spacing', regexp: /spacing/, columns: [nameColumn, valueColumn, descriptionColumn]},
    {name: 'Radius', regexp: /__border-radius/, columns: [nameColumn, valueColumn, descriptionColumn, usedInColumn]},
    {name: 'Others', regexp: /.*/, columns: [nameColumn, valueColumn, descriptionColumn]}
  ]

  const variablesByGroups: Map<Group, string[]> = new Map();

  groups.forEach(g => variablesByGroups.set(g, []));

  data.forEach((variable) => {
    for (const group of groups) {
      if (group.regexp.test(variable.name)) {
        variablesByGroups.get(group)!.push(row(variable, group));
        break;
      }
    }
  });

  let output = '';
  groups.forEach(group => {
    const header = group.columns.map(c => `| ${c.name}`).join('') + `| \n` + group.columns.map(() => '|-').join('') + `|`;
    output += dedent`
      ## ${group.name}
      ${header}
      ${variablesByGroups.get(group)!.join('\n')}\n\n`;
  });

  return format(output);
};

export const getComponentVariablesOutput = (data: Map<string, VariableInfo>) => {
  const nameColumn: Column = {name: 'Name', key: 'name', type: 'code'};
  const valueColumn: Column = {name: 'Value', key: 'value', type: 'code'};
  const descriptionColumn: Column = {name: 'Description', key: 'description', type: 'text'};

  const subgroupDefinitions = [
    {name: 'Theme variables', regexp: /color|border|box-shadow|overlay|background/, columns: [nameColumn, valueColumn, descriptionColumn], definedIn: componentThemeLink},
    {name: 'Layout variables', regexp: /.*/, columns: [nameColumn, valueColumn, descriptionColumn], definedIn: componentLayoutLink},
  ];

  const componentsGroups: Map<VariableGroup, Map<Group, string[]>> = new Map();
  data.forEach((v) => {
    const variableGroup = v.definedIn;
    if (variableGroup) {
      let existingVariableGroup = Array.from(componentsGroups.keys()).find(g => g.componentName === variableGroup.componentName);
      if (!existingVariableGroup) {
        componentsGroups.set(variableGroup, new Map());
        existingVariableGroup = variableGroup;
      }
      const componentGroup = componentsGroups.get(existingVariableGroup)!;
      const subgroup = subgroupDefinitions.find(subgroup => subgroup.regexp.test(v.name));
      if (subgroup) {
        if (!componentGroup.get(subgroup)) {
          componentGroup.set(subgroup, []);
        }
        componentGroup.get(subgroup)?.push(row(v, subgroup));
      }
    }
  });

  let output = '';
  Array.from(componentsGroups.entries()).forEach(([variableGroup, variablesBySubgroups]) => {
    output += dedent`
      ## ${variableGroup.componentName}${variableGroup.sdkRestriction ? ` - Only available in ${variableGroup.sdkRestriction} SDK` : ''}\n`;
    
      subgroupDefinitions.forEach(group => {
      if (variablesBySubgroups.get(group)) {
        const header = group.columns.map(c => `| ${c.name}`).join('') + `| \n` + group.columns.map(() => '|-').join('') + `|`;
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
  const row = (v: VariableInfo) => {
    return `| \`${v.name}\` | \`${v.value}\` |`;
  };
  const rows = Array.from(data.values()).map(row);

  let output = dedent`  
  | Name | Value |
  |------|-------|
  ${rows.join('\n')}`;

  return format(output);
};

const componentThemeLink = (componentName: string) => {
  const pathInRepo = 'https://github.com/GetStream/stream-chat-css/blob/main/src/v2/styles/';
  return `[${componentName}](${pathInRepo}#COMP#/#COMP#-theme.scss)`.replaceAll(
    '#COMP#',
    componentName,
  );
};

const componentLayoutLink = (componentName: string) => {
  const pathInRepo = 'https://github.com/GetStream/stream-chat-css/blob/main/src/v2/styles/';
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
