import { signal } from '../../src/signal';
import { h } from '../../src/runtime/vnode';
import { TerminalRenderer, render } from '../../src/terminal';

// Simple counter without JSX
const count = signal(0);

// Auto-increment every second
setInterval(() => {
  count.value++;
}, 1000);

// Build UI using h() function
const app = h(
  'box',
  {
    flexDirection: 'column',
    padding: 2,
    border: 'round',
    borderColor: 'cyan',
  },
  [
    h('text', { bold: true, color: 'green' }, ['Terminal Counter']),
    h('text', { marginTop: 1 }, ['Count: ', count]),
    h('text', { dim: true, marginTop: 1 }, ['Updates every second...']),
    h('text', { dim: true, marginTop: 1, color: 'yellow' }, [
      'Press Ctrl+C or ESC to exit',
    ]),
  ]
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
  process.stdin.on('data', (data) => {
    const key = data.toString();

    // Ctrl+C (\u0003) or ESC (\u001b) to exit
    if (key === '\u0003' || key === '\u001b') {
      renderer.destroy();
      process.exit(0);
    }

    // You can add more key handlers here
    // For example: 'q' to quit, 'r' to reset, etc.
  });
}

// Fallback for non-TTY environments
process.on('SIGINT', () => {
  renderer.destroy();
  process.exit(0);
});
