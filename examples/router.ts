import Aksa from "../src";
import Router from "./router";

const app = new Aksa();
const router = new Router();

router.get("/", (req: Request) => {
  console.log("url", req.url);
  return { message: "hello" };
});

app.use(router.middleware);
app.listen(3000);
