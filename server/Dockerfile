FROM node:8-alpine

COPY . /app
WORKDIR /app

RUN npm install

HEALTHCHECK --timeout=5s CMD curl -f http://localhost:80 || exit 1

ENV LISTEN=80

CMD ["node", "/app/src/index.js"]