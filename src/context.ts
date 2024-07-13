export class Context {
  request: Request;

  constructor(req: Request) {
    this.request = req;
  }

  text(str: string) {
    return new Response(str);
  }

  json(obj: any) {
    return new Response(JSON.stringify(obj));
  }
}
