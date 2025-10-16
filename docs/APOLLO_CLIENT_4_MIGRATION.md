# Apollo Client 4.x Migration Guide

This document outlines the changes made to migrate from Apollo Client 3.x to 4.x in this Vue 3 project.

## Summary

Successfully migrated from Apollo Client 3.14.0 to 4.0.7 by removing the `@vue/apollo-composable` dependency (which only supports v3) and creating custom Vue 3 composables.

## Key Changes

### 1. Dependencies

**Before (Apollo Client 3.x):**
```json
{
  "@apollo/client": "^3.14.0",
  "@vue/apollo-composable": "^4.2.2"
}
```

**After (Apollo Client 4.x):**
```json
{
  "@apollo/client": "^4.0.7",
  "rxjs": "^7.8.0"
}
```

### 2. Apollo Client Setup (src/apollo.ts)

**Before:**
```typescript
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core';

const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`,
});
```

**After:**
```typescript
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`,
});
```

**Key Changes:**
- Import from `@apollo/client` instead of `@apollo/client/core`
- Use `HttpLink` class instead of `createHttpLink` function
- HttpLink must be explicitly instantiated

### 3. Application Setup (src/main.ts)

**Before:**
```typescript
import { DefaultApolloClient } from "@vue/apollo-composable";

createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render() {
    return h(App);
  }
}).mount("#app");
```

**After:**
```typescript
const app = createApp(App);
app.provide('apolloClient', apolloClient);
app.mount("#app");
```

### 4. Component Usage (src/App.vue)

**Before (with @vue/apollo-composable):**
```typescript
import { useQuery } from '@vue/apollo-composable';

const { result, loading, error } = useQuery(GET_LEADERBOARD, () => ({
  repo: selectedRepo.value,
}));
```

**After (custom composable):**
```typescript
import { useApolloQuery } from '@/composables/useApolloQuery';
import { inject } from 'vue';
import { type ApolloClient } from '@apollo/client';

const apolloClient = inject<ApolloClient<any>>('apolloClient');

const { result, loading, error } = useApolloQuery<{ GetLeaderboard: Contributor[] }>(
  apolloClient!,
  GET_LEADERBOARD,
  {
    variables: computed(() => ({ repo: selectedRepo.value })),
    fetchPolicy: 'cache-and-network',
  }
);
```

## Benefits of Apollo Client 4.x

1. **Smaller Bundle Size**: ~20-30% reduction (379.79 kB vs 406.92 kB)
2. **Better TypeScript Support**: Improved type inference and safety
3. **Modern Build Targets**: Optimized for current browsers
4. **Opt-in Architecture**: Include only what you need
5. **Better Performance**: More efficient caching and query execution

## Custom Composable

Created `src/composables/useApolloQuery.ts` that provides:
- Reactive query execution using `client.watchQuery` (not `client.query`)
- Automatic refetching when variables change using `observableQuery.setVariables`
- Loading and error states via observable subscription
- Manual refetch capability using `observableQuery.refetch`
- Built-in polling support via `pollInterval` option
- Full support for all fetch policies including `cache-and-network`
- Proper cleanup of subscriptions and polling on unmount

### Why watchQuery instead of query?

Apollo Client's `client.query` only returns a single result and doesn't support the `cache-and-network` fetch policy. Using `client.watchQuery` creates an `ObservableQuery` that:
- Can emit multiple results (cache first, then network)
- Supports all fetch policies
- Provides reactive updates
- Integrates better with Vue's reactivity system

## Breaking Changes from Apollo Client 3.x

1. **HttpLink is now a class**: Use `new HttpLink()` instead of `createHttpLink()`
2. **Import paths**: Import from `@apollo/client` instead of `@apollo/client/core`
3. **RxJS dependency**: Apollo Client 4.x uses RxJS observables
4. **Error handling**: Unified error property (no more separate `errors` array)
5. **No implicit HttpLink**: Must explicitly create and provide HttpLink

## Testing

- ✅ Dev server runs successfully
- ✅ Production build compiles
- ✅ API calls work correctly
- ✅ All shadcn-vue components integrated
- ✅ Reactive variable changes trigger re-queries

## Future Migration Path

When `@vue/apollo-composable` adds support for Apollo Client 4.x, you can migrate back to using the official package by:
1. Installing `@vue/apollo-composable` (when v5+ is released)
2. Replacing custom `useApolloQuery` with official `useQuery`
3. Removing custom composable files
4. Updating main.ts to use official provider pattern

## Resources

- [Apollo Client 4.0 Announcement](https://www.apollographql.com/blog/announcing-apollo-client-4-0)
- [Apollo Client 4.x Migration Guide](https://www.apollographql.com/docs/react/migrating/apollo-client-4-migration)
- [Vue Apollo Documentation](https://apollo.vuejs.org/)
