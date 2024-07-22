import { compose } from "./compose";
import { Context } from "./context";
import { AksaRequest } from "./request";
import { Router } from "./router";
import { Handler, Middleware, RouteMethod } from "./types";

export class Aksa {
  router: Router;
  private middlewares: Middleware[] = [];

  constructor() {
    this.router = new Router();
    this.handle = this.handle.bind(this);
    this.fetch = this.fetch.bind(this);
  }

  /**
   * Add a middleware handler
   */
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  private addRoute(method: RouteMethod, path: string, handler: Handler) {
    this.router.addRoute(method, path, handler);
  }

  /**
   * Add a GET route handler
   */
  get(path: string, handler: Handler) {
    this.addRoute("GET", path, handler);

    return this;
  }

  /**
   * Add a POST route handler
   */
  post(path: string, handler: Handler) {
    this.addRoute("POST", path, handler);

    return this;
  }

  private dispatch(req: Request) {
    const request = new AksaRequest(req);
    const ctx = new Context(request);
    const next = () => this.router.match(ctx);
    const composed = compose<Context>(this.middlewares);

    return (async () => {
      const context = await composed(ctx, next);

      if (!context.finalized) {
        throw new Error(
          "Context is not finalized. Did you forget to return a Response object or `await next()`?",
        );
      }

      return context.res;
    })();
  }

  /**
   * Entry point of your app
   */
  async handle(req: Request) {
    return this.dispatch(req);
  }

  /**
   * Entry point of your app
   */
  async fetch(req: Request) {
    return this.dispatch(req);
  }
}
