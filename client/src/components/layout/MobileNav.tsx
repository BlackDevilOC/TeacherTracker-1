import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  Users,
  MessageSquare,
  BookOpen,
  MoreHorizontal
} from 'lucide-react';

const MobileNav: React.FC = () => {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="lg:hidden flex items-center justify-around bg-white border-t py-2">
      <Link href="/">
        <a className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}>
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/attendance">
        <a className={`flex flex-col items-center p-2 ${isActive('/attendance') ? 'text-primary' : 'text-gray-500'}`}>
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Attendee</span>
        </a>
      </Link>
      <Link href="/sms">
        <a className={`flex flex-col items-center p-2 ${isActive('/sms') ? 'text-primary' : 'text-gray-500'}`}>
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">SMS</span>
        </a>
      </Link>
      <Link href="/absences">
        <a className={`flex flex-col items-center p-2 ${isActive('/absences') ? 'text-primary' : 'text-gray-500'}`}>
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Class</span>
        </a>
      </Link>
      <Link href="/more">
        <a className={`flex flex-col items-center p-2 ${isActive('/more') ? 'text-primary' : 'text-gray-500'}`}>
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-xs mt-1">More</span>
        </a>
      </Link>
    </nav>
  );
};

export default MobileNav;
