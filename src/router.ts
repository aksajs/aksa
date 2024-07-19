import { Context } from "./context";
import { AksaRequest } from "./request";
import { Handler, Route, RouteMethod } from "./types";

export class Router {
  private routes: Route[];
  constructor() {
    this.routes = [];
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

  async match(req: Request) {
    const { url, method } = req;

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
          const request = new AksaRequest(req, params);
          const ctx = new Context(request);
          return await handler(ctx);
        } catch (error) {
          console.error("Error in route handler:", error);
          return new Response("Internal Server Error", { status: 500 });
        }
      }
    }

    return new Response("Not Found", { status: 404 });
  }
}
