import { Context } from "./context";
import { AksaRequest } from "./request";
import { Handler, Route, RouteMethod } from "./types";

interface TrieNode {
  children: { [key: string]: TrieNode };
  isTerminal?: boolean;
  route?: Route;
}

export class Router {
  private routes: Route[];
  private trie: TrieNode;

  constructor() {
    this.routes = [];

    const root: TrieNode = { children: {} };
    this.trie = root;

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

    this.buildTrie();
  }

  private buildTrie() {
    const root: TrieNode = { children: {} };

    for (const route of this.routes) {
      const pathSegments = route.path.split("/"); // Split path into segments

      let currentNode = root;
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const child = currentNode.children[segment];

        if (!child) {
          currentNode.children[segment] = { children: {} };
        }

        currentNode = currentNode.children[segment];

        // Early termination if remaining path segments don't match (optimization)
        if (i < pathSegments.length - 1 && !route.regex) {
          break; // No need to continue building for non-regex routes if remaining segments don't match literally
        }
      }

      currentNode.isTerminal = true; // Mark terminal node for matched route
      currentNode.route = route; // Store the associated route object
    }

    this.trie = root;
  }

  findNode(path: string): TrieNode | undefined {
    const pathSegments = path.split("/");

    let currentNode = this.trie;
    for (const segment of pathSegments) {
      currentNode = currentNode.children[segment];
      if (!currentNode) {
        return undefined; // No matching node found
      }
    }

    return currentNode;
  }

  findRouteTrie(path: string, method: string) {
    console.log(method);
    // Traverse the Trie and perform regex matching on terminal nodes:
    const node = this.findNode(path);
    if (node?.isTerminal) {
      return node.route;
    }
  }

  findRouteLinear(method: string, path: string) {
    for (const route of this.routes) {
      const { regex } = route;

      // Match URL and method with regular expression
      const match = regex.exec(path);

      if (match && method.toUpperCase() === route.method.toUpperCase()) {
        return route;
      }
    }
  }

  async match(ctx: Context) {
    const { url, method } = ctx.req.raw;
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    console.log(method, path);

    const route = this.findRouteLinear(method, path);

    if (!route) {
      return new Response("Not Found", { status: 404 });
    }

    const { regex, handler } = route;
    const match = regex.exec(path);
    const params: Record<string, string> = {};
    // Extract params
    if (match) {
      if (match.length > 1) {
        for (let i = 1; i < match.length; i++) {
          params[route.path.split("/")[i + 1].slice(1)] = match[i];
        }
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
