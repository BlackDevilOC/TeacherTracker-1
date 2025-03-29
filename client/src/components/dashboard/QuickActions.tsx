import React from 'react';
import { Link } from 'wouter';
import {
  Clock,
  UserCheck,
  Calendar,
  AlarmClock
} from 'lucide-react';

const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  href: string;
}> = ({ icon, title, href }) => (
  <Link href={href}>
    <a className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow">
      <div className="text-4xl text-primary mb-2 flex justify-center">
        {icon}
      </div>
      <h3 className="font-medium">{title}</h3>
    </a>
  </Link>
);

const QuickActions: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          icon={<Clock />}
          title="Manage Absences"
          href="/absences"
        />
        <QuickActionCard
          icon={<UserCheck />}
          title="Substitutes"
          href="/attendance"
        />
        <QuickActionCard
          icon={<Calendar />}
          title="Schedule"
          href="/data-import"
        />
        <QuickActionCard
          icon={<AlarmClock />}
          title="Periods"
          href="/more"
        />
      </div>
    </div>
  );
};

export default QuickActions;
