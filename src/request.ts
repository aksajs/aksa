export class AksaRequest {
  raw: Request;
  method: string;
  url: string;
  path: string;
  params?: Record<string, string>;

  constructor(req: Request, params?: Record<string, string>) {
    this.raw = req;
    this.method = req.method;
    this.url = req.url;
    this.path = req.url.split("/")[1];
    this.params = params;
  }

  headers() {
    return this.raw.headers;
  }

  body() {
    return this.raw.body;
  }

  text() {
    return this.raw.text();
  }

  json() {
    return this.raw.json();
  }

  formData() {
    return this.raw.formData();
  }

  blob() {
    return this.raw.blob();
  }
}
