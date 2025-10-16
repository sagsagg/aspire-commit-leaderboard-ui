# Apollo Client 4.x Composables for Vue 3

This directory contains custom Vue 3 composables for using Apollo Client 4.x directly without `@vue/apollo-composable`.

## Why Custom Composables?

As of now, `@vue/apollo-composable` only supports Apollo Client 3.x. To use the latest Apollo Client 4.x with Vue 3, we've created custom composables that provide similar functionality using Vue's Composition API.

## Important Notes

- **Import from '@apollo/client'** not '@apollo/client/core' for proper tree-shaking and type support
- **Use HttpLink class** instead of createHttpLink function
- Apollo Client 4.x requires explicit HttpLink instantiation

## useApolloQuery

A custom composable that provides reactive GraphQL query functionality similar to the `useQuery` hook from `@vue/apollo-composable`.

### Features

- ✅ Reactive query execution using `watchQuery` (supports all fetch policies including `cache-and-network`)
- ✅ Automatic refetching when variables change (using `setVariables`)
- ✅ Loading and error states
- ✅ Manual refetch capability
- ✅ Polling support (built-in via `pollInterval`)
- ✅ Configurable fetch policies (cache-first, cache-only, network-only, no-cache, cache-and-network)
- ✅ Proper subscription cleanup on unmount

### Usage

```typescript
import { useApolloQuery } from '@/composables/useApolloQuery';
import { inject, computed, ref } from 'vue';
import { type ApolloClient } from '@apollo/client/core';
import gql from 'graphql-tag';

// In your component
const apolloClient = inject<ApolloClient>('apolloClient');

const myVariable = ref('some-value');

const { result, loading, error, refetch } = useApolloQuery<MyDataType>(
  apolloClient!,
  gql\`
    query MyQuery($variable: String!) {
      myField(variable: $variable) {
        id
        name
      }
    }
  \`,
  {
    variables: computed(() => ({ variable: myVariable.value })),
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000, // Optional: poll every 5 seconds
  }
);
```

### API

#### Parameters

- `client: ApolloClient` - The Apollo Client instance (no generic in v4)
- `query: DocumentNode` - The GraphQL query document
- `options?: UseQueryOptions<TVariables>` - Optional configuration

#### Options

```typescript
interface UseQueryOptions<TVariables> {
  variables?: Ref<TVariables> | TVariables; // Query variables (reactive or static)
  pollInterval?: number; // Polling interval in milliseconds
  fetchPolicy?: 'cache-first' | 'cache-only' | 'network-only' | 'no-cache' | 'cache-and-network';
}
```

#### Return Value

```typescript
interface UseQueryResult<TData> {
  result: Ref<TData | undefined>; // Query result data
  loading: Ref<boolean>; // Loading state
  error: Ref<ErrorLike | undefined>; // Error state (ErrorLike has message, name, stack)
  refetch: () => Promise<void>; // Manual refetch function
}

// Note: Apollo Client 4.x removed ApolloError, use ErrorLike instead
interface ErrorLike {
  message: string;
  name: string;
  stack?: string;
}
```

## Benefits of Apollo Client 4.x

- **Smaller Bundle Size**: ~20-30% reduction compared to v3
- **Better TypeScript Support**: Improved type inference
- **Modern Build Targets**: Optimized for current browsers
- **Opt-in Architecture**: Include only what you need

## Future

When `@vue/apollo-composable` adds support for Apollo Client 4.x, you can migrate back to using the official package.
