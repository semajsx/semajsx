/**
 * JSX automatic runtime for DOM (production)
 * Use with: @jsxImportSource semajsx/dom
 */

import { h } from "../runtime/vnode";
import { Fragment } from "../runtime/types";
import type { VNode, JSXChildren } from "../runtime/types";

export { Fragment };

/**
 * HTML attribute types
 */

export interface HTMLAttributes {
  // Standard attributes
  id?: string;
  className?: string;
  class?: string;
  style?: string | Record<string, string | number>;
  title?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
  hidden?: boolean;
  tabIndex?: number;
  accessKey?: string;
  contentEditable?: boolean | "true" | "false";
  draggable?: boolean;
  spellcheck?: boolean;

  // ARIA attributes
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-hidden"?: boolean | "true" | "false";
  "aria-expanded"?: boolean | "true" | "false";
  "aria-selected"?: boolean | "true" | "false";
  "aria-checked"?: boolean | "true" | "false" | "mixed";
  "aria-disabled"?: boolean | "true" | "false";
  "aria-readonly"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
  "aria-pressed"?: boolean | "true" | "false" | "mixed";
  "aria-current"?:
    | boolean
    | "true"
    | "false"
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";

  // Event handlers
  onClick?: (event: MouseEvent) => void;
  onDblClick?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  onMouseUp?: (event: MouseEvent) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
  onMouseOver?: (event: MouseEvent) => void;
  onMouseOut?: (event: MouseEvent) => void;
  onContextMenu?: (event: MouseEvent) => void;

  onKeyDown?: (event: KeyboardEvent) => void;
  onKeyUp?: (event: KeyboardEvent) => void;
  onKeyPress?: (event: KeyboardEvent) => void;

  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;

  onChange?: (event: Event) => void;
  onInput?: (event: Event) => void;
  onSubmit?: (event: Event) => void;

  onScroll?: (event: Event) => void;
  onWheel?: (event: WheelEvent) => void;

  onTouchStart?: (event: TouchEvent) => void;
  onTouchMove?: (event: TouchEvent) => void;
  onTouchEnd?: (event: TouchEvent) => void;
  onTouchCancel?: (event: TouchEvent) => void;

  onDragStart?: (event: DragEvent) => void;
  onDrag?: (event: DragEvent) => void;
  onDragEnd?: (event: DragEvent) => void;
  onDragEnter?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;

  // Data attributes
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;

  // Children
  children?: JSXChildren;
}

export interface AnchorHTMLAttributes extends HTMLAttributes {
  href?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  download?: string;
  ping?: string;
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
}

export interface ButtonHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  value?: string;
  name?: string;
  form?: string;
  formAction?: string;
  formEnctype?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
}

export interface InputHTMLAttributes extends HTMLAttributes {
  accept?: string;
  alt?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  capture?: boolean | "user" | "environment";
  checked?: boolean;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEnctype?: string;
  formMethod?: string;
  formNoValidate?: boolean;
  formTarget?: string;
  max?: number | string;
  maxLength?: number;
  min?: number | string;
  minLength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  size?: number;
  src?: string;
  step?: number | string;
  type?: string;
  value?: string | number;
}

export interface TextareaHTMLAttributes extends HTMLAttributes {
  autoComplete?: string;
  autoFocus?: boolean;
  cols?: number;
  disabled?: boolean;
  form?: string;
  maxLength?: number;
  minLength?: number;
  name?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  rows?: number;
  value?: string;
  wrap?: "hard" | "soft" | "off";
}

export interface SelectHTMLAttributes extends HTMLAttributes {
  autoComplete?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  form?: string;
  multiple?: boolean;
  name?: string;
  required?: boolean;
  size?: number;
  value?: string | string[];
}

export interface OptionHTMLAttributes extends HTMLAttributes {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | number;
}

export interface LabelHTMLAttributes extends HTMLAttributes {
  for?: string;
  htmlFor?: string;
  form?: string;
}

