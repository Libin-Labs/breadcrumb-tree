import { BreadcrumbTree, type Breadcrumb } from '@lp-labs/breadcrumb-tree';
const tree = new BreadcrumbTree([{ id: 'root', label: 'Root', segment: '' }]);
const node: Breadcrumb | undefined = tree.resolve('/');
void node;
// @ts-expect-error route needs segment
new BreadcrumbTree([{ id: 'root', label: 'Root' }]);
// @ts-expect-error immutable ancestor collection
tree.ancestors('root').push({ id: 'x', label: 'X', path: '/x', parentId: undefined });
