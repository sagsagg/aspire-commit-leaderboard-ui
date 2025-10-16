import { ref, watch, onUnmounted, type Ref } from 'vue';
import { type ApolloClient, type DocumentNode, type ApolloError, type OperationVariables, type ObservableQuery } from '@apollo/client';

export interface UseQueryOptions<TVariables extends OperationVariables> {
  variables?: Ref<TVariables> | TVariables;
  pollInterval?: number;
  fetchPolicy?: 'cache-first' | 'cache-only' | 'network-only' | 'no-cache' | 'cache-and-network';
}

export interface UseQueryResult<TData> {
  result: Ref<TData | undefined>;
  loading: Ref<boolean>;
  error: Ref<ApolloError | undefined>;
  refetch: () => Promise<void>;
}

export function useApolloQuery<TData = any, TVariables extends OperationVariables = OperationVariables>(
  client: ApolloClient<any>,
  query: DocumentNode,
  options: UseQueryOptions<TVariables> = {}
): UseQueryResult<TData> {
  const result = ref<TData>();
  const loading = ref(true);
  const error = ref<ApolloError>();
  
  let observableQuery: ObservableQuery<TData, TVariables> | null = null;
  let subscription: any = null;

  const getVariables = (): TVariables | undefined => {
    if (!options.variables) return undefined;
    return (typeof options.variables === 'object' && 'value' in options.variables 
      ? options.variables.value 
      : options.variables) as TVariables;
  };

  // Create ObservableQuery using watchQuery (supports cache-and-network)
  observableQuery = client.watchQuery<TData, TVariables>({
    query,
    variables: getVariables(),
    fetchPolicy: options.fetchPolicy || 'cache-first',
    pollInterval: options.pollInterval,
  });

  // Subscribe to query results
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

  const refetch = async () => {
    if (observableQuery) {
      await observableQuery.refetch();
    }
  };

  // Watch for variable changes if variables is a ref
  if (options.variables && typeof options.variables === 'object' && 'value' in options.variables) {
    watch(options.variables, (newVariables) => {
      if (observableQuery) {
        observableQuery.setVariables(newVariables as TVariables);
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
    result: result as Ref<TData | undefined>,
    loading,
    error,
    refetch,
  };
}
