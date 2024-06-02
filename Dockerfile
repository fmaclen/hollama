FROM node:20-alpine

WORKDIR /app

ENV ADAPTER 'docker-node'

COPY . .

RUN npm ci
RUN npm run build

CMD ["npx", "vite", "preview", "--host"]
