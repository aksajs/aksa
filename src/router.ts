import { Handler } from ".";

export default class Router {
  handlers: Record<string, Handler> = {};

  constructor() {
    this.handler = this.handler.bind(this);
  }

  get(path: string, handler: Handler) {
    this.handlers[path] = handler;
  }

  handle(req: Request) {
    const handler = this.handlers[req.url];
    if (!handler) {
      console.error("handler not found: ", req.url);
      return new Response("Not Found", { status: 404 });
    }
    const r = handler(req);
    console.log({ r });
    return r;
  }

  handler(req: Request) {
    return this.handle(req);
  }
}
