# Hollama

A minimal web-UI for talking to [Ollama](https://github.com/jmorganca/ollama/) servers.

### Features

- Large prompt fields with code editor features
- Markdown parsing w/syntax highlighting
- Easily copy markdown as raw text
- Customizable system prompts
- Saves all changes on your browser's `localStorage`
- Desktop & mobile friendly layout
- Light & dark themes
- Retryable completions
- Streams completions

### Live demo

> [!TIP]
> The latest version of **Hollama** is available at: [https://hollama.fernando.is](https://hollama.fernando.is)

No sign up is required and data is _100% stored locally on your browser_.

> ![session](tests/docs.test.ts-snapshots/session.png)

> ![knowledge](tests/docs.test.ts-snapshots/knowledge.png)

> ![session-new](tests/docs.test.ts-snapshots/session-new.png)

> ![settings](tests/docs.test.ts-snapshots/settings.png)

### Self-host (Docker)

To host your own Hollama server, [install Docker](https://www.docker.com/products/docker-desktop/) and run the command below in your favorite terminal:

```shell
docker run --rm -d -p 4173:4173 ghcr.io/fmaclen/hollama:latest
```

Then visit [http://localhost:4173](http://localhost:4173).

#### Connecting to an Ollama server

If you are using the publicly hosted version or your Docker server is on a separate device than the Ollama server you'll have to set the domain in `OLLAMA_ORIGINS`. [Learn more in Ollama's docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server).

```bash
OLLAMA_ORIGINS=https://hollama.fernando.is ollama serve
```

## Developing

Install dependencies with `npm install`, start a development server:

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
