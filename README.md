# Hollama

A minimal web-UI for talking to [Ollama](https://github.com/jmorganca/ollama/) servers.

> ![localhost_5173_4jrb1w](https://github.com/fmaclen/hollama/assets/1434675/ffe0abb6-9fa6-4eb6-aa82-2b0454d9bd49)
> ![localhost_5173_](https://github.com/fmaclen/hollama/assets/1434675/2d4c0ab0-82a9-45e0-8704-8b405cfc77c9)


### Features

- Large prompt fields
- Streams completions
- Copy completions as raw text
- Markdown parsing w/syntax highlighting
- Saves sessions/context in your browser's `localStorage`

## Developing

Create a copy `.env.example`, update the values and save it as `.env`. 

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
