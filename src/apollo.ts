import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

// HTTP connection to the API
const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`,
});

// Cache implementation
const cache = new InMemoryCache();

// Create the Apollo client
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});
