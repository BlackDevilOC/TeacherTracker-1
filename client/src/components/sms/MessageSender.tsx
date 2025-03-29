import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Teacher } from '@/types';
import { getCurrentDate } from '@/utils/dateUtils';

interface MessageSenderProps {
  selectedTeachers: Teacher[];
}

const MESSAGE_TEMPLATES = [
  {
    id: 'substitute',
    name: 'Default Substitute Assignment Message',
    template: 'Dear [Teacher Name], You have been assigned as a substitute for [Class] during Period [Number] on [Date]. Please confirm your availability. Thank you.',
  },
  {
    id: 'meeting',
    name: 'Meeting Notification',
    template: 'Dear [Teacher Name], There will be a staff meeting on [Date] at [Time] in the [Location]. Your attendance is required. Thank you.',
  },
  {
    id: 'schedule',
    name: 'Schedule Change Alert',
    template: 'Dear [Teacher Name], Please note that there has been a change in your schedule for [Date]. Please check the updated timetable. Thank you.',
  },
  {
    id: 'custom',
    name: 'Custom Message',
    template: '',
  },
];

const MessageSender: React.FC<MessageSenderProps> = ({ selectedTeachers }) => {
  const { toast } = useToast();
  const [templateId, setTemplateId] = useState('substitute');
  const [messageText, setMessageText] = useState(MESSAGE_TEMPLATES[0].template);
  const [previewTeacherId, setPreviewTeacherId] = useState<number | null>(null);
  
  // Set preview teacher as the first selected teacher
  React.useEffect(() => {
    if (selectedTeachers.length > 0 && !previewTeacherId) {
      setPreviewTeacherId(selectedTeachers[0].id);
    }
  }, [selectedTeachers, previewTeacherId]);
  
  // Handle template change
  const handleTemplateChange = (templateId: string) => {
    setTemplateId(templateId);
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setMessageText(template.template);
    }
  };
  
  // Generate preview message for a specific teacher
  const generatePreviewMessage = (teacherId: number): string => {
    const teacher = selectedTeachers.find(t => t.id === teacherId);
    if (!teacher) return messageText;
    
    return messageText
      .replace(/\[Teacher Name\]/g, teacher.name)
      .replace(/\[Class\]/g, '10A')
      .replace(/\[Number\]/g, '3')
      .replace(/\[Date\]/g, new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }))
      .replace(/\[Time\]/g, '2:00 PM')
      .replace(/\[Location\]/g, 'Staff Room');
  };
  
  // Send messages mutation
  const sendMessagesMutation = useMutation({
    mutationFn: async () => {
      if (selectedTeachers.length === 0) {
        throw new Error('No recipients selected');
      }
      
      const currentDate = getCurrentDate();
      const messages = selectedTeachers.map(teacher => ({
        teacherId: teacher.id,
        message: generatePreviewMessage(teacher.id),
        date: currentDate,
        status: 'sent'
      }));
      
      return apiRequest('POST', '/api/messages', messages);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activity-logs'] });
      
      toast({
        title: 'Messages Sent',
        description: `Successfully sent messages to ${selectedTeachers.length} teachers`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Send Messages',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  });
  
  const handleSendMessages = () => {
    sendMessagesMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-medium mb-4">Message</Label>
        <Select value={templateId} onValueChange={handleTemplateChange}>
          <SelectTrigger className="w-full mb-4">
            <SelectValue placeholder="Select a message template" />
          </SelectTrigger>
          <SelectContent>
            {MESSAGE_TEMPLATES.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Textarea
          className="w-full p-3 border border-gray-300 rounded-lg h-32"
          placeholder="Enter your message here..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
      </div>
      
      {selectedTeachers.length > 0 && previewTeacherId && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Message Preview</h3>
          <Select value={previewTeacherId.toString()} onValueChange={(value) => setPreviewTeacherId(parseInt(value))}>
            <SelectTrigger className="w-full mb-2 bg-white">
              <SelectValue placeholder="Select teacher for preview" />
            </SelectTrigger>
            <SelectContent>
              {selectedTeachers.map(teacher => (
                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-600">
            {generatePreviewMessage(previewTeacherId)}
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <span className="font-medium">{selectedTeachers.length}</span> recipients selected
        </div>
        <Button
          onClick={handleSendMessages}
          disabled={selectedTeachers.length === 0 || !messageText || sendMessagesMutation.isPending}
        >
          Send Messages
        </Button>
      </div>
    </div>
  );
};

export default MessageSender;
