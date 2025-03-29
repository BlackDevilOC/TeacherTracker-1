import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploaderProps {
  title: string;
  description: string;
  fileType: 'teachers' | 'timetable';
  onUploadComplete?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  title, 
  description, 
  fileType,
  onUploadComplete 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading, progress } = useFileUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadFile(selectedFile, fileType);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <FileText className="text-2xl text-primary mr-3" />
          <h2 className="text-lg font-medium">{title}</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
                <span className="ml-2 text-sm font-medium">{selectedFile.name}</span>
              </div>
              
              {isUploading && (
                <Progress value={progress} className="h-2 w-full" />
              )}
              
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">Drag and drop file here or</p>
              <Button
                variant="outline"
                className="bg-blue-50 text-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
