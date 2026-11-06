# @lp-labs/breadcrumb-tree

Validated immutable route hierarchy and exact decoded path resolution.

## Install

```sh
npm install @lp-labs/breadcrumb-tree
```

Zero runtime, peer, or sibling dependencies. Node 18+; strict TypeScript declarations and independent ESM/CommonJS builds. Version 0.1.0, MIT.

## Quickstart

```js
import { BreadcrumbTree } from '@lp-labs/breadcrumb-tree';
const tree = new BreadcrumbTree([
  { id: 'home', label: 'Home', segment: '' },
  { id: 'docs', label: 'Docs', segment: 'docs', parentId: 'home' },
]);
console.log(tree.resolve('/docs/')?.id); // docs
console.log(tree.ancestors('docs').map((item) => item.label)); // Home, Docs
```

## API and contracts

BreadcrumbRoute is a literal segment (not a router pattern); parentId may reference any input order. Constructor checks unique nonempty ids/labels, missing parents, cycles, duplicate canonical paths, separators, controls, dot traversal, and empty child segments. An empty root has path /. Other roots may have nonempty segments. Invalid structures throw Error; malformed percent encoding in resolve throws URIError. resolve accepts an absolute local path only, rejects query/hash/authority/backslashes/encoded separators, canonicalizes decoded Unicode/percent encoding, and tolerates one trailing slash. Exact matches only; missing match/get returns undefined. ancestors throws for unknown ids and returns root-first immutable Breadcrumb snapshots; children returns immediate children in construction/topological order. No router, network, URL origin matching, wildcard, or dynamic params. Maps O(nodes); construction/ancestors O(depth) recursion, resolve O(path length), children O(nodes). Extremely deep untrusted hierarchies may exceed the JS call stack.

## Full declarations

The complete public declarations below are generated from the package's strict source. All runtime exports, interfaces, options, return types and readonly state are listed here.

<!-- declarations -->

```ts
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
export declare class BreadcrumbTree {
  private readonly nodes;
  private readonly routes;
  constructor(routes: readonly BreadcrumbRoute[]);
  get size(): number;
  get(id: string): Breadcrumb | undefined;
  ancestors(id: string, includeSelf?: boolean): readonly Breadcrumb[];
  children(parentId?: string): readonly Breadcrumb[];
  resolve(path: string): Breadcrumb | undefined;
}
```

<!-- end declarations -->

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

All tests use deterministic clocks, immediate injected sleeps, or explicit promise gates rather than timing guesses. Package exports select ESM for import and CommonJS for require, with separate declaration trees. No runtime configuration files or global hooks.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
