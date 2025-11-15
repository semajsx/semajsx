import { startServer } from "../shared/server.cli";
import app from "./index.html";

startServer(app, {
  title: "🚀 Performance Test Server Started!",
  borderColor: "blue",
  features: [
    "✓ Batching optimization enabled",
    "✓ Keyed list reconciliation enabled",
    "✓ DOM node pooling enabled",
  ],
});
