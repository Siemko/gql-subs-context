import { ApolloProvider } from "@apollo/client";
import { AppProps } from "next/app";
import { useApollo } from "../lib/apolloClient";

export default function App({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo();

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
