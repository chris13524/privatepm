FROM chris13524/angular-cli:6.2.3

COPY . /app
WORKDIR /app

RUN npm install && \
    ng build --prod && \
    cp /app/dist/browser/index.html /tmp/app.html && \
    npm run build:prerender

FROM nginx:1.15.3

COPY --from=0 /app/dist/browser/ /usr/share/nginx/html
COPY --from=0 /tmp/app.html /usr/share/nginx/html/
COPY src/robots.txt /usr/share/nginx/html/robots.txt
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
