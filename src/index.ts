import { Context } from "./context";
import type {
  AksaResponse,
  Handler,
  HandlerRegister,
  HttpMethod,
} from "./types";

export default class Aksa {
  private handlers: Array<HandlerRegister> = [];

  constructor() {
    this.handle = this.handle.bind(this);
  }

  /**
   * add handler to registers
   */
  add(method: HttpMethod, path: string, handler: Handler) {
    const isExist = this.handlers.find(
      (h) => h.method === method && h.path === path,
    );
    if (!isExist) {
      this.handlers.push({ method, path, handler });
    } else {
      console.error(`handler for ${method} ${path} already exist`);
    }

    return this;
  }

  /**
   * add a GET handler
   */
  get(path: string, handler: Handler) {
    this.add("GET", path, handler);

    return this;
  }

  /**
   * add a POST handler
   */
  post(path: string, handler: Handler) {
    this.add("POST", path, handler);

    return this;
  }

  handle(req: Request): AksaResponse {
    const url = new URL(req.url ?? "");

    // find matching handler in registers
    const handler = this.handlers.find(
      (i) => i.path == url.pathname && i.method == req.method,
    );

    console.log(req.method, url.pathname);

    if (!handler) {
      const res = new Response("Not Found", { status: 404 });
      return res;
    }

    const ctx = new Context(req);
    const res = handler.handler(ctx);
    return res;
  }

  fetch(req: Request): AksaResponse {
    return this.handle(req);
  }
}
