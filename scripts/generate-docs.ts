import * as fs from 'fs';
import { getComponentVariablesOutput, getGlobalVariablesOutput } from './output';
import { extractComponents } from './parser';

const componentInfos = extractComponents('./src/v2/**/*-@(theme|layout).scss');

const globalThemeVariablesOutput = getGlobalVariablesOutput('theme');
const globalLayoutVariablesOutput = getGlobalVariablesOutput('layout');
const componentVariablesOutput = getComponentVariablesOutput(componentInfos);

const updateAutogeneratedSlot = (
  templateFilePath: string,
  slotId: string,
  contentToInject: string,
  targetFilePath: string,
) => {
  const template = fs.readFileSync(templateFilePath, 'utf8');
  const targetContent = template.replaceAll(slotId, contentToInject);
  fs.writeFileSync(targetFilePath, targetContent, 'utf8');
};

updateAutogeneratedSlot(
  `./doc-templates/global-variables.template.mdx`,
  `[//]: # '#SLOT-autogenerated-theme-variables'`,
  globalThemeVariablesOutput,
  `./docs/theming/global-variables.mdx`,
);

updateAutogeneratedSlot(
  `./docs/theming/global-variables.mdx`,
  `[//]: # '#SLOT-autogenerated-layout-variables'`,
  globalLayoutVariablesOutput,
  `./docs/theming/global-variables.mdx`,
);

updateAutogeneratedSlot(
  `./doc-templates/component-variables.template.mdx`,
  `[//]: # '#SLOT-autogenerated-component-variables'`,
  componentVariablesOutput,
  `./docs/theming/component-variables.mdx`,
);
