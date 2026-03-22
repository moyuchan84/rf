import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  Palette, 
  Table2, 
  Layers, 
  Search,
  Users,
  Mail
} from 'lucide-react';

export const navItems = [
  { icon: LayoutDashboard, label: 'HOME', path: '/' },
  { icon: ClipboardList, label: '의뢰정보', path: '/requests' },
  { icon: Database, label: '기준정보', path: '/master-data' },
  { icon: Palette, label: '키디자인', path: '/key-design' },
  { icon: Table2, label: '키테이블', path: '/key-table' },
  { icon: Layers, label: '레이아웃', path: '/layout' },
  { icon: Mail, label: '메일관리', path: '/mailing' },
  { icon: Search, label: 'R-BOT', path: '/rag' },
  { icon: Users, label: '사용자관리', path: '/admin/users', roles: ['ADMIN'] },
];
