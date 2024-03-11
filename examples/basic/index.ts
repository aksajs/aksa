import Aksa from "@aksajs/aksa";

new Aksa()
  .get("/", () => "Hello world")
  .get("/json", () => ({ message: "hello" }))
  .listen(3000);
