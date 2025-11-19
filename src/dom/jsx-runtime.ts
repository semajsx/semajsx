/**
 * JSX automatic runtime for DOM (production)
 * Use with: @jsxImportSource semajsx/dom
 */

import { Fragment } from "../runtime/types";
import type {
  Component,
  JSXNode,
  VNode,
  WithKey,
  WithSignals,
  Ref,
} from "../runtime/types";
import type { Signal } from "../signal/types";

export { jsx, jsxs } from "../runtime/jsx";
export { Fragment };

/**
 * HTML attribute types (base definitions without Signal support)
 */
interface BaseHTMLAttributes {
  // Ref - special prop for element references
  ref?: Ref<Element>;

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

  // Special React-style props
  dangerouslySetInnerHTML?: { __html: string };

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

  // Event handlers (React-style camelCase)
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

  // Event handlers (native DOM lowercase)
  onclick?: (event: MouseEvent) => void;
  ondblclick?: (event: MouseEvent) => void;
  onmousedown?: (event: MouseEvent) => void;
  onmouseup?: (event: MouseEvent) => void;
  onmouseenter?: (event: MouseEvent) => void;
  onmouseleave?: (event: MouseEvent) => void;
  onmousemove?: (event: MouseEvent) => void;
  onmouseover?: (event: MouseEvent) => void;
  onmouseout?: (event: MouseEvent) => void;
  oncontextmenu?: (event: MouseEvent) => void;

  onkeydown?: (event: KeyboardEvent) => void;
  onkeyup?: (event: KeyboardEvent) => void;
  onkeypress?: (event: KeyboardEvent) => void;

  onfocus?: (event: FocusEvent) => void;
  onblur?: (event: FocusEvent) => void;

  onchange?: (event: Event) => void;
  oninput?: (event: Event) => void;
  onsubmit?: (event: Event) => void;

  onscroll?: (event: Event) => void;
  onwheel?: (event: WheelEvent) => void;

  ontouchstart?: (event: TouchEvent) => void;
  ontouchmove?: (event: TouchEvent) => void;
  ontouchend?: (event: TouchEvent) => void;
  ontouchcancel?: (event: TouchEvent) => void;

  ondragstart?: (event: DragEvent) => void;
  ondrag?: (event: DragEvent) => void;
  ondragend?: (event: DragEvent) => void;
  ondragenter?: (event: DragEvent) => void;
  ondragleave?: (event: DragEvent) => void;
  ondragover?: (event: DragEvent) => void;
  ondrop?: (event: DragEvent) => void;

  // Children
  children?: JSXNode;
}

/**
 * HTML attributes with Signal support
 * All non-function properties can accept Signal values
 */
export type HTMLAttributes = WithKey<WithSignals<BaseHTMLAttributes>> & {
  // Data attributes support both plain values and Signals
  [dataAttribute: `data-${string}`]:
    | string
    | number
    | boolean
    | Signal<string | number | boolean>
    | undefined;
};

