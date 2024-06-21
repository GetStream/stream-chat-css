# stream-chat-css

> Bundled CSS for Stream Chat SDKs

[![NPM](https://img.shields.io/npm/v/@stream-io/stream-chat-css.svg)](https://www.npmjs.com/package/@stream-io/stream-chat-css)

## Install

```bash
# with npm
npm install --save @stream-io/stream-chat-css
# with yarn
yarn add @stream-io/stream-chat-css
```

## Usage

This repository comes as a dependency of `stream-chat-react` and doesn't require explicit installation if you're using the component library. Add the styles to your app by importing the bundled CSS:

```tsx
import '@stream-io/stream-chat-css/dist/css/index.css';
```

## License

MIT © [Stream.io Inc.](https://getstream.io)

## We are hiring!

We've recently closed a [$38 million Series B funding round](https://techcrunch.com/2021/03/04/stream-raises-38m-as-its-chat-and-activity-feed-apis-power-communications-for-1b-users/) and we keep actively growing.
Our APIs are used by more than a billion end-users, and you'll have a chance to make a huge impact on the product within a team of the strongest engineers all over the world.

Check out our current openings and apply via [Stream's website](https://getstream.io/team/#jobs).

## Icons - for Stream Developers

- The icons for the UI components can be exported from [Figma](https://www.figma.com/files/project/42134328/SDK-Teams-support-files?fuid=1038443988589634784)
- Icons are used as fonts, the font files are located in `src/assets/icons`
- If you need to change icons you have to regenerate the icon fonts:

1. Go to [https://fontello.com/](https://fontello.com/)
2. Upload the `svg` font from `src/assets/icons`
3. Edit the font
4. Set the font name to `stream-chat-icons` and the CSS prefix to `str-chat__icon--`
5. Download the font, and copy the content of the `font` folder to `src/assets/icons`, and copy the mapping from `css/stream-chat-icons.css` to `src/v2/Icon/Icon-layout.scss`
