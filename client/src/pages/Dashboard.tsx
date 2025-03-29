import React from 'react';
import PeriodStatus from '@/components/dashboard/PeriodStatus';
import QuickActions from '@/components/dashboard/QuickActions';
import StatusOverview from '@/components/dashboard/StatusOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';

const Dashboard: React.FC = () => {
  return (
    <div>
      {/* Period Status */}
      <PeriodStatus />
      
      {/* Quick Actions */}
      <div className="mt-6">
        <QuickActions />
      </div>
      
      {/* Status Overview */}
      <div className="mt-6">
        <StatusOverview />
      </div>
      
      {/* Recent Activity */}
      <div className="mt-6">
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;
