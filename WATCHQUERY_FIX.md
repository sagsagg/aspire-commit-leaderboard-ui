# Fixed: Apollo Client Invariant Violation with cache-and-network

## Error Message

```
Invariant Violation: The cache-and-network fetchPolicy does not work with client.query, 
because client.query can only return a single result. Please use client.watchQuery to 
receive multiple results from the cache and the network, or consider using a different 
fetchPolicy, such as cache-first or network-only.
```

## Root Cause

The `useApolloQuery` composable was using `client.query()` which:
- Returns a single Promise result
- Only executes once
- **Does NOT support `cache-and-network` fetch policy**

The `cache-and-network` fetch policy is designed to:
1. Return cached data immediately (if available)
2. Make a network request
3. Update with network data when it arrives

This requires **multiple result emissions**, which `client.query()` cannot provide.

## Solution

Changed the composable to use `client.watchQuery()` which:
- Returns an `ObservableQuery`
- Can emit multiple results over time
- **Fully supports `cache-and-network` and all other fetch policies**
- Provides reactive updates

## Code Changes

### Before (❌ Broken)

```typescript
const response = await client.query<TData, TVariables>({
  query,
  variables: variables as TVariables,
  fetchPolicy: options.fetchPolicy || 'cache-first',
});

result.value = response.data;
```

### After (✅ Fixed)

```typescript
// Create ObservableQuery
observableQuery = client.watchQuery<TData, TVariables>({
  query,
  variables: getVariables(),
  fetchPolicy: options.fetchPolicy || 'cache-first',
  pollInterval: options.pollInterval,
});

// Subscribe to results
subscription = observableQuery.subscribe({
  next: (queryResult) => {
    loading.value = queryResult.loading;
    result.value = queryResult.data;
    error.value = queryResult.error;
  },
  error: (err) => {
    loading.value = false;
    error.value = err as ApolloError;
  },
});
```

## Additional Improvements

### 1. Better Variable Updates
**Before:** Re-executed entire query
```typescript
watch(options.variables, () => {
  fetchData(); // Re-runs the whole query
});
```

**After:** Uses built-in `setVariables`
```typescript
watch(options.variables, (newVariables) => {
  if (observableQuery) {
    observableQuery.setVariables(newVariables as TVariables);
  }
});
```

### 2. Built-in Polling
**Before:** Manual `setInterval`
```typescript
pollTimer = setInterval(() => {
  fetchData();
}, options.pollInterval);
```

**After:** Built-in ObservableQuery polling
```typescript
observableQuery = client.watchQuery({
  // ...
  pollInterval: options.pollInterval,
});
```

### 3. Proper Cleanup
**Before:** Only cleared interval
```typescript
onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
  }
});
```

**After:** Unsubscribes and stops polling
```typescript
onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
  if (observableQuery) {
    observableQuery.stopPolling();
  }
});
```

## Benefits

1. ✅ **Supports all fetch policies** including `cache-and-network`
2. ✅ **More efficient** - uses Apollo's built-in observable system
3. ✅ **Better reactivity** - automatic updates when cache changes
4. ✅ **Proper resource cleanup** - prevents memory leaks
5. ✅ **Built-in polling** - no manual interval management
6. ✅ **Optimized variable updates** - uses `setVariables` instead of re-query

## Key Differences: client.query vs client.watchQuery

| Feature | client.query | client.watchQuery |
|---------|-------------|-------------------|
| Return type | Promise (single result) | ObservableQuery (stream of results) |
| cache-and-network support | ❌ No | ✅ Yes |
| Reactive updates | ❌ No | ✅ Yes |
| Multiple emissions | ❌ No | ✅ Yes |
| Polling support | ⚠️ Manual | ✅ Built-in |
| Subscription cleanup | N/A | Required |
| Use case | One-time data fetch | Reactive data with updates |

## Apollo Client Documentation Reference

From Apollo Client docs:
> "The `cache-and-network` fetchPolicy does not work with `client.query`, because `client.query` 
> can only return a single result. Please use `client.watchQuery` to receive multiple results 
> from the cache and the network."

## Testing

✅ Build successful
✅ Dev server starts without errors
✅ No invariant violation errors
✅ GraphQL queries execute correctly
✅ Variable changes trigger re-queries
✅ All fetch policies supported

## Related Files

- `src/composables/useApolloQuery.ts` - Main implementation
- `src/composables/README.md` - Usage documentation
- `APOLLO_CLIENT_4_MIGRATION.md` - Migration guide
