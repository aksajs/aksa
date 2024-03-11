export type AksaResponse = Response | string | object | void;

export type RequestHandler = (req: Request) => AksaResponse;

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

type HandlerRegister = {
  method: HttpMethod;
  path: string;
  handler: RequestHandler;
};

export default class Aksa {
  handlers: Array<HandlerRegister> = [];

  constructor() {
    this.handle = this.handle.bind(this);
  }

  /**
   * add handler to registers
   */
  add(method: HttpMethod, path: string, handler: RequestHandler) {
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

  get(path: string, handler: RequestHandler) {
    this.add("GET", path, handler);

    return this;
  }

  post(path: string, handler: RequestHandler) {
    this.add("POST", path, handler);

    return this;
  }

  handle(req: Request): AksaResponse {
    const url = new URL(req.url ?? "");

    // find register
    const h = this.handlers.find(
      (i) => i.path == url.pathname && i.method == req.method,
    );

    console.log(req.method, url.pathname);

    let res;
    if (!h) {
      res = new Response("Not Found", { status: 404 });
      return res;
    }
    res = h.handler(req);
    return res;
  }
}
