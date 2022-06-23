#!/usr/bin/env node

// TODO:
// capture light/dark vars into their own fields
import Parser from 'tree-sitter';
import CSS from 'tree-sitter-css';
import fs from 'fs';
import process from 'process';

process.stdin.on('data', (data) => {
  parseCssToVariables(data.toString());
});

function parseCssToVariables(cssCode) {
  const parser = new Parser();
  parser.setLanguage(CSS);

  const VARIABLE_SELECTOR = '.str-chat';
  const LIGHT_THEME_SELECTOR = `.str-chat,
.str-chat__theme-light`;
  const DARK_THEME_SELECTOR = `.str-chat__theme-dark`;
  const commentParser = new RegExp('/\\*\\s*(.+?)(?:\\. )?(Used in.+)?\\s*\\*/');
  const colorVariableMatch = new RegExp(/green|blue|red|grey|yellow/);

  const unrecognizedCssVariables = [];
  const processedCssVariables = {
    colors: {},
    spacing: [],
    borderRadius: [],
    font: [],
    components: {},
    lightTheme: [],
    darkTheme: [],
  };

  const tree = parser.parse(cssCode);

  tree.rootNode.children.forEach((child) => {
    if (child.type === 'rule_set') {
      const selector = child.child(0).text;
      if (
        selector == VARIABLE_SELECTOR ||
        selector == LIGHT_THEME_SELECTOR ||
        selector === DARK_THEME_SELECTOR
      ) {
        const contents = child.child(1).children.slice(1, -1);

        contents.forEach((child, index) => {
          if (child.type === 'declaration') {
            if (child.child(0).text.startsWith('--')) {
              let comment = { description: '', usage: '' };
              if (index > 0) {
                let prevNode = contents[index - 1];
                if (prevNode.type === 'comment') {
                  const matches = prevNode.text.match(commentParser);
                  comment.description = matches[1];
                  comment.usage = matches[2];
                }
              }

              const varName = child.child(0).text;

              const variableInfo = {
                varName,
                varValue: child.children
                  .slice(2, -1)
                  .map((value) => value.text)
                  .join(' '),
              };
              if (comment.description) {
                variableInfo.description = comment.description;
              }
              if (comment.usage) {
                variableInfo.usage = comment.usage;
              }

              if (selector === LIGHT_THEME_SELECTOR) {
                processedCssVariables.lightTheme.push(variableInfo);
                return;
              }

              if (selector === DARK_THEME_SELECTOR) {
                processedCssVariables.darkTheme.push(variableInfo);
                return;
              }

              const colorMatch = varName.match(colorVariableMatch);
              if (colorMatch !== null) {
                const colorName = colorMatch[0];
                if (!processedCssVariables.colors[colorName]) {
                  processedCssVariables.colors[colorName] = new Array();
                }
                processedCssVariables.colors[colorName].push(variableInfo);
                return;
              }

              if (varName.includes('__border-radius')) {
                processedCssVariables.borderRadius.push(variableInfo);
                return;
              }

              if (varName.includes('__font-family')) {
                processedCssVariables.font.push(variableInfo);
                return;
              }

              if (varName.includes('spacing')) {
                processedCssVariables.spacing.push(variableInfo);
                return;
              }

              const componentNameMatch = varName.match(
                /\--str-chat__(?!primary|secondary|active|on|background|text|disabled|danger)(.+?)-(font|border|box|color|background|hover|selected|margin|overlay|filter)/,
              );

              if (componentNameMatch !== null) {
                const componentName = componentNameMatch[1];
                if (!processedCssVariables.components[componentName]) {
                  processedCssVariables.components[componentName] = [];
                }
                processedCssVariables.components[componentName].push(variableInfo);
                return;
              }
              unrecognizedCssVariables.push(variableInfo);
            }
          }
        });
      }
    }
  });

  // TODO: write those to .mdx files and include them in the docs
  console.log(writeVariablesToTable(processedCssVariables.lightTheme));

  if (unrecognizedCssVariables.length > 0) {
    console.log(
      `Unrecognized CSS variables - ${JSON.stringify(unrecognizedCssVariables, null, 2)}`,
    );
  }
}

function writeVariablesToTable(variables, path) {
  const includeDescriptionColumn = variables.some((variable) => variable.description !== undefined);
  const includeUsageColumn = variables.some((variable) => variable.usage !== undefined);

  const columns = ['Name', 'Default Value'];
  if (includeDescriptionColumn) {
    columns.push('Description');
  }

  if (includeUsageColumn) {
    columns.push('Used in');
  }

  const table = `<table>
      <thead><tr>${columns.map((col) => `<th>${col}</th>`).join('')}</tr></thead>
      <tbody>
          ${variables
            .map((variable) => {
              let varMarkup = `<tr><td><code>${variable.varName}</code></td><td>${variable.varValue}</td>`;
              if (includeDescriptionColumn) {
                varMarkup += `<td>${variable.description || ''}</td>`;
              }

              if (includeUsageColumn) {
                varMarkup += `<td>${variable.usage || ''}</td>`;
              }

              varMarkup += `</tr>`;
              return varMarkup;
            })
            .join('\n')}
      </tbody>
    </table>`;

  return table;
}
