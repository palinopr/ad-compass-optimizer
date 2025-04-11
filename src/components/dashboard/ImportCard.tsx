
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import MetaApiConnect from './MetaApiConnect';

const ImportCard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        toast({
          title: "File selected",
          description: `${selectedFile.name} selected successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file format",
          description: "Please upload a CSV file.",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        toast({
          title: "File dropped",
          description: `${droppedFile.name} selected successfully.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file format",
          description: "Please upload a CSV file.",
        });
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Import Ad Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload">Manual Upload</TabsTrigger>
            <TabsTrigger value="api">Meta API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-2">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'bg-gray-100 border-meta-blue' : 'bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden" 
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">{file.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">Ready to process</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                  <h3 className="text-sm font-medium mb-1">Drop Meta Ads CSV file here</h3>
                  <p className="text-xs text-gray-500 mb-4">or click to browse files</p>
                </>
              )}
              
              <div className="flex justify-center space-x-2 mb-4">
                <Button 
                  size="sm" 
                  className="bg-meta-blue hover:bg-meta-dark"
                  onClick={handleUploadClick}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload CSV
                </Button>
                <Button size="sm" variant="outline">
                  Connect Meta Account
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                Supports Meta Ads Manager exports
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="pt-2">
            <MetaApiConnect />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImportCard;