interface BaseAnchorHTMLAttributes extends BaseHTMLAttributes {
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

export type AnchorHTMLAttributes = WithKey<
  WithSignals<BaseAnchorHTMLAttributes>
>;

interface BaseButtonHTMLAttributes extends BaseHTMLAttributes {
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

export type ButtonHTMLAttributes = WithKey<
  WithSignals<BaseButtonHTMLAttributes>
>;

interface BaseInputHTMLAttributes extends BaseHTMLAttributes {
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

export type InputHTMLAttributes = WithKey<WithSignals<BaseInputHTMLAttributes>>;

interface BaseTextareaHTMLAttributes extends BaseHTMLAttributes {
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

export type TextareaHTMLAttributes = WithKey<
  WithSignals<BaseTextareaHTMLAttributes>
>;

interface BaseSelectHTMLAttributes extends BaseHTMLAttributes {
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

export type SelectHTMLAttributes = WithKey<
  WithSignals<BaseSelectHTMLAttributes>
>;

interface BaseOptionHTMLAttributes extends BaseHTMLAttributes {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | number;
}

export type OptionHTMLAttributes = WithKey<
  WithSignals<BaseOptionHTMLAttributes>
>;

interface BaseLabelHTMLAttributes extends BaseHTMLAttributes {
  for?: string;
  htmlFor?: string;
  form?: string;
}

export type LabelHTMLAttributes = WithKey<WithSignals<BaseLabelHTMLAttributes>>;

interface BaseFormHTMLAttributes extends BaseHTMLAttributes {
  acceptCharset?: string;
  action?: string;
  autoComplete?: string;
  enctype?: string;
  method?: "get" | "post" | "dialog";
  name?: string;
  noValidate?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
}

export type FormHTMLAttributes = WithKey<WithSignals<BaseFormHTMLAttributes>>;

interface BaseImgHTMLAttributes extends BaseHTMLAttributes {
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

export type ImgHTMLAttributes = WithKey<WithSignals<BaseImgHTMLAttributes>>;

interface BaseVideoHTMLAttributes extends BaseHTMLAttributes {
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

export type VideoHTMLAttributes = WithKey<WithSignals<BaseVideoHTMLAttributes>>;

interface BaseAudioHTMLAttributes extends BaseHTMLAttributes {
  autoPlay?: boolean;
  controls?: boolean;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto" | "";
  src?: string;
}

export type AudioHTMLAttributes = WithKey<WithSignals<BaseAudioHTMLAttributes>>;

interface BaseCanvasHTMLAttributes extends BaseHTMLAttributes {
  height?: number | string;
  width?: number | string;
}

export type CanvasHTMLAttributes = WithKey<
  WithSignals<BaseCanvasHTMLAttributes>
>;

interface BaseIframeHTMLAttributes extends BaseHTMLAttributes {
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

export type IframeHTMLAttributes = WithKey<
  WithSignals<BaseIframeHTMLAttributes>
>;

interface BaseTableHTMLAttributes extends BaseHTMLAttributes {
  cellPadding?: number | string;
  cellSpacing?: number | string;
}

export type TableHTMLAttributes = WithKey<WithSignals<BaseTableHTMLAttributes>>;

interface BaseTdHTMLAttributes extends BaseHTMLAttributes {
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
}

export type TdHTMLAttributes = WithKey<WithSignals<BaseTdHTMLAttributes>>;

interface BaseThHTMLAttributes extends BaseHTMLAttributes {
  abbr?: string;
  colSpan?: number;
  headers?: string;
  rowSpan?: number;
  scope?: "col" | "row" | "colgroup" | "rowgroup";
}

export type ThHTMLAttributes = WithKey<WithSignals<BaseThHTMLAttributes>>;

interface BaseStyleHTMLAttributes extends BaseHTMLAttributes {
  media?: string;
  scoped?: boolean;
  type?: string;
}

export type StyleHTMLAttributes = WithKey<WithSignals<BaseStyleHTMLAttributes>>;

interface BaseScriptHTMLAttributes extends BaseHTMLAttributes {
  async?: boolean;
  crossOrigin?: "anonymous" | "use-credentials" | "";
  defer?: boolean;
  integrity?: string;
  noModule?: boolean;
  referrerPolicy?: string;
  src?: string;
  type?: string;
}

export type ScriptHTMLAttributes = WithKey<
  WithSignals<BaseScriptHTMLAttributes>
>;

interface BaseLinkHTMLAttributes extends BaseHTMLAttributes {
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

export type LinkHTMLAttributes = WithKey<WithSignals<BaseLinkHTMLAttributes>>;

interface BaseMetaHTMLAttributes extends BaseHTMLAttributes {
  charSet?: string;
  content?: string;
  httpEquiv?: string;
  name?: string;
}

export type MetaHTMLAttributes = WithKey<WithSignals<BaseMetaHTMLAttributes>>;

/**
 * JSX namespace for DOM elements
 */
export namespace JSX {
  // JSX factory returns sync VNodes
  export type Element = VNode;

  export type ElementType = keyof IntrinsicElements | Component<any>;

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
