import { Router } from "./router";
import { Handler, RouteMethod } from "./types";

export class Aksa {
  router: Router;

  constructor() {
    this.router = new Router();
    this.handle = this.handle.bind(this);
    this.fetch = this.fetch.bind(this);
  }

  /**
   * add route
   */
  add(method: RouteMethod, path: string, handler: Handler) {
    this.router.addRoute(method, path, handler);
  }

  /**
   * add a GET route handler
   */
  get(path: string, handler: Handler) {
    this.add("GET", path, handler);

    return this;
  }

  /**
   * add a POST route handler
   */
  post(path: string, handler: Handler) {
    this.add("POST", path, handler);

    return this;
  }

  async handle(req: Request): Promise<Response> {
    return this.router.match(req);
  }

  async fetch(req: Request): Promise<Response> {
    return this.router.match(req);
  }
}
