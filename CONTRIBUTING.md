## Contributing

Here's ways in which you can contribute:

- Found a **bug** or have a **feature request**?
  1. Search for it in the [existing issues](https://github.com/fmaclen/hollama/issues)
  2. Open a [new issue](https://github.com/fmaclen/hollama/issues/new) if it doesn't yet exist
- Comment or upvote [existing issues](https://github.com/fmaclen/hollama/issues) _(active issues will likely be prioritized)_
- Submit a [pull request](https://github.com/fmaclen/hollama/pulls) _(please discuss in an issue first)_

## Developing

Hollama is a static site built with:
- TypeScript
- Svelte & SvelteKit
- Vite
- Playwright
- Tailwind CSS

Install dependencies with `npm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of Hollama:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
