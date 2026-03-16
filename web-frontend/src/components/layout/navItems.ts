import { 
  LayoutDashboard, 
  ClipboardList, 
  Database, 
  Palette, 
  Table2, 
  Layers, 
  Search 
} from 'lucide-react';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ClipboardList, label: 'Requests', path: '/requests' },
  { icon: Database, label: 'Master Data', path: '/master-data' },
  { icon: Palette, label: 'Key Design', path: '/key-design' },
  { icon: Table2, label: 'Photo Key Table', path: '/key-table' },
  { icon: Layers, label: 'Key Layout', path: '/layout' },
  { icon: Search, label: 'RAG Search', path: '/rag' },
];
