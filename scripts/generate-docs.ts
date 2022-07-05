import { extractVariables } from './parser';
import { getComponentVariablesOutput, getThemeVariablesOutput } from './output';

const themeVariables = extractVariables('./src/v2/styles/_theme-variables.scss');
const componentVariables = extractVariables('./src/v2/**/*-@(theme|layout).scss', themeVariables);

console.log(getThemeVariablesOutput(themeVariables));
console.log(getComponentVariablesOutput(componentVariables));
