# Review guidelines

## Store migrations and schema versioning

**Rule**: Store migrations must be backwards compatible, properly versioned, and include down-migration tests.

### Problem

tldraw uses versioned schema migrations in `packages/tlschema` and `packages/store` to evolve shape, binding, and record types. Incorrect migrations can corrupt user documents, break multiplayer sync, or cause data loss for users with saved files.

### Solution

```typescript
// ❌ BAD: Removing or renaming a shape prop without a migration
interface GeoShapeProps {
  // was "size", now "dimensions" — breaks existing documents
  dimensions: number
}

// ✅ GOOD: Add a migration that maps old prop names to new ones
export const geoShapeMigrations = createShapePropsMigrationSequence({
  sequence: [
    {
      id: 'com.tldraw.geo/rename-size-to-dimensions',
      up(props) {
        props.dimensions = props.size
        delete props.size
      },
      down(props) {
        props.size = props.dimensions
        delete props.dimensions
      },
    },
  ],
})
```

### When to flag

- Any change to shape, binding, or record type props without a corresponding migration
- Migrations that lack a `down` function
- Changes to migration IDs or reordering of migration sequences
- Removing fields from record types without deprecation

### Exceptions

- Adding new optional props with defaults does not require a migration in most cases

## Public API surface changes

**Rule**: Changes to the public API surface of SDK packages must be intentional and reflected in API reports.

### Problem

tldraw is a published SDK. Accidental changes to exports, type signatures, or public methods in `packages/editor`, `packages/tldraw`, `packages/store`, `packages/state`, or `packages/tlschema` can break downstream consumers.

### Solution

```typescript
// ❌ BAD: Changing a public method signature without updating the API report
// Before: getShape(id: TLShapeId): TLShape | undefined
// After:  getShape(id: TLShapeId, opts?: { exact: boolean }): TLShape | undefined
// This silently breaks the public API contract.

// ✅ GOOD: Add the new overload and run `yarn api-check` to update reports
// Include the API report diff in the PR so reviewers can see the surface change.
```

### When to flag

- New or changed exports from SDK packages
- Changes to public method signatures, return types, or class hierarchies
- Removed exports or renamed public identifiers
- Missing API report updates alongside public API changes

## Reactive state patterns

**Rule**: Follow established reactive state patterns using `@tldraw/state` signals.

### Problem

The editor uses a dependency-tracked reactive system (`Atom`, `Computed`, `react`). Bypassing it with raw state, `useEffect` subscriptions, or manual cache invalidation causes stale renders, missed updates, and subtle bugs.

### Solution

```typescript
// ❌ BAD: Using useState + useEffect to track editor state
const [shapes, setShapes] = useState<TLShape[]>([])
useEffect(() => {
  const unsub = editor.store.listen(() => {
    setShapes(editor.getCurrentPageShapes())
  })
  return unsub
}, [editor])

// ✅ GOOD: Use the reactive system directly
const shapes = useValue('shapes', () => editor.getCurrentPageShapes(), [editor])
```

```typescript
// ❌ BAD: Mutating shape props directly
shape.props.w = 100

// ✅ GOOD: Use editor methods that go through the store
editor.updateShape({ id: shape.id, type: shape.type, props: { w: 100 } })
```

### When to flag

- Direct state mutation on shapes, bindings, or records
- `useState`/`useEffect` patterns that replicate what reactive primitives already provide
- Manual `.listen()` subscriptions when `useValue`, `useComputed`, or `track` would work
- Creating `Atom` or `Computed` values outside of proper lifecycle management

## Security: XSS and unsanitized input

**Rule**: Never render user-provided content as raw HTML.

### Problem

tldraw handles user-generated content in shapes (text, bookmarks, embeds, URLs). Rendering this content with `dangerouslySetInnerHTML` or `innerHTML` without sanitization creates XSS vulnerabilities.

### Solution

```tsx
// ❌ BAD: Rendering user text as HTML
<div dangerouslySetInnerHTML={{ __html: shape.props.text }} />

// ✅ GOOD: Let React escape the content
<div>{shape.props.text}</div>

// ❌ BAD: Setting innerHTML from user input
element.innerHTML = bookmark.description

// ✅ GOOD: Use textContent for plain text
element.textContent = bookmark.description
```

### When to flag

- `dangerouslySetInnerHTML` with user-controlled content
- `element.innerHTML = ` with values derived from shape props, URL params, or external data
- Embedding user-controlled URLs in `<iframe>`, `<script>`, or `<a href="javascript:...">` without validation
- URL construction from user input without origin/protocol validation

### Exceptions

- SVG export rendering where content is already sanitized by the export pipeline
- Trusted internal HTML strings (e.g. icon SVGs from the asset bundle)

## Performance: rendering hot paths

**Rule**: Avoid unnecessary work in render-critical paths like shape rendering and canvas updates.

### Problem

The canvas can contain thousands of shapes. Expensive operations in `ShapeUtil.component()`, `ShapeUtil.indicator()`, or frequently-triggered `Computed` values cause visible lag during panning, zooming, and editing.

### Solution

```typescript
// ❌ BAD: Expensive computation inside a shape component on every render
function GeoShapeComponent({ shape }: { shape: TLGeoShape }) {
  const allShapes = editor.getCurrentPageShapes() // O(n) on every render
  const neighbors = allShapes.filter(s => /* ... */)
  // ...
}

// ✅ GOOD: Derive expensive values outside the hot path, or use Computed caching
const neighbors = useComputed('neighbors', () => {
  return editor.getCurrentPageShapes().filter(s => /* ... */)
}, [editor])
```

### When to flag

- Array `.filter()`, `.map()`, or `.find()` over all shapes inside `ShapeUtil.component()` or `indicator()`
- Creating new objects or arrays on every render in shape components without memoization
- Synchronous I/O, DOM measurement, or layout-triggering reads inside shape render paths
- Missing `track()` wrapper on components that read reactive values
