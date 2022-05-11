const postcssLogical = require('postcss-logical');
const postcssDirPseudoClass = require('postcss-dir-pseudo-class');
const postcssFlexGapPolyfill = require('flex-gap-polyfill');

module.exports = {
  syntax: 'postcss-scss',
  plugins: [postcssLogical({ preserve: true }), postcssDirPseudoClass(), postcssFlexGapPolyfill()],
};
