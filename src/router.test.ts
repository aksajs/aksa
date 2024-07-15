import { test, expect } from "bun:test";

test("router test", () => {
  const path = "/";
  const routeRegex = path.replace(/:[^/]+/g, "([^/]+)");
  const regex = new RegExp(`^${routeRegex}$`);

  const match = regex.exec("/");
  console.log(match);

  expect(match).toEqual(["/"]);
});
