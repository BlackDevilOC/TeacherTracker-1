import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { Menu, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SheetContent, SheetTrigger, Sheet } from '@/components/ui/sheet';
import { formatReadableDate } from '@/utils/dateUtils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get page title based on current location
  const getPageTitle = () => {
    switch (true) {
      case location === '/':
        return 'Dashboard';
      case location === '/attendance':
        return 'Teacher Attendance';
      case location === '/absences':
        return 'Manage Absences';
      case location === '/sms':
        return 'SMS Messaging';
      case location === '/data-import':
        return 'Import Data';
      case location === '/more':
        return 'More Options';
      default:
        return 'School Substitution Manager';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mr-2">
            <span className="font-bold">SM</span>
          </div>
          <h1 className="text-xl font-medium">SchoolSubMaster</h1>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="p-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1 h-full">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 bg-white border-r h-full">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2 hidden md:block">
                  {formatReadableDate(new Date())}
                </span>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Bell className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
};

export default Layout;
