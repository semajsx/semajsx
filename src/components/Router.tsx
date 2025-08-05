import { signal, computed } from "@semajsx/signal";

export interface Route {
  path: string;
  component: () => any;
}

const currentPath = signal(window.location.pathname);

window.addEventListener("popstate", () => {
  currentPath.value = window.location.pathname;
});

export function navigate(path: string) {
  window.history.pushState({}, "", path);
  currentPath.value = path;
}

export function Link({ href, children, ...props }: { href: string; children: any; [key: string]: any }) {
  return (
    <a
      href={href}
      onClick={(e: MouseEvent) => {
        e.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export function Router({ routes }: { routes: Route[] }) {
  const currentRoute = computed(() => {
    const path = currentPath.value;
    return routes.find(route => {
      if (route.path === path) return true;
      
      // Handle dynamic routes like /posts/:slug
      const routeParts = route.path.split("/");
      const pathParts = path.split("/");
      
      if (routeParts.length !== pathParts.length) return false;
      
      return routeParts.every((part, i) => {
        if (part.startsWith(":")) return true;
        return part === pathParts[i];
      });
    });
  });

  const route = currentRoute.value;
  if (!route) return <div>404 - Page not found</div>;
  
  const Component = route.component;
  return <Component />;
}

export function useParams(): Record<string, string> {
  const path = currentPath.value;
  const routes = (window as any).__routes || [];
  
  const matchedRoute = routes.find((route: Route) => {
    const routeParts = route.path.split("/");
    const pathParts = path.split("/");
    
    if (routeParts.length !== pathParts.length) return false;
    
    return routeParts.every((part: string, i: number) => {
      if (part.startsWith(":")) return true;
      return part === pathParts[i];
    });
  });
  
  if (!matchedRoute) return {};
  
  const routeParts = matchedRoute.path.split("/");
  const pathParts = path.split("/");
  const params: Record<string, string> = {};
  
  routeParts.forEach((part: string, i: number) => {
    if (part.startsWith(":")) {
      params[part.slice(1)] = pathParts[i];
    }
  });
  
  return params;
}