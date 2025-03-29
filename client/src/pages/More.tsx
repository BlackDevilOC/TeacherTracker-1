import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Settings from '@/components/settings/Settings';
import {
  MessageSquare,
  Clock,
  Settings as SettingsIcon,
  UserCheck,
  Bell,
  ArrowRight
} from 'lucide-react';

const OptionLink: React.FC<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = ({ href, label, icon }) => (
  <Link href={href}>
    <a className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <span className="font-medium ml-3">{label}</span>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400" />
    </a>
  </Link>
);

const More: React.FC = () => {
  return (
    <div>
      <Tabs defaultValue="options">
        <TabsList className="mb-6">
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="options" className="space-y-4">
          <OptionLink 
            href="/sms/history" 
            label="SMS History" 
            icon={<MessageSquare className="h-5 w-5 text-primary" />} 
          />
          
          <OptionLink 
            href="/sms" 
            label="SMS Send" 
            icon={<MessageSquare className="h-5 w-5 text-primary" />} 
          />
          
          <OptionLink 
            href="/periods" 
            label="Periods" 
            icon={<Clock className="h-5 w-5 text-primary" />} 
          />
          
          <OptionLink 
            href="/settings" 
            label="Settings" 
            icon={<SettingsIcon className="h-5 w-5 text-primary" />} 
          />
          
          <OptionLink 
            href="/absences/view" 
            label="Assigned Substitutes" 
            icon={<UserCheck className="h-5 w-5 text-primary" />} 
          />
          
          <OptionLink 
            href="/notifications" 
            label="Notifications" 
            icon={<Bell className="h-5 w-5 text-primary" />} 
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <Settings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default More;
