import { ApolloProvider } from '@apollo/client/react';
import { client } from './shared/lib/apollo-client';
import { AppRouter } from './app/routes';

function App() {
  return (
    <ApolloProvider client={client}>
      <AppRouter />
    </ApolloProvider>
  );
}

export default App;
