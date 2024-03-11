import http from "http";
import type { AksaResponse } from ".";

// TODO:
//
// adapter should export these functions:
//
// - createAksaRequest(req)
//   adapts node.req to Fetch API request
//
// - createAksaRequestHandler(request)
//   calls the app handler, receives a Fetch API response
//   returns a Fetch API Response
//
// - sendAksaResponse(res, response);
//   adapts the Fetch API Response to the node.res

/**
 * adapts node.req to Fetch API request
 */
export async function createAksaRequest(req: http.IncomingMessage) {
  const headers = new Headers();
  for (const key in req.headers) {
    if (req.headers[key]) {
      headers.append(key, req.headers[key] as string);
    }
  }

  let body;
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    // Handle potential body based on your implementation (e.g., parsing from buffers)
    // This example assumes a simple string body
    body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => {
        data += chunk.toString();
      });
      req.on("end", () => {
        resolve(data);
      });
      req.on("error", (err) => {
        reject(err);
      });
    });
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  return new Request(url ?? "", {
    method: req.method,
    headers,
    body: body as string,
  });
}

/**
 *  adapts the Fetch API Response to the node.res
 */
export function sendAksaResponse(
  res: http.ServerResponse,
  response: AksaResponse,
) {
  if (response instanceof Response) {
    res.writeHead(response.status, Object.fromEntries(response.headers));
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("Hello World");
  res.end();
}
