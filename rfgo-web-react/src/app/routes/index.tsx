import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '../../components/layout/RootLayout';
import HomePage from '../../pages/HomePage';
import RequestsPage from '../../pages/RequestsPage';
import MasterDataPage from '../../pages/MasterDataPage';
import KeyDesignPage from '../../pages/KeyDesignPage';
import KeyTablePage from '../../pages/KeyTablePage';
import KeyLayoutPage from '../../pages/KeyLayoutPage';
import RagSearchPage from '../../pages/RagSearchPage';
import MailingPage from '../../pages/MailingPage';
import { UserManagement } from '../../pages/admin/UserManagement';
import { PermissionGate } from '@/features/auth/components/PermissionGate';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'master-data', element: <MasterDataPage /> },
      { path: 'key-design', element: <KeyDesignPage /> },
      { path: 'key-table', element: <KeyTablePage /> },
      { path: 'layout', element: <KeyLayoutPage /> },
      { path: 'mailing', element: <MailingPage /> },
      { path: 'rag', element: <RagSearchPage /> },
      { 
        path: 'admin/users', 
        element: (
          <PermissionGate allowedRoles={['ADMIN']}>
            <UserManagement />
          </PermissionGate>
        ) 
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
