import http from "http";
import Aksa, { AksaResponse } from ".";

// TODO:
//
// adapter should follow these flow:
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
async function createAksaRequest(req: http.IncomingMessage) {
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
async function sendAksaResponse(
  res: http.ServerResponse,
  response: AksaResponse,
) {
  if (response instanceof Response) {
    console.log("status", response.status);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.ok) {
      try {
        let text = await response.text();
        console.log({ text });
        const data = JSON.parse(text);
        console.log({ data });
        res.write(text);
        res.end();
      } catch (error) {
        console.log(error);
      }
    } else {
      res.end();
    }
  } else if (typeof response == "string") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(response);
    res.end();
  } else if (typeof response == "object") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const json = JSON.stringify(response);
    res.write(json);
    res.end();
  } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("Something went wrong");
    res.end();
  }
}

function createAksaRequestHandler(app: Aksa) {
  return app.handle;
}

export function createRequestHandler(app: Aksa) {
  // creates a Fetch API request handler from the server build
  const handleRequest = createAksaRequestHandler(app);

  // returns an nodejs specific handler for the node server
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    // adapts the node.req to a Fetch API request
    const request = await createAksaRequest(req);

    // calls the app handler and receives a Fetch API response
    const response = handleRequest(request);

    // adapts the Fetch API response to the node.res
    sendAksaResponse(res, response);
  };
}
