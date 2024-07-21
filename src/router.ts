import { Context } from "./context";
import { AksaRequest } from "./request";
import { Handler, Middleware, Route, RouteMethod } from "./types";

export class Router {
  private routes: Route[];
  private middlewares: Middleware[] = [];

  constructor() {
    this.routes = [];

    this.match = this.match.bind(this);
  }

  addRoute(method: RouteMethod, path: string, handler: Handler) {
    // Validate route path format and method
    if (!path.startsWith("/")) {
      throw new Error('Invalid route: path must start with "/"');
    }

    // Check for dynamic segments using regular expression
    const routeRegex = path.replace(/:[^/]+/g, "([^/]+)");

    this.routes.push({
      method,
      path,
      handler,
      regex: new RegExp(`^${routeRegex}$`),
    });
  }

  addMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  async match(req: Request) {
    const request = new AksaRequest(req);
    let ctx = new Context(request);
    const middlewares = this.middlewares;
    const next = () => this._nextRoute(ctx);

    let index = -1; // Track current middleware index

    async function dispatch(i: number) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;

      let res;
      let handler;

      console.log(i);

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

    console.log(ctx.res);

    return ctx.res;

    // try {
    //   // Apply middleware functions before route matching
    //   const response = await next();
    //   console.log(response);
    //   return response;
    // } catch (error) {
    //   if (error instanceof StopMiddleware) {
    //     // Ignore StopMiddleware exception, indicating middleware stopped chain
    //     return;
    //   }
    //   throw error; // Re-throw other errors
    // }
  }

  async _nextRoute(ctx: Context) {
    const { url, method } = ctx.req.raw;
    const urlObj = new URL(url);

    console.log(method, urlObj.pathname);

    for (const route of this.routes) {
      const { regex, handler } = route;

      // Match URL and method with regular expression
      const match = regex.exec(urlObj.pathname);

      if (match && method.toUpperCase() === route.method.toUpperCase()) {
        console.log(route);

        const params: Record<string, string> = {};
        if (match.length > 1) {
          // Extract params
          for (let i = 1; i < match.length; i++) {
            params[route.path.split("/")[i + 1].slice(1)] = match[i];
          }
        }

        // Wrap handler function in a try-catch block for error handling
        try {
          const request = new AksaRequest(ctx.req.raw, params);
          ctx.req = request;
          return handler(ctx);
        } catch (error) {
          console.error("Error in route handler:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}

class StopMiddleware extends Error {}
