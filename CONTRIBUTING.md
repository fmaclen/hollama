## Contributing

Here's ways in which you can contribute:

- Found a **bug** or have a **feature request**?
  1. Search for it in the [existing issues](https://github.com/fmaclen/hollama/issues)
  2. Open a [new issue](https://github.com/fmaclen/hollama/issues/new) if it doesn't yet exist
- Comment or upvote [existing issues](https://github.com/fmaclen/hollama/issues) _(active issues will likely be prioritized)_
- Submit a [pull request](https://github.com/fmaclen/hollama/pulls) _(please discuss in an issue first)_

## Developing

Hollama is a single-page app that runs entirely in the browser, built with:

- TypeScript
- Svelte & SvelteKit
- Vite
- Tailwind CSS
- Paraglide JS
- Playwright
- Electron

Install dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open

# run the app with Electron
npm run electron
```

## Building

To create a production version of Hollama:

```bash
npm run build

# or package with Electron
npm run electron:build
```

You can preview the production build with `npm run preview`.

## Translations

Each language has a file in `messages/`, named after its locale (e.g. `messages/de.json`). English (`messages/en.json`) is the source: any message a language leaves out falls back to English, so a partial translation is fine.

To update a language, edit its file. To add a new one:

1. Copy `messages/en.json` to `messages/<locale>.json` and translate what you can
2. Add the locale to `locales` in `project.inlang/settings.json`
3. Add it to the language picker in `src/routes/settings/Interface.svelte`, labeled in its own language
4. Add a test for it in `tests/locales.test.ts`

Placeholders like `{model}` must stay as they are. To see which messages are still untranslated in each language, run:

```bash
npm run i18n:check
```
