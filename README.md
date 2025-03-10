# Stream Chat CSS

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/19dd203e-c84a-4015-9c90-1a54212fc2e2">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/fb6b6686-ce5d-4c8f-87b7-9bb495b6ce66">
    <img src="https://github.com/user-attachments/assets/19dd203e-c84a-4015-9c90-1a54212fc2e2" width="360" alt="Stream logo">
  </picture>
  <h3>Beautiful, ready-to-use styling for Stream Chat SDKs</h3>
  
  [![NPM](https://img.shields.io/npm/v/@stream-io/stream-chat-css.svg)](https://www.npmjs.com/package/@stream-io/stream-chat-css)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/GetStream/stream-chat-css/blob/main/LICENSE)
  [![Build Status](https://img.shields.io/github/workflow/status/GetStream/stream-chat-css/CI/main)](https://github.com/GetStream/stream-chat-css/actions)
</div>

## 📝 Overview

Stream Chat CSS provides a comprehensive set of styles that power the UI components in [Stream](https://getstream.io/)'s Chat SDKs. This package is designed to make implementing beautiful, responsive chat interfaces straightforward and consistent.

- 🎨 **Complete Styling** - All the CSS you need to build full-featured chat applications
- 🧩 **Component-Based** - Organized by UI component for easy customization
- 🌈 **Themeable** - Extensive design system with customizable variables
- 🌐 **Cross-Browser Support** - Works across all modern browsers and devices
- 🧿 **Accessibility** - Built with a11y best practices

## 🚀 Installation

```bash
# With npm
npm install --save @stream-io/stream-chat-css

# With yarn
yarn add @stream-io/stream-chat-css

# With pnpm
pnpm add @stream-io/stream-chat-css
```

## 💻 Usage

This package comes as a dependency of `stream-chat-react` and doesn't require explicit installation if you're already using the React component library.

### Adding the styles to your app

Simply import the bundled CSS into your application:

```tsx
import '@stream-io/stream-chat-css/dist/css/index.css';
```

### Custom Theming

Stream Chat CSS supports customization through CSS variables. You can override the default theme by setting your own values for the CSS variables.

```css
:root {
  --str-chat__primary-color: #00b7ff;
  --str-chat__secondary-color: #1a1a1a;
  /* More customizations here */
}
```

## 🔍 Why Choose Stream?

[Stream](https://getstream.io) powers chat and activity feeds for over 1 billion end users. Our robust, scalable platform helps you build:

- **In-app Messaging** - Group chats, direct messaging, channels
- **Team Collaboration** - Slack-like workspaces and threaded conversations
- **Live Streaming** - Interactive live streams with chat
- **Virtual Events** - Engaging event platforms with rich chat features
- **Gaming Communities** - Community building with real-time chat
- **Support Channels** - Customer support with integrated chat

### ✨ Try Stream for Free

Ready to add chat to your application? [Sign up for a free Stream account](https://getstream.io/chat/trial/) and start building today!

* Free tier for smaller applications and testing
* Comprehensive documentation and tutorials
* Enterprise-grade security and compliance
* Dedicated support for paid plans

**[🔗 Check out our interactive demos →](https://getstream.io/chat/demos/)**

## 👩‍💻 We're Hiring!

We've [raised $38 million in Series B funding](https://techcrunch.com/2021/03/04/stream-raises-38m-as-its-chat-and-activity-feed-apis-power-communications-for-1b-users/) and are actively expanding our team of talented engineers.

Join us in building communication APIs used by over a billion end-users. You'll have the opportunity to make a significant impact on our products alongside some of the best engineers from around the world.

[**View Open Positions →**](https://getstream.io/team/#jobs)

## 🔣 Icons - for Stream Developers

- The icons for UI components can be exported from [Figma](https://www.figma.com/files/project/42134328/SDK-Teams-support-files?fuid=1038443988589634784)
- Icons are used as fonts, the font files are located in `src/assets/icons`
- If you need to change icons you have to regenerate the icon fonts:

1. Go to [https://fontello.com/](https://fontello.com/)
2. Upload the `svg` font from `src/assets/icons`
3. Edit the font
4. Set the font name to `stream-chat-icons` and the CSS prefix to `str-chat__icon--`
5. Download the font, and copy the content of the `font` folder to `src/assets/icons`, and copy the mapping from `css/stream-chat-icons.css` to `src/v2/Icon/Icon-layout.scss`

## 📄 License

MIT © [Stream.io Inc.](https://getstream.io)
