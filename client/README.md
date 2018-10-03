# PrivatePM Client

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.2.3.

## Dependencies

You'll need to have Node, NPM, and the Angular CLI installed. You may install these locally on your machine, or use a Docker container:

`docker run -it --rm -p 4000:4000 -p 8080:8080 -v $PWD:/app -w /app -u $(id -u):$(id -g) chris13524/angular-cli:6.2.3 bash`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

Run `npm run build:ssr` to build the server-side renderer. Serve with `npm run serve:ssr`.

Run `npm run build:prerender` to pre-render all the Angular routes without requiring an express server like server-side rendering does. Serve with `npm run serve:prerender`. This is the method used by the production image.

See [this](https://github.com/angular/universal-starter#build-time-prerendering-vs-server-side-renderingssr) for the difference between server-side rendering and pre-rendering. Pre-rendering is more efficient on the server, but doesn't pre-render any dynamic content. If dynamic content is wanted to be pre-rendered, use server-side rendering.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
