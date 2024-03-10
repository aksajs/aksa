import http from "http";

export async function convertIncomingMessageToRequest(
  req: http.IncomingMessage,
) {
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
