// Global suspense state management
const suspenseStates = new Map<string, Promise<any>[]>();

export function getSuspenseState(key: string): Promise<any>[] {
  return suspenseStates.get(key) || [];
}

export function setSuspenseState(key: string, promises: Promise<any>[]): void {
  suspenseStates.set(key, promises);
}

export function clearSuspenseState(key: string): void {
  suspenseStates.delete(key);
}

// Component stack for error boundaries
let componentStack: string[] = [];

export function pushComponentStack(name: string): void {
  componentStack.push(name);
}

export function popComponentStack(): void {
  componentStack.pop();
}

export function getComponentStack(): string {
  return componentStack.join(' > ');
}