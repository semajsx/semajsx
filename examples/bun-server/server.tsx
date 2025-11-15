import app from "./index.html";

const server = Bun.serve({
  routes: {
    "/": app,
  },
});

console.log(server.url.toString());
