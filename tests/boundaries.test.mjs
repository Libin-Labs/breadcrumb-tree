import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BreadcrumbTree } from '../dist/esm/index.js';

test('child-before-parent input supports Unicode and literal percent segments', () => {
  const tree = new BreadcrumbTree([
    { id: 'child', label: 'Child', segment: 'π %', parentId: 'parent' },
    { id: 'parent', label: 'Parent', segment: 'docs' },
  ]);
  assert.equal(tree.get('child').path, '/docs/%CF%80%20%25');
  assert.equal(tree.resolve('/docs/%cf%80%20%25').id, 'child');
  assert.deepEqual(
    tree.ancestors('child').map((item) => item.id),
    ['parent', 'child'],
  );
});

test('empty root and duplicate absolute route paths are validated', () => {
  assert.throws(
    () =>
      new BreadcrumbTree([
        { id: 'home', label: 'Home', segment: '' },
        { id: 'child', label: 'Docs', segment: 'docs', parentId: 'home' },
        { id: 'other', label: 'Other', segment: 'docs' },
      ]),
    /Duplicate route path/,
  );
  assert.throws(
    () =>
      new BreadcrumbTree([
        { id: 'home', label: 'Home', segment: '' },
        { id: 'child', label: 'Child', segment: '', parentId: 'home' },
      ]),
    /Only root/,
  );
  assert.equal(new BreadcrumbTree([]).resolve('/'), undefined);
});
