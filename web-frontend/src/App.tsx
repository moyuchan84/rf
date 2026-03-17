import { ApolloProvider } from '@apollo/client/react';
import { client } from './shared/lib/apollo-client';
import { AppRouter } from './app/routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ApolloProvider client={client}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#0f172a',
          color: '#f1f5f9',
          border: '1px solid #1e293b',
        },
      }} />
      <AppRouter />
    </ApolloProvider>
  );
}

export default App;
