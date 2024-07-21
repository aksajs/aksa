import type { Context } from "./context";

export type Handler = (c: Context) => Promise<Response> | Response;

export type Next = () => Promise<Response | void>;

export type Middleware = (c: Context, next: Next) => Promise<Response | void>;

export type RouteMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "HEAD"
  | "OPTIONS";

export type Route = {
  method: RouteMethod;
  path: string;
  handler: Handler;
  regex: RegExp;
};
