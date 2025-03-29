import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Calendar,
  Users,
  RefreshCw,
  MessageSquare,
  Settings,
  Upload,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center">
        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-3">
          <span className="font-bold">SM</span>
        </div>
        <div>
          <h1 className="text-lg font-medium">SchoolSubMaster</h1>
          <p className="text-sm text-gray-500">Teacher Management</p>
        </div>
      </div>
      <div className="py-4 flex-1">
        <div className="px-4 mb-2 text-sm font-medium text-gray-500 uppercase">Main</div>
        <Link href="/">
          <a className={`flex items-center px-4 py-3 ${isActive('/') 
            ? 'text-primary bg-blue-50 border-r-4 border-primary' 
            : 'text-gray-700 hover:bg-gray-100'}`}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            <span>Dashboard</span>
          </a>
        </Link>
        <Link href="/attendance">
          <a className={`flex items-center px-4 py-3 ${isActive('/attendance') 
            ? 'text-primary bg-blue-50 border-r-4 border-primary' 
            : 'text-gray-700 hover:bg-gray-100'}`}>
            <Users className="mr-3 h-5 w-5" />
            <span>Attendance</span>
          </a>
        </Link>
        <Link href="/absences">
          <a className={`flex items-center px-4 py-3 ${isActive('/absences') 
            ? 'text-primary bg-blue-50 border-r-4 border-primary' 
            : 'text-gray-700 hover:bg-gray-100'}`}>
            <RefreshCw className="mr-3 h-5 w-5" />
            <span>Substitutions</span>
          </a>
        </Link>
        <Link href="/sms">
          <a className={`flex items-center px-4 py-3 ${isActive('/sms') 
            ? 'text-primary bg-blue-50 border-r-4 border-primary' 
            : 'text-gray-700 hover:bg-gray-100'}`}>
            <MessageSquare className="mr-3 h-5 w-5" />
            <span>SMS Notifications</span>
          </a>
        </Link>
        
        <div className="px-4 mt-6 mb-2 text-sm font-medium text-gray-500 uppercase">Settings</div>
        <Link href="/more">
          <a className={`flex items-center px-4 py-3 ${isActive('/more') 
            ? 'text-primary bg-blue-50 border-r-4 border-primary' 
            : 'text-gray-700 hover:bg-gray-100'}`}>
            <Settings className="mr-3 h-5 w-5" />
            <span>Configuration</span>
          </a>
        </Link>
        <Link href="/data-import">
          <a className={`flex items-center px-4 py-3 ${isActive('/data-import') 
            ? 'text-primary bg-blue-50 border-r-4 border-primary' 
            : 'text-gray-700 hover:bg-gray-100'}`}>
            <Upload className="mr-3 h-5 w-5" />
            <span>Import Data</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};

export default Sidebar;
