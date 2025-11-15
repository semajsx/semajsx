import { startServer } from "../shared/server.tsx";
import app from "./index.html";

startServer(app, {
  title: "✓ Server started successfully!",
  borderColor: "green",
});
