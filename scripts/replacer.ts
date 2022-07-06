import * as fs from 'fs';
import dedent from 'dedent';
import prettier from 'prettier';

// NOTE: REPLACE THESE VARIABLES ACCORDINGLY
// TODO: MessageReactionsSelector, EditMessageModal, NotificationList, CTAButton, CircleFAButton, LoadingIndicator
const componentName = 'NotificationList';
const input = dedent`
| \`--str-chat__notification-list-font-family\`         | The font used in the component                          |
| \`--str-chat__notification-list-color\`               | The text/icon color of the component                    |
| \`--str-chat__notification-list-background-color\`    | The background color of the component                   |
| \`--str-chat__notification-list-border-radius\`       | The border radius used for the borders of the component |
| \`--str-chat__notification-list-border-block-start\`  | Top border of the component                             |
| \`--str-chat__notification-list-border-block-end\`    | Bottom border of the component                          |
| \`--str-chat__notification-list-border-inline-start\` | Left (right in RTL layout) border of the component      |
| \`--str-chat__notification-list-border-inline-end\`   | Right (left in RTL layout) border of the component      |
| \`--str-chat__notification-list-box-shadow\`          | Box shadow applied to the component                     |
`.trim();

const sourceFile = `./src/v2/styles/${componentName}/${componentName}-theme.scss`;
const targetFile = `./src/v2/styles/${componentName}/${componentName}-theme.scss`;
const pairs = input
  .split('\n')
  .map((line) => line.split('|'))
  .map(([, k, v]) => [k.trim().replaceAll('`', ''), v.trim()]);

const currentContent = fs.readFileSync(sourceFile, 'utf8');
const targetContent = pairs.reduce((target, [variable, description]) => {
  const replacementTemplate = dedent`\n
    /* ${description} */
    ${variable}:`;
  return target.replaceAll(variable + ':', replacementTemplate);
}, currentContent);

const formattedContent = prettier.format(targetContent, {
  parser: 'scss',
  singleQuote: true,
  printWidth: 100,
});

fs.writeFileSync(targetFile, formattedContent, 'utf8');

console.log('DONE');
