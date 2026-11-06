import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as library from '../dist/esm/index.js';
const { BreadcrumbTree } = library;

const routes = [
  { id: 'home', label: 'Home', segment: '' },
  { id: 'docs', label: 'Docs', segment: 'docs', parentId: 'home' },
  { id: 'a', label: 'A B', segment: 'a b', parentId: 'docs' },
];
test('hierarchy yields root-first ancestors and encoded paths', () => {
  const t = new BreadcrumbTree(routes);
  assert.deepEqual(
    t.ancestors('a').map((x) => x.id),
    ['home', 'docs', 'a'],
  );
  assert.equal(t.get('a').path, '/docs/a%20b');
  assert.deepEqual(
    t.ancestors('a', false).map((x) => x.id),
    ['home', 'docs'],
  );
});
test('resolve normalizes encoding and one trailing slash', () => {
  const t = new BreadcrumbTree(routes);
  assert.equal(t.resolve('/docs/a%20b/').id, 'a');
  assert.equal(t.resolve('/').id, 'home');
  assert.equal(t.resolve('/missing'), undefined);
  assert.equal(t.size, 3);
});
test('missing parent and cycles fail during construction', () => {
  assert.throws(
    () => new BreadcrumbTree([{ id: 'a', label: 'A', segment: 'a', parentId: 'missing' }]),
    /Missing/,
  );
  assert.throws(
    () =>
      new BreadcrumbTree([
        { id: 'a', label: 'A', segment: 'a', parentId: 'b' },
        { id: 'b', label: 'B', segment: 'b', parentId: 'a' },
      ]),
    /cycle/,
  );
});
test('duplicate ids and sibling paths rejected', () => {
  assert.throws(() => new BreadcrumbTree([routes[0], routes[0]]), /Duplicate/);
  assert.throws(
    () =>
      new BreadcrumbTree([
        { id: 'a', label: 'A', segment: 'x' },
        { id: 'b', label: 'B', segment: 'x' },
      ]),
    /Duplicate/,
  );
});
test('unsafe segments and nonlocal paths rejected', () => {
  for (const segment of ['..', 'a/b', 'a?b', 'a#b'])
    assert.throws(() => new BreadcrumbTree([{ id: 'a', label: 'A', segment }]));
  const t = new BreadcrumbTree(routes);
  for (const path of ['https://x', '//host', '/docs?x', '/%2e%2e', '/%2f', '/%zz', '/docs//'])
    assert.throws(() => t.resolve(path));
});
test('defensive copy, children, immutable results, unknown ids', () => {
  const input = routes.map((x) => ({ ...x }));
  const t = new BreadcrumbTree(input);
  input[1].segment = 'changed';
  assert.equal(t.children('home')[0].path, '/docs');
  assert.equal(t.children()[0].id, 'home');
  assert.equal(Object.isFrozen(t.ancestors('a')), true);
  assert.equal(Object.isFrozen(t.get('a')), true);
  assert.throws(() => t.ancestors('unknown'), /Unknown/);
  assert.throws(() => t.children('unknown'), /Unknown/);
});
