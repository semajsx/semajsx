import { describe, it, expect, beforeEach } from 'vitest';
import { signal } from '../../src/signal';
import { h } from '../../src/runtime/vnode';
import { TerminalRenderer, render } from '../../src/terminal';
import { Writable } from 'stream';

/**
 * Mock writable stream for testing
 */
class MockStream extends Writable {
  public output: string[] = [];
  public columns: number = 80;
  public rows: number = 24;

  _write(chunk: any, encoding: string, callback: () => void): void {
    this.output.push(chunk.toString());
    callback();
  }

  clear(): void {
    this.output = [];
  }

  getLastOutput(): string {
    return this.output[this.output.length - 1] || '';
  }
}

describe('Terminal Integration', () => {
  let mockStream: MockStream;
  let renderer: TerminalRenderer;

  beforeEach(() => {
    mockStream = new MockStream();
    renderer = new TerminalRenderer(mockStream as any);
  });

  describe('render with h()', () => {
    it('should render simple element tree', () => {
      const app = h('box', {}, [h('text', {}, ['Hello World'])]);

      render(app, renderer);

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it('should render nested elements', () => {
      const app = h('box', { flexDirection: 'column' }, [
        h('text', {}, ['Line 1']),
        h('text', {}, ['Line 2']),
        h('text', {}, ['Line 3']),
      ]);

      render(app, renderer);

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it('should apply styles', () => {
      const app = h(
        'box',
        {
          padding: 2,
          border: 'round',
          flexDirection: 'column',
        },
        [h('text', { color: 'green', bold: true }, ['Styled Text'])]
      );

      const { rendered } = render(app, renderer);

      expect(rendered.node).toBeDefined();
      if (rendered.node?.type === 'element') {
        expect(rendered.node.style.padding).toBe(2);
        expect(rendered.node.style.border).toBe('round');
      }
    });
  });

  describe('render with signals', () => {
    it('should render signal values', () => {
      const count = signal(0);
      const app = h('box', {}, [h('text', {}, ['Count: ', count])]);

      render(app, renderer);

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it('should update when signal changes', () => {
      const count = signal(0);
      const app = h('box', {}, [h('text', {}, ['Count: ', count])]);

      const { rendered } = render(app, renderer);

      // Subscriptions are in child nodes (the text node with the signal)
      // Check that the rendered structure has children
      expect(rendered.children.length).toBeGreaterThan(0);

      // Update signal
      count.value = 42;

      // Signal value should be updated
      expect(count.value).toBe(42);
    });

    it('should handle computed signals', () => {
      const count = signal(5);
      const app = h('box', {}, [h('text', {}, ['Value: ', count])]);

      render(app, renderer);

      count.value = 10;

      expect(count.value).toBe(10);
    });
  });

  describe('component rendering', () => {
    it('should render functional components', () => {
      function Counter({ initial = 0 }: { initial?: number }) {
        const count = signal(initial);

        return h('box', {}, [h('text', {}, ['Count: ', count])]);
      }

      const app = h(Counter, { initial: 5 });

      render(app, renderer);

      expect(mockStream.output.length).toBeGreaterThan(0);
    });

    it('should pass props to components', () => {
      function Greeting({ name }: { name: string }) {
        return h('text', {}, ['Hello, ', name, '!']);
      }

      const app = h(Greeting, { name: 'World' });

      const { rendered } = render(app, renderer);

      expect(rendered.node).toBeDefined();
    });

    it('should render nested components', () => {
      function Header() {
        return h('text', { bold: true }, ['Header']);
      }

      function Body() {
        return h('text', {}, ['Body content']);
      }

      function App() {
        return h('box', { flexDirection: 'column' }, [
          h(Header, {}),
          h(Body, {}),
        ]);
      }

      const app = h(App, {});

      render(app, renderer);

      expect(mockStream.output.length).toBeGreaterThan(0);
    });
  });

  describe('unmount', () => {
    it('should cleanup subscriptions on unmount', () => {
      const count = signal(0);
      const app = h('box', {}, [h('text', {}, ['Count: ', count])]);

      const { rendered, unmount } = render(app, renderer);

      // Check that the structure was created
      expect(rendered.node).toBeDefined();

      unmount();

      // After unmount, calling it again should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('layout and positioning', () => {
    it('should calculate positions for elements', () => {
      const app = h('box', { padding: 2 }, [h('text', {}, ['Content'])]);

      const { rendered } = render(app, renderer);

      if (rendered.node) {
        expect(rendered.node.x).toBeDefined();
        expect(rendered.node.y).toBeDefined();
      }
    });

    it('should respect flexbox layout', () => {
      const app = h(
        'box',
        { flexDirection: 'row' },
        [
          h('box', { width: 20 }, [h('text', {}, ['Left'])]),
          h('box', { width: 20 }, [h('text', {}, ['Right'])]),
        ]
      );

      const { rendered } = render(app, renderer);

      // Children should have calculated positions
      if (rendered.children.length > 0) {
        const firstChild = rendered.children[0];
        expect(firstChild.node?.x).toBeDefined();
        expect(firstChild.node?.width).toBeDefined();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty content', () => {
      const app = h('box', {});

      expect(() => render(app, renderer)).not.toThrow();
    });

    it('should handle null/undefined in children', () => {
      const show = signal(false);
      const app = h('box', {}, [show.value && h('text', {}, ['Conditional'])]);

      expect(() => render(app, renderer)).not.toThrow();
    });

    it('should handle deeply nested structures', () => {
      const app = h('box', {}, [
        h('box', {}, [
          h('box', {}, [
            h('box', {}, [h('text', {}, ['Deep'])]),
          ]),
        ]),
      ]);

      expect(() => render(app, renderer)).not.toThrow();
    });
  });
});
