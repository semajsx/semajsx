/** @jsxImportSource semajsx/terminal */
import { print } from "semajsx/terminal";
import app from "./index.html";

const server = Bun.serve({
  routes: {
    "/": app,
  },
});

const url = server.url.toString();
const hostname = server.hostname;
const port = server.port;

// Beautiful terminal output using the print function
print(
  <box flexDirection="column">
    <box border="round" borderColor="blue" padding={1} marginBottom={1}>
      <text bold color="blue">
        🚀 Performance Test Server Started!
      </text>
    </box>

    <box flexDirection="column" paddingLeft={1}>
      <box flexDirection="row" marginBottom={1}>
        <text bold>Local:</text>
        <text color="cyan">{url}</text>
      </box>

      <box flexDirection="row" marginBottom={1}>
        <text bold>Host:</text>
        <text color="cyan">{hostname}</text>
      </box>

      <box flexDirection="row">
        <text bold>Port:</text>
        <text color="yellow">{port}</text>
      </box>
    </box>

    <box marginTop={1} paddingLeft={1}>
      <text color="green">✓ Batching optimization enabled</text>
    </box>
    <box paddingLeft={1}>
      <text color="green">✓ Keyed list reconciliation enabled</text>
    </box>
    <box paddingLeft={1}>
      <text color="green">✓ DOM node pooling enabled</text>
    </box>

    <box marginTop={1} paddingLeft={1}>
      <text dim>Press Ctrl+C to stop</text>
    </box>
  </box>,
);
