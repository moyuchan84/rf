import { ApolloProvider } from '@apollo/client/react';
import { client } from './shared/lib/apollo-client';
import { AppRouter } from './app/routes';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from './shared/store/useThemeStore';

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ApolloProvider client={client}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: theme === 'dark' ? '#0f172a' : '#ffffff',
          color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
        },
      }} />
      <AppRouter />
    </ApolloProvider>
  );
}

export default App;
