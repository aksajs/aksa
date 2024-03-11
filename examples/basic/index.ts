import Aksa from "@aksajs/aksa";
import { createRequestHandler } from "@aksajs/aksa/src/adapter";
import http from "http";

const app = new Aksa()
  .get("/", () => "Hello world")
  .get("/json", () => ({ message: "hello" }));

http.createServer(createRequestHandler(app)).listen(3000);
