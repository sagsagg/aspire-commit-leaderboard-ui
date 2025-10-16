import { ref, watch, onUnmounted, type Ref } from 'vue';
import { type ApolloClient, type DocumentNode, type OperationVariables, type ObservableQuery, type ErrorLike, type DataValue, type WatchQueryFetchPolicy } from '@apollo/client';
import type { Subscription } from 'rxjs';

export interface UseQueryOptions<TVariables extends OperationVariables> {
  variables?: Ref<TVariables> | TVariables;
  pollInterval?: number;
  fetchPolicy?: 'cache-first' | 'cache-only' | 'network-only' | 'no-cache' | 'cache-and-network';
}

export interface UseQueryResult<TData> {
  result: Ref<DataValue.Complete<TData> | undefined>;
  loading: Ref<boolean>;
  error: Ref<ErrorLike | undefined>;
  refetch: () => Promise<void>;
}

export function useApolloQuery<TData = unknown, TVariables extends OperationVariables = OperationVariables>(
  client: ApolloClient,
  query: DocumentNode,
  options: UseQueryOptions<TVariables> = {}
): UseQueryResult<TData> {
  const result = ref<DataValue.Complete<TData> | undefined>();
  const loading = ref(true);
  const error = ref<ErrorLike | undefined>();

  let observableQuery: ObservableQuery<TData, TVariables> | null = null;
  let subscription: Subscription | null = null;

  const getVariables = () => {
    if (!options.variables) return undefined;
    return (typeof options.variables === 'object' && 'value' in options.variables
      ? options.variables.value
      : options.variables);
  };

  // Create ObservableQuery using watchQuery (supports cache-and-network)
  const fetchPolicy: WatchQueryFetchPolicy = options.fetchPolicy || 'cache-first';
  const variables = getVariables();
  const pollInterval = options.pollInterval;

  // TypeScript's VariablesOption conditional type requires specific handling
  // We build the options explicitly based on which properties are defined
  if (pollInterval !== undefined) {
    observableQuery = client.watchQuery({
      query,
      variables,
      fetchPolicy,
      pollInterval,
    });
  } else {
    observableQuery = client.watchQuery({
      query,
      variables,
      fetchPolicy,
    });
  }

  // Subscribe to query results
  subscription = observableQuery.subscribe({
    next: (queryResult) => {
      loading.value = queryResult.loading;
      // When dataState is 'complete', data is guaranteed to be DataValue.Complete<TData>
      if (queryResult.dataState === 'complete' || queryResult.dataState === 'streaming') {
        result.value = queryResult.data;
      } else {
        result.value = undefined;
      }
      error.value = queryResult.error;
    },
    error: (err) => {
      loading.value = false;
      error.value = err;
    },
  });

  const refetch = async () => {
    if (observableQuery) {
      await observableQuery.refetch();
    }
  };

  // Watch for variable changes if variables is a ref
  const varsOption = options.variables;
  if (varsOption && typeof varsOption === 'object' && 'value' in varsOption) {
    // After type guard, TypeScript narrows this to Ref<TVariables>
    watch(() => varsOption.value, (newVariables: TVariables) => {
      if (observableQuery && newVariables !== undefined) {
        observableQuery.setVariables(newVariables);
      }
    }, { deep: true });
  }

  // Cleanup
  onUnmounted(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
    if (observableQuery) {
      observableQuery.stopPolling();
    }
  });

  return {
    result,
    loading,
    error,
    refetch,
  };
}
