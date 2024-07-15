import type { Context } from "./context";

export type Handler = (c: Context) => Response;

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
