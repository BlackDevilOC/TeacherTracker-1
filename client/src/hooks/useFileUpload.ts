import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { UploadResult } from '@/types';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, endpoint: string): Promise<UploadResult> => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'No file selected',
        variant: 'destructive',
      });
      throw new Error('No file selected');
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setProgress((prevProgress) => {
          const nextProgress = prevProgress + 10;
          return nextProgress > 90 ? 90 : nextProgress;
        });
      }, 300);

      const response = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to upload file: ${response.status}`);
      }

      const result: UploadResult = await response.json();
      
      toast({
        title: 'Upload Complete',
        description: result.message,
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUploading(false);
      // Reset progress after a delay to show completion
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
  };
};
