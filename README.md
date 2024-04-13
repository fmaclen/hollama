# Hollama

A minimal web-UI for talking to [Ollama](https://github.com/jmorganca/ollama/) servers.

> ![image](https://github.com/fmaclen/hollama/assets/1434675/da94d369-3642-45b2-8843-e4ffe648ffcf)
> ![localhost_5173_iavqp6 (1)](https://github.com/fmaclen/hollama/assets/1434675/8ad2e4d0-94e7-4d9e-ac62-69a05b00a77f)


### Features

- Large prompt fields
- Streams responses
- Saves sessions/context in your browser's `localStorage`
- Markdown parsing

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
