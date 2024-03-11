import http from "http";
import { convertIncomingMessageToRequest } from "./utils";

export type Handler = (
  req: Request,
) => Response | Promise<Response> | string | object | void;

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
  handler: Handler;
};

export default class Aksa {
  handlers: Array<HandlerRegister> = [];

  constructor() {
    this.transformHttpMsg = this.transformHttpMsg.bind(this);
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

  get(path: string, handler: Handler) {
    this.add("GET", path, handler);

    return this;
  }

  post(path: string, handler: Handler) {
    this.add("POST", path, handler);

    return this;
  }

  handle(req: Request): Response | Promise<Response> | string | object | void {
    const url = new URL(req.url ?? "");

    // find register
    const h = this.handlers.find(
      (i) => i.path == url.pathname && i.method == req.method,
    );

    console.log(req.method, url.pathname, h);

    let res;
    if (!h) {
      res = new Response("Not Found", { status: 404 });
      return res;
    }
    res = h.handler(req);
    return res;
  }

  // TODO:
  // - need to moved to adapter
  async transformHttpMsg(req: http.IncomingMessage, res: http.ServerResponse) {
    // transform from nodejs http Request Response to agnostic Request and Response
    //
    const request = await convertIncomingMessageToRequest(req);
    const response = this.handle(request);

    console.log({ response });

    // handle write header from Response

    if (response instanceof Response) {
      res.writeHead(response.status, Object.fromEntries(response.headers));
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Hello World");
    res.end();
  }

  listen(port: number) {
    http.createServer(this.transformHttpMsg).listen(port ?? 3000);
  }
}
