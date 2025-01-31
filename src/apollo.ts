import { ApolloClient, InMemoryCache } from '@apollo/client/core';

// Create the Apollo client
export const apolloClient = new ApolloClient({
  uri: `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`, // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});
