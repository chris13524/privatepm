FROM node:8-alpine

COPY . /app
WORKDIR /app

RUN npm install && \
    npm run build:prerender

FROM nginx:1.15.3

COPY --from=0 /app/dist/browser/ /usr/share/nginx/html
COPY src/robots.txt /usr/share/nginx/html/robots.txt
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
