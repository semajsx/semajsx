import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { signal, computed } from '../../src/signal';
import { render, unmount } from '../../src/runtime/render';
import { h } from '../../src/runtime/vnode';

describe('render', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render simple element', () => {
    const vnode = h('div', { class: 'test' }, 'Hello');
    render(vnode, container);

    expect(container.innerHTML).toContain('<div class="test">Hello</div>');
  });

  it('should render nested elements', () => {
    const vnode = h('div', null, h('h1', null, 'Title'), h('p', null, 'Content'));
    render(vnode, container);

    expect(container.querySelector('h1')?.textContent).toBe('Title');
    expect(container.querySelector('p')?.textContent).toBe('Content');
  });

  it('should render signal as text', () => {
    const count = signal(5);
    const vnode = h('div', null, count);
    render(vnode, container);

    expect(container.textContent).toContain('5');

    count.value = 10;
    expect(container.textContent).toContain('10');
  });

  it('should render computed signal', () => {
    const count = signal(5);
    const doubled = computed([count], c => c * 2);
    const vnode = h('div', null, doubled);
    render(vnode, container);

    expect(container.textContent).toContain('10');

    count.value = 10;
    expect(container.textContent).toContain('20');
  });

  it('should render signal VNode', () => {
    const show = signal(true);
    const content = computed([show], s => (s ? h('p', null, 'Visible') : h('p', null, 'Hidden')));
    const vnode = h('div', null, content);
    render(vnode, container);

    expect(container.textContent).toContain('Visible');

    show.value = false;
    expect(container.textContent).toContain('Hidden');
  });

  it('should handle signal props', () => {
    const className = signal('initial');
    const vnode = h('div', { class: className }, 'Test');
    render(vnode, container);

    const div = container.querySelector('div');
    expect(div?.className).toBe('initial');

    className.value = 'updated';
    expect(div?.className).toBe('updated');
  });

  it('should handle event handlers', () => {
    let clicked = false;
    const vnode = h(
      'button',
      {
        onclick: () => {
          clicked = true;
        },
      },
      'Click me'
    );
    render(vnode, container);

    const button = container.querySelector('button');
    button?.click();

    expect(clicked).toBe(true);
  });

  it('should render components', () => {
    const Greeting = ({ name }: { name: string }) => {
      return h('h1', null, `Hello, ${name}!`);
    };

    const vnode = h(Greeting, { name: 'World' });
    render(vnode, container);

    expect(container.textContent).toBe('Hello, World!');
  });

  it('should render fragment', () => {
    const vnode = h(
      'div',
      null,
      h(Symbol.for('semajsx.fragment'), null, h('span', null, 'One'), h('span', null, 'Two'))
    );
    render(vnode, container);

    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('One');
    expect(spans[1].textContent).toBe('Two');
  });

  it('should unmount and cleanup subscriptions', () => {
    const count = signal(0);
    const vnode = h('div', null, count);
    const rendered = render(vnode, container);

    // Store reference to the div before unmount
    const div = container.querySelector('div');
    expect(div?.textContent).toContain('0');

    count.value = 5;
    expect(div?.textContent).toContain('5');

    // Unmount removes the node from DOM
    unmount(rendered);
    expect(container.children.length).toBe(0);

    // After unmount, signal changes should not update (subscription cleaned up)
    count.value = 10;

    // The original div should still show '5' since it's no longer subscribed
    expect(div?.textContent).toContain('5');
  });
});
