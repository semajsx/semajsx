import type { VNode, Signal, Component, Fragment, ErrorBoundary, Suspense } from './types';

// Helper type to make properties optionally accept Signals
type MaybeSignal<T> = T | Signal<T>;

// Base element attributes
interface BaseElementAttributes {
  key?: string | number;
  ref?: any;
  children?: any;
}

// Base HTML attributes
interface BaseHTMLAttributes extends BaseElementAttributes {
  // Event handlers
  onClick?: (event: Event) => void;
  onInput?: (event: Event) => void;
  onChange?: (event: Event) => void;
  onSubmit?: (event: Event) => void;
  onFocus?: (event: Event) => void;
  onBlur?: (event: Event) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;

  // Standard HTML attributes - can be signals
  id?: MaybeSignal<string>;
  className?: MaybeSignal<string>;
  class?: MaybeSignal<string>;
  style?: MaybeSignal<string | Record<string, string | number>>;
  title?: MaybeSignal<string>;
  role?: MaybeSignal<string>;
  tabIndex?: MaybeSignal<number>;
  hidden?: MaybeSignal<boolean>;
  
  // Data and ARIA attributes
  [key: `data-${string}`]: any;
  [key: `aria-${string}`]: any;
}

// HTML attributes type
type HTMLAttributes = BaseHTMLAttributes;

declare global {
  namespace JSX {
    interface Element extends VNode {}
    
    interface IntrinsicElements {
      // Document structure
      html: HTMLAttributes;
      head: HTMLAttributes;
      body: HTMLAttributes;
      title: HTMLAttributes;
      
      // Content sections
      main: HTMLAttributes;
      section: HTMLAttributes;
      article: HTMLAttributes;
      aside: HTMLAttributes;
      header: HTMLAttributes;
      footer: HTMLAttributes;
      nav: HTMLAttributes;
      address: HTMLAttributes;
      
      // Headings
      h1: HTMLAttributes;
      h2: HTMLAttributes;
      h3: HTMLAttributes;
      h4: HTMLAttributes;
      h5: HTMLAttributes;
      h6: HTMLAttributes;
      
      // Text content
      div: HTMLAttributes;
      span: HTMLAttributes;
      p: HTMLAttributes;
      pre: HTMLAttributes;
      blockquote: HTMLAttributes;
      hr: HTMLAttributes;
      br: HTMLAttributes;
      
      // Inline text semantics
      a: HTMLAttributes & {
        href?: MaybeSignal<string>;
        target?: MaybeSignal<string>;
        rel?: MaybeSignal<string>;
        download?: MaybeSignal<boolean | string>;
      };
      b: HTMLAttributes;
      bdi: HTMLAttributes;
      bdo: HTMLAttributes;
      cite: HTMLAttributes;
      code: HTMLAttributes;
      data: HTMLAttributes;
      dfn: HTMLAttributes;
      em: HTMLAttributes;
      i: HTMLAttributes;
      kbd: HTMLAttributes;
      mark: HTMLAttributes;
      q: HTMLAttributes;
      rp: HTMLAttributes;
      rt: HTMLAttributes;
      ruby: HTMLAttributes;
      s: HTMLAttributes;
      samp: HTMLAttributes;
      small: HTMLAttributes;
      strong: HTMLAttributes;
      sub: HTMLAttributes;
      sup: HTMLAttributes;
      time: HTMLAttributes;
      u: HTMLAttributes;
      var: HTMLAttributes;
      wbr: HTMLAttributes;
      
      // Lists
      ol: HTMLAttributes;
      ul: HTMLAttributes;
      li: HTMLAttributes;
      dl: HTMLAttributes;
      dt: HTMLAttributes;
      dd: HTMLAttributes;
      
      // Forms
      form: HTMLAttributes & {
        action?: MaybeSignal<string>;
        method?: MaybeSignal<string>;
      };
      fieldset: HTMLAttributes;
      legend: HTMLAttributes;
      label: HTMLAttributes & {
        htmlFor?: MaybeSignal<string>;
      };
      input: HTMLAttributes & {
        type?: MaybeSignal<string>;
        value?: MaybeSignal<string | number>;
        placeholder?: MaybeSignal<string>;
        disabled?: MaybeSignal<boolean>;
        required?: MaybeSignal<boolean>;
        name?: MaybeSignal<string>;
        checked?: MaybeSignal<boolean>;
      };
      button: HTMLAttributes & {
        type?: MaybeSignal<"button" | "submit" | "reset">;
        disabled?: MaybeSignal<boolean>;
      };
      select: HTMLAttributes & {
        value?: MaybeSignal<string | string[]>;
        multiple?: MaybeSignal<boolean>;
        disabled?: MaybeSignal<boolean>;
        name?: MaybeSignal<string>;
      };
      option: HTMLAttributes & {
        value?: MaybeSignal<string>;
        selected?: MaybeSignal<boolean>;
        disabled?: MaybeSignal<boolean>;
      };
      textarea: HTMLAttributes & {
        value?: MaybeSignal<string>;
        placeholder?: MaybeSignal<string>;
        disabled?: MaybeSignal<boolean>;
        rows?: MaybeSignal<number>;
        cols?: MaybeSignal<number>;
      };
      
      // Media
      img: HTMLAttributes & {
        src?: MaybeSignal<string>;
        alt?: MaybeSignal<string>;
        width?: MaybeSignal<string | number>;
        height?: MaybeSignal<string | number>;
        loading?: MaybeSignal<"lazy" | "eager">;
      };
      
      // Tables
      table: HTMLAttributes;
      thead: HTMLAttributes;
      tbody: HTMLAttributes;
      tfoot: HTMLAttributes;
      tr: HTMLAttributes;
      th: HTMLAttributes;
      td: HTMLAttributes;
      
      // SVG elements
      svg: HTMLAttributes & {
        viewBox?: MaybeSignal<string>;
        width?: MaybeSignal<string | number>;
        height?: MaybeSignal<string | number>;
      };
      path: HTMLAttributes & {
        d?: MaybeSignal<string>;
        fill?: MaybeSignal<string>;
        stroke?: MaybeSignal<string>;
        strokeWidth?: MaybeSignal<string | number>;
      };
      circle: HTMLAttributes & {
        cx?: MaybeSignal<string | number>;
        cy?: MaybeSignal<string | number>;
        r?: MaybeSignal<string | number>;
        fill?: MaybeSignal<string>;
        stroke?: MaybeSignal<string>;
      };
      rect: HTMLAttributes & {
        x?: MaybeSignal<string | number>;
        y?: MaybeSignal<string | number>;
        width?: MaybeSignal<string | number>;
        height?: MaybeSignal<string | number>;
        fill?: MaybeSignal<string>;
        stroke?: MaybeSignal<string>;
      };
      g: HTMLAttributes;
      line: HTMLAttributes;
      polygon: HTMLAttributes;
      polyline: HTMLAttributes;
      text: HTMLAttributes;
    }
    
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}