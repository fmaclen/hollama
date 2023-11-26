# Hollama

A minimal web-UI for talking to [Ollama](https://github.com/jmorganca/ollama/) servers.

> ![static-site-conversion hollama pages dev_](https://github.com/fmaclen/hollama/assets/1434675/55137511-f2f0-4407-9c0c-c6fb661a83b0)
> ![static-site-conversion hollama pages dev_ (1)](https://github.com/fmaclen/hollama/assets/1434675/666513f7-f9e3-4fc1-9032-b1710ec13a5a)


### Features

- Streams responses
- Saves sessions/context in a local JSON file (though it would be interesting to move that behavior to the browser's `localStorage` so it can run on Cloudflare Pages)
- Uses the browser's built-in TTS to read the last AI message out loud

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
