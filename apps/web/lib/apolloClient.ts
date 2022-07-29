import { useMemo } from "react";
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

let apolloClient: ApolloClient<any>;

function createApolloClient() {
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const httpLink = new HttpLink({
    uri: "http://localhost:4000/graphql", // Server URL (must be absolute)
    credentials: "same-origin", // Additional fetch() options like `credentials` or `headers`
  });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: "ws://localhost:4000/subscriptions",
          })
        )
      : null;
  const splitLink =
    typeof window !== "undefined" && wsLink != null
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([errorLink, splitLink]),
    cache: new InMemoryCache(),
  });
}

export function initializeApollo() {
  const _apolloClient = apolloClient ?? createApolloClient();
  if (typeof window === "undefined") return _apolloClient;
  if (!apolloClient) apolloClient = _apolloClient;
  return _apolloClient;
}

export function useApollo() {
  const store = useMemo(() => initializeApollo(), []);
  return store;
}
