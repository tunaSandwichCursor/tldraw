# Sync worker security and infrastructure review

These rules apply only when files in the sync-worker are changed. This is the Cloudflare Worker that handles authentication, route dispatch, Durable Object lifecycle, admin operations, and database access for tldraw.com.

## Every route must enforce authentication

**Rule**: All non-public routes must call `getAuth` or `requireAuth` before accessing user data or performing mutations.

### Problem

The sync-worker exposes HTTP routes that handle user files, uploads, invitations, and admin operations. A route that skips auth checks allows unauthenticated access to user data or privileged operations.

### Solution

```typescript
// ❌ BAD: Route handler that accesses user data without auth
.post('/app/file/:roomId/restore', async (req, env) => {
  const fileId = req.params.roomId
  // directly modifies file without checking who is requesting
  await restoreFile(env, fileId)
  return new Response('ok')
})

// ✅ GOOD: Auth check before any user-scoped operation
.post('/app/file/:roomId/restore', async (req, env) => {
  const auth = await requireAuth(req, env)
  // now we know who the caller is and can check ownership
  await restoreFile(env, req.params.roomId, auth.userId)
  return new Response('ok')
})
```

### When to flag

- New route handlers that do not call `getAuth()` or `requireAuth()` before accessing user-scoped resources
- Routes under `/app/` that lack auth entirely
- Routes that call `getAuth()` but do not check the returned value for `null`
- Routes that accept a `userId` from the URL or body without verifying it matches the authenticated user

### Exceptions

- Public read-only routes like `/snapshot/:roomId`, `/readonly-slug/:roomId`, and health checks
- The PostHog proxy (`/ph/*`) which forwards analytics without user context

## Admin routes must use `requireAdminAccess`

**Rule**: All routes under `/app/admin/*` must enforce admin-level access control.

### Problem

Admin routes perform destructive operations: deleting users, hard-deleting files, modifying feature flags, triggering migrations. If a new admin route is added without the `requireAdminAccess` middleware, any authenticated user could perform these operations.

### Solution

```typescript
// ❌ BAD: Admin route that only checks basic auth
.post('/app/admin/dangerous-thing', async (req, env) => {
  const auth = await requireAuth(req, env)
  // regular user can now do admin things
  await dangerousThing(env)
})

// ✅ GOOD: Admin route with full access control chain
.post('/app/admin/dangerous-thing', async (req, env) => {
  const auth = await requireAuth(req, env)
  await requireAdminAccess(env, auth)
  await dangerousThing(env)
})
```

The existing admin router applies this as middleware on `all('/app/admin/*', ...)`. If a new admin endpoint is added outside this router or the middleware is bypassed, flag it.

### When to flag

- New endpoints under `/app/admin/` that do not go through the admin router's `all('*')` middleware
- Admin-like operations (user deletion, feature flag changes, data migration) placed outside the `/app/admin/` path
- Removal or weakening of the `requireAdminAccess` check

## Validate and sanitize route parameters

**Rule**: Route parameters and query strings must be validated before use in database queries or Durable Object lookups.

### Problem

Route parameters (`:roomId`, `:fileId`, `:userId`, `:token`) are user-controlled strings. Passing them directly to database queries or Durable Object stubs without validation can cause unexpected behavior, injection, or access to unintended resources.

### Solution

```typescript
// ❌ BAD: Using route param directly in a query without validation
.get('/app/admin/user', async (req, env) => {
  const q = req.query['q']
  // no type check — could be undefined, array, or malicious
  const user = await db.selectFrom('user').where('id', '=', q).execute()
})

// ✅ GOOD: Validate before use
.get('/app/admin/user', async (req, env) => {
  const q = req.query['q']
  if (typeof q !== 'string') {
    return new Response('Missing query param', { status: 400 })
  }
  const user = await db.selectFrom('user').where('id', '=', q).execute()
})
```

### When to flag

- Route params used in database queries without type checking
- Route params passed to `getUserDurableObject()` or `getRoomDurableObject()` without verifying they match the authenticated user
- Query parameters cast with `as` or used without `typeof` checks
- URL-derived values used to construct file paths or R2 object keys without sanitization

## Database connection lifecycle

**Rule**: Database connection pools created with `createPostgresConnectionPool` must be destroyed after use.

### Problem

Each call to `createPostgresConnectionPool` creates a new connection pool. If the pool is not destroyed, connections leak and can exhaust the database connection limit, especially under load in a Cloudflare Worker environment where each request may create its own pool.

### Solution

```typescript
// ❌ BAD: Connection pool created but never destroyed
async function handleRequest(env: Environment) {
  const db = createPostgresConnectionPool(env, 'my-handler')
  const result = await db.selectFrom('user').selectAll().execute()
  return json(result)
  // pool leaked
}

// ✅ GOOD: Use try/finally to ensure cleanup
async function handleRequest(env: Environment) {
  const db = createPostgresConnectionPool(env, 'my-handler')
  try {
    const result = await db.selectFrom('user').selectAll().execute()
    return json(result)
  } finally {
    await db.destroy()
  }
}
```

### When to flag

- `createPostgresConnectionPool()` calls without a corresponding `db.destroy()` in a `finally` block
- Functions that create a pool and return early on error paths before destroying it
- Long-lived connection pools stored in module-level variables (these persist across Worker invocations unpredictably)

### Exceptions

- Connection pools managed by framework-level middleware that handles cleanup automatically

## Durable Object stub calls must handle errors

**Rule**: Calls to Durable Object stubs (`getUserDurableObject`, `getRoomDurableObject`) should handle network and DO errors gracefully.

### Problem

Durable Object stubs make network calls to isolated DO instances. These can fail due to DO hibernation wake-up failures, rate limits, or infrastructure issues. Unhandled errors from DO calls surface as 500s to the user with no actionable information.

### Solution

```typescript
// ❌ BAD: Unhandled DO call in a route
.post('/app/:userId/init', async (req, env) => {
  const auth = await requireAuth(req, env)
  const stub = getUserDurableObject(env, auth.userId)
  return stub.fetch(req) // if DO fails, user gets a raw 500
})

// ✅ GOOD: Wrap with error context
.post('/app/:userId/init', async (req, env) => {
  const auth = await requireAuth(req, env)
  const stub = getUserDurableObject(env, auth.userId)
  try {
    return await stub.fetch(req)
  } catch (err) {
    console.error(`Failed to initialize user DO for ${auth.userId}:`, err)
    return new Response('Service temporarily unavailable', { status: 503 })
  }
})
```

### When to flag

- New `getUserDurableObject()` or `getRoomDurableObject()` calls without try/catch or error handling
- DO stub calls where errors would propagate as unhandled 500s to end users
- Missing logging or Sentry capture on DO call failures
