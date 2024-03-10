import Aksa from "../src";

new Aksa()
  .get("/", () => "Hello world")
  .get("/json", () => ({ message: "hello" }))
  .listen(3000);
