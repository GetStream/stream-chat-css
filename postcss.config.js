const postcssLogical = require('postcss-logical');
const postcssDirPseudoClass = require('postcss-dir-pseudo-class');

module.exports = {
  syntax: 'postcss-scss',
  plugins: [postcssLogical({ preserve: true }), postcssDirPseudoClass()],
};
