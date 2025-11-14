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
  ]
);

// Render to terminal
const renderer = new TerminalRenderer(process.stdout);
render(app, renderer);

// Auto re-render on signal changes
setInterval(() => {
  renderer.render();
}, 100);

// Cleanup on exit
process.on('SIGINT', () => {
  renderer.destroy();
  process.exit(0);
});
