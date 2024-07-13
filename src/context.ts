export class Context {
  req: Request;

  constructor(req: Request) {
    this.req = req;
  }

  text(str: string) {
    return new Response(str);
  }

  json(obj: any) {
    return new Response(JSON.stringify(obj));
  }
}
