import React, { useState } from 'react';
import RecipientSelector from '@/components/sms/RecipientSelector';
import MessageSender from '@/components/sms/MessageSender';
import { Teacher } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

const SMS: React.FC = () => {
  const [selectedTeachers, setSelectedTeachers] = useState<Teacher[]>([]);

  const handleSelectionChange = (teachers: Teacher[]) => {
    setSelectedTeachers(teachers);
  };

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Compose and preview SMS messages for teachers
      </p>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Recipient Selector */}
        <RecipientSelector onSelectionChange={handleSelectionChange} />
        
        {/* Message Composer */}
        <Card>
          <CardContent className="p-6">
            <MessageSender selectedTeachers={selectedTeachers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMS;
