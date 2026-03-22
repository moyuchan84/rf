import { Employee } from '@/features/employee/store/useEmployeeStore';

export interface SystemDefaultMailer {
  id: number;
  category: string;
  recipients: Employee[];
}

export interface AdminRole {
  id: number;
  name: string;
  description?: string;
}

export interface AdminUser {
  id: number;
  epId: string;
  userId: string;
  fullName: string;
  deptName: string;
  email: string;
  role: AdminRole;
}

export interface PaginatedUsers {
  items: AdminUser[];
  totalCount: number;
}
