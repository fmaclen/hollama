# Self-hosting (with Docker)

- [Getting started](#getting-started)
- [Updating to the latest version](#updating-to-the-latest-version)
- [Connecting to an Ollama server hosted elsewhere](#connecting-to-an-ollama-server-hosted-elsewhere)
- [Configuring allowed hosts](#configuring-allowed-hosts)

## Getting started

To host your own Hollama server, [install Docker](https://www.docker.com/products/docker-desktop/) and run the command below in your favorite terminal:

```shell
docker run --rm -d -p 4173:4173 --name hollama ghcr.io/fmaclen/hollama:latest
```

Then visit [http://localhost:4173](http://localhost:4173)

## Updating to the latest version

To update, first stop the container:

```shell
docker stop hollama
```

Then pull the latest version:

```shell
docker pull ghcr.io/fmaclen/hollama:latest
```

Finally, start the container again:

```shell
docker run --rm -d -p 4173:4173 --name hollama ghcr.io/fmaclen/hollama:latest
```

## Connecting to an Ollama server hosted elsewhere

If you are using the publicly hosted version or your Docker server is on a separate device than the Ollama server you'll have to set the domain in `OLLAMA_ORIGINS`. [Learn more in Ollama's docs](https://github.com/ollama/ollama/blob/main/docs/faq.md#how-do-i-configure-ollama-server).

```bash
OLLAMA_ORIGINS=https://hollama.fernando.is ollama serve
```

## Configuring allowed hosts

When hosting Hollama behind a reverse proxy or in a Kubernetes environment, you'll need to specify which domains are allowed to access the application. Use the `VITE_ALLOWED_HOSTS` environment variable to set this:

```shell
docker run --rm -d -p 4173:4173 \
  -e VITE_ALLOWED_HOSTS='your-domain.com,another-domain.com' \
  --name hollama ghcr.io/fmaclen/hollama:latest
```

Multiple domains can be specified by separating them with commas. If not specified, only 'localhost' will be allowed.
