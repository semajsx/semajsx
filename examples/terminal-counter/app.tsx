import { signal } from '../../src/signal';
import { h } from '../../src/runtime/vnode';
import { TerminalRenderer, render } from '../../src/terminal';

// Counter component
function Counter() {
  const count = signal(0);

  // Auto-increment every second
  setInterval(() => {
    count.value++;
  }, 1000);

  return (
    <box
      flexDirection="column"
      padding={2}
      border="round"
      borderColor="cyan"
    >
      <text bold color="green">
        Terminal Counter
      </text>
      <text marginTop={1}>
        Count: {count}
      </text>
      <text dim marginTop={1}>
        Updates every second...
      </text>
    </box>
  );
}

// Main app
function App() {
  return (
    <box
      flexDirection="column"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Counter />
    </box>
  );
}

// Render to terminal
const renderer = new TerminalRenderer(process.stdout);
const { unmount } = render(<App />, renderer);

// Auto re-render on signal changes
setInterval(() => {
  renderer.render();
}, 100);

// Cleanup on exit
process.on('SIGINT', () => {
  unmount();
  process.exit(0);
});
