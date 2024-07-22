import { Context } from "./context";
import { Middleware } from "./types";

interface ComposeContext {
  finalized: boolean;
  res: unknown;
}

/**
 * Compose middleware functions into single function
 */
export const compose = <C extends ComposeContext>(
  middlewares: Middleware[],
) => {
  return (ctx: C, next?: Function) => {
    let index = -1; // Track current middleware index

    async function dispatch(i: number) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;

      let res;
      let isError;
      let handler;

      if (middlewares[i]) {
        handler = middlewares[i];
      } else {
        handler = (i === middlewares.length && next) || undefined;
      }

      if (!handler) {
        res = new Response("Not Found", { status: 404 });
      } else {
        try {
          res = await handler(ctx, () => {
            return dispatch(i + 1);
          });
        } catch (err) {
          if (err instanceof Error && ctx instanceof Context) {
            // ctx.error = err
            res = new Response(err.message, { status: 500 });
            isError = true;
          } else {
            throw err;
          }
        }
      }

      if (res && (ctx.finalized === false || isError)) {
        ctx.res = res;
        ctx.finalized = true;
      }

      return ctx;
    }

    return dispatch(0);
  };
};
