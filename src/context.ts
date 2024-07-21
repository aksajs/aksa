import { AksaRequest } from "./request";

type Data = string | ArrayBuffer | ReadableStream;

export class Context {
  req: AksaRequest;
  headers: Headers | undefined;
  finalized: boolean = false;
  res: Response | undefined;

  constructor(req: AksaRequest) {
    this.req = req;

    this.newResponse = this.newResponse.bind(this);
  }

  /**
   * set the headers
   */
  header(name: string, value: string | undefined) {
    this.headers ??= new Headers();

    if (value) {
      this.headers.set(name, value);
    } else {
      this.headers.delete(name);
    }
  }

  newResponse(data: Data | null, arg?: number | ResponseInit) {
    const status = typeof arg === "number" ? arg : arg?.status;
    return new Response(data, { status, headers: this.headers });
  }

  text(str: string) {
    this.header("Content-Type", "text/plain");
    return this.newResponse(str);
  }

  json(obj: any) {
    this.header("Content-Type", "application/json");
    return this.newResponse(JSON.stringify(obj));
  }
}
