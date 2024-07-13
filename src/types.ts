import { Context } from "./context";

export type AksaResponse = Response;

export type Handler = (c: Context) => AksaResponse;

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type HandlerRegister = {
  method: HttpMethod;
  path: string;
  handler: Handler;
};
