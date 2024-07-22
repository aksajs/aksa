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

  private async dispatch(req: Request) {
    const request = new AksaRequest(req);
    let ctx = new Context(request);
    const middlewares = this.middlewares;
    const next = () => this.router.match(ctx);

    let index = -1; // Track current middleware index

    async function dispatch(i: number) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;

      let res;
      let handler;

      if (middlewares[i]) {
        handler = middlewares[i];
      } else {
        handler = (i === middlewares.length && next) || undefined;
      }

      if (!handler) {
        res = new Response("Not Found", { status: 404 });
      } else {
        try {
          res = await handler(ctx, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && ctx instanceof Context) {
            return;
          } else {
            throw err;
          }
        }
      }

      if (res && ctx.finalized === false) {
        ctx.res = res;
        ctx.finalized = true;
      }
    }

    await dispatch(0);

    if (!ctx.finalized) {
      throw new Error(
        "Context is not finalized. Did you forget to return a Response object or `await next()`?",
      );
    }

    return ctx.res;
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
