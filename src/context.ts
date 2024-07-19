import { AksaRequest } from "./request";

export class Context {
  req: AksaRequest;

  constructor(req: AksaRequest) {
    this.req = req;
  }

  text(str: string) {
    return new Response(str);
  }

  json(obj: any) {
    return new Response(JSON.stringify(obj));
  }
}
