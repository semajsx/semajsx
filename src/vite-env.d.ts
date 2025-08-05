/// <reference types="vite/client" />

interface PageData {
  name: string;
  path: string;
  title?: string;
  description?: string;
  meta?: {
    deprecated?: boolean;
  };
  assets?: (Script | Link)[];
  file: string;
  source: string;
}

declare const __PAGES_DATA__: PageData[];

declare global {
  interface Window {
    __PAGES_DATA__: PageData[];
  }
}

interface Script {
  src: string;
  type: "module" | "text/javascript";
  async?: boolean;
  defer?: boolean;
  crossOrigin?: "anonymous" | "use-credentials";
  integrity?: string;
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

interface Link {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
  media?: string;
}
