/** @jsxImportSource ../../src */
import { signal } from '../../src/signal';
import { TerminalRenderer, render, when } from '../../src/terminal';

// Simple counter with JSX
const count = signal(0);
const showExitHint = signal(true);

// Auto-increment every second
setInterval(() => {
  count.value++;
}, 1000);

// Conditional exit hint - hidden on exit
const exitHint = when(
  showExitHint,
  <text dim marginTop={1} color="yellow">
    Press Ctrl+C or ESC to exit
  </text>
);

// Build UI using JSX
const app = (
  <box flexDirection="column" padding={2} border="round" borderColor="cyan">
    <text bold color="green">
      Terminal Counter
    </text>
    <text marginTop={1}>Count: {count}</text>
    <text dim marginTop={1}>
      Updates every second...
    </text>
    {exitHint}
  </box>
);

// Render to terminal
const renderer = new TerminalRenderer(process.stdout);
render(app, renderer);

// Enable stdin to receive input
if (process.stdin.isTTY) {
  process.stdin.resume();
}

// Auto re-render on signal changes
setInterval(() => {
  renderer.render();
}, 100);

// Handle keyboard input in raw mode
if (process.stdin.isTTY) {
  process.stdin.on('data', data => {
    const key = data.toString();

    // Ctrl+C (\u0003) or ESC (\u001b) to exit
    if (key === '\u0003' || key === '\u001b') {
      // Hide exit hint before final render
      showExitHint.value = false;

      // Wait for signal to update, then destroy
      setTimeout(() => {
        renderer.destroy();
        process.exit(0);
      }, 50);
    }

    // You can add more key handlers here
    // For example: 'q' to quit, 'r' to reset, etc.
  });
}

// Fallback for non-TTY environments
process.on('SIGINT', () => {
  showExitHint.value = false;
  setTimeout(() => {
    renderer.destroy();
    process.exit(0);
  }, 50);
});
