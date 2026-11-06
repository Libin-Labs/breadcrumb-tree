export interface BreadcrumbRoute {
  id: string;
  label: string;
  segment: string;
  parentId?: string;
}
export interface Breadcrumb {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly parentId: string | undefined;
}
export class BreadcrumbTree {
  private readonly nodes = new Map<string, Breadcrumb>();
  private readonly routes = new Map<string, string>();
  constructor(routes: readonly BreadcrumbRoute[]) {
    const input = new Map<string, BreadcrumbRoute>();
    for (const route of routes) {
      if (!route.id || input.has(route.id)) throw new Error('Duplicate or empty route id');
      if (
        !route.label ||
        route.segment === '.' ||
        route.segment === '..' ||
        /[/?#\\\u0000-\u001f]/u.test(route.segment)
      )
        throw new Error('Invalid label or segment');
      if (route.segment === '' && route.parentId !== undefined)
        throw new Error('Only root may have empty segment');
      input.set(route.id, { ...route });
    }
    const visiting = new Set<string>();
    const build = (id: string): Breadcrumb => {
      const existing = this.nodes.get(id);
      if (existing) return existing;
      const route = input.get(id);
      if (!route) throw new Error('Missing parent: ' + id);
      if (visiting.has(id)) throw new Error('Route cycle');
      visiting.add(id);
      const parent = route.parentId === undefined ? undefined : build(route.parentId);
      const prefix = parent?.path === '/' ? '' : (parent?.path ?? '');
      const path = route.segment === '' ? '/' : prefix + '/' + encodeURIComponent(route.segment);
      if (this.routes.has(path)) throw new Error('Duplicate route path');
      const node = Object.freeze({
        id: route.id,
        label: route.label,
        path,
        parentId: route.parentId,
      });
      this.nodes.set(id, node);
      this.routes.set(path, id);
      visiting.delete(id);
      return node;
    };
    for (const id of input.keys()) build(id);
  }
  get size(): number {
    return this.nodes.size;
  }
  get(id: string): Breadcrumb | undefined {
    return this.nodes.get(id);
  }
  ancestors(id: string, includeSelf = true): readonly Breadcrumb[] {
    let node = this.nodes.get(id);
    if (!node) throw new Error('Unknown route id');
    if (!includeSelf)
      node = node.parentId === undefined ? undefined : this.nodes.get(node.parentId);
    const result: Breadcrumb[] = [];
    while (node) {
      result.push(node);
      node = node.parentId === undefined ? undefined : this.nodes.get(node.parentId);
    }
    return Object.freeze(result.reverse());
  }
  children(parentId?: string): readonly Breadcrumb[] {
    if (parentId !== undefined && !this.nodes.has(parentId)) throw new Error('Unknown route id');
    return Object.freeze([...this.nodes.values()].filter((node) => node.parentId === parentId));
  }
  resolve(path: string): Breadcrumb | undefined {
    if (!path.startsWith('/') || path.startsWith('//') || /[?#\\]/u.test(path))
      throw new Error('Expected absolute local path without query or fragment');
    const trimmed = path === '/' ? path : path.replace(/\/$/u, '');
    const segments = trimmed === '/' ? [] : trimmed.slice(1).split('/');
    const normalized = segments.map((segment) => {
      const decoded = decodeURIComponent(segment);
      if (!decoded || decoded === '.' || decoded === '..' || /[/?#\\\u0000-\u001f]/u.test(decoded))
        throw new Error('Invalid path segment');
      return encodeURIComponent(decoded);
    });
    const id = this.routes.get('/' + normalized.join('/'));
    return id === undefined ? undefined : this.nodes.get(id);
  }
}