export interface FormHTMLAttributes extends HTMLAttributes {
  acceptCharset?: string;
  action?: string;
  autoComplete?: string;
  enctype?: string;
  method?: "get" | "post" | "dialog";
  name?: string;
  noValidate?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

export interface ImgHTMLAttributes extends HTMLAttributes {
  alt?: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  decoding?: "async" | "auto" | "sync";
  height?: number | string;
  loading?: "eager" | "lazy";
  referrerPolicy?: string;
  sizes?: string;
  src?: string;
  srcSet?: string;
  useMap?: string;
  width?: number | string;
}

export interface VideoHTMLAttributes extends HTMLAttributes {
  autoPlay?: boolean;
  controls?: boolean;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  height?: number | string;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto" | "";
  src?: string;
  width?: number | string;
}

export interface AudioHTMLAttributes extends HTMLAttributes {
  autoPlay?: boolean;
  controls?: boolean;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto" | "";
  src?: string;
}

export interface CanvasHTMLAttributes extends HTMLAttributes {
  height?: number | string;
  width?: number | string;
}

export interface IframeHTMLAttributes extends HTMLAttributes {
  allow?: string;
  allowFullScreen?: boolean;
  height?: number | string;
  loading?: "eager" | "lazy";
  name?: string;
  referrerPolicy?: string;
  sandbox?: string;
  src?: string;
  srcDoc?: string;
  width?: number | string;
}

export interface TableHTMLAttributes extends HTMLAttributes {
  cellPadding?: number | string;
  cellSpacing?: number | string;
}

export interface TdHTMLAttributes extends HTMLAttributes {
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
}

export interface ThHTMLAttributes extends HTMLAttributes {
  abbr?: string;
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

export interface StyleHTMLAttributes extends HTMLAttributes {
  media?: string;
  scoped?: boolean;
  type?: string;
}

export interface ScriptHTMLAttributes extends HTMLAttributes {
  async?: boolean;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  defer?: boolean;
  integrity?: string;
  noModule?: boolean;
  referrerPolicy?: string;
  src?: string;
  type?: string;
}

export interface LinkHTMLAttributes extends HTMLAttributes {
  as?: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  href?: string;
  hrefLang?: string;
  integrity?: string;
  media?: string;
  referrerPolicy?: string;
  rel?: string;
  sizes?: string;
  type?: string;
}

export interface MetaHTMLAttributes extends HTMLAttributes {
  charSet?: string;
  content?: string;
  httpEquiv?: string;
  name?: string;
}

/**
 * JSX namespace for DOM elements
 */
export namespace JSX {
  export type Element = VNode;

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export interface IntrinsicElements {
    // Document structure
    html: HTMLAttributes;
    head: HTMLAttributes;
    body: HTMLAttributes;
    title: HTMLAttributes;
    meta: MetaHTMLAttributes;
    link: LinkHTMLAttributes;
    style: StyleHTMLAttributes;
    script: ScriptHTMLAttributes;

    // Content sectioning
    header: HTMLAttributes;
    footer: HTMLAttributes;
    main: HTMLAttributes;
    nav: HTMLAttributes;
    section: HTMLAttributes;
    article: HTMLAttributes;
    aside: HTMLAttributes;
    h1: HTMLAttributes;
    h2: HTMLAttributes;
    h3: HTMLAttributes;
    h4: HTMLAttributes;
    h5: HTMLAttributes;
    h6: HTMLAttributes;

    // Text content
    div: HTMLAttributes;
    p: HTMLAttributes;
    span: HTMLAttributes;
    pre: HTMLAttributes;
    code: HTMLAttributes;
    blockquote: HTMLAttributes;
    hr: HTMLAttributes;
    br: HTMLAttributes;

    // Lists
    ul: HTMLAttributes;
    ol: HTMLAttributes;
    li: HTMLAttributes;
    dl: HTMLAttributes;
    dt: HTMLAttributes;
    dd: HTMLAttributes;

    // Inline text semantics
    a: AnchorHTMLAttributes;
    strong: HTMLAttributes;
    em: HTMLAttributes;
    b: HTMLAttributes;
    i: HTMLAttributes;
    u: HTMLAttributes;
    s: HTMLAttributes;
    small: HTMLAttributes;
    mark: HTMLAttributes;
    abbr: HTMLAttributes;
    cite: HTMLAttributes;
    q: HTMLAttributes;
    sub: HTMLAttributes;
    sup: HTMLAttributes;
    time: HTMLAttributes;

    // Forms
    form: FormHTMLAttributes;
    input: InputHTMLAttributes;
    textarea: TextareaHTMLAttributes;
    button: ButtonHTMLAttributes;
    select: SelectHTMLAttributes;
    option: OptionHTMLAttributes;
    optgroup: HTMLAttributes;
    label: LabelHTMLAttributes;
    fieldset: HTMLAttributes;
    legend: HTMLAttributes;

    // Tables
    table: TableHTMLAttributes;
    thead: HTMLAttributes;
    tbody: HTMLAttributes;
    tfoot: HTMLAttributes;
    tr: HTMLAttributes;
    th: ThHTMLAttributes;
    td: TdHTMLAttributes;
    caption: HTMLAttributes;
    colgroup: HTMLAttributes;
    col: HTMLAttributes;

    // Media
    img: ImgHTMLAttributes;
    video: VideoHTMLAttributes;
    audio: AudioHTMLAttributes;
    source: HTMLAttributes;
    track: HTMLAttributes;
    canvas: CanvasHTMLAttributes;
    svg: HTMLAttributes;

    // Embedded content
    iframe: IframeHTMLAttributes;
    embed: HTMLAttributes;
    object: HTMLAttributes;
    param: HTMLAttributes;
    picture: HTMLAttributes;

    // Interactive elements
    details: HTMLAttributes;
    summary: HTMLAttributes;
    dialog: HTMLAttributes;
    menu: HTMLAttributes;

    // Web Components
    slot: HTMLAttributes;
    template: HTMLAttributes;
  }
}

export function jsx(type: any, props: any, key?: any): any {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  if (children !== undefined) {
    return h(type, restProps, children);
  }

  return h(type, restProps);
}

export function jsxs(type: any, props: any, key?: any): any {
  const { children, ...restProps } = props || {};

  if (key !== undefined) {
    restProps.key = key;
  }

  if (children !== undefined) {
    const childArray = Array.isArray(children) ? children : [children];
    return h(type, restProps, ...childArray);
  }

  return h(type, restProps);
}
