import { test, expect } from "bun:test";

test("router test", () => {
  const path = "/users/:id";
  const routeRegex = path.replace(/:[^/]+/g, "([^/]+)");
  const regex = new RegExp(`^${routeRegex}$`);

  const url = "/users/123";
  const match = url.match(regex);
  console.log(match);

  expect(match).toEqual(["/users/123", "123"]);
});
