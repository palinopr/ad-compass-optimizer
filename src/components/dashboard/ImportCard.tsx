
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const ImportCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Import Ad Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
          <h3 className="text-sm font-medium mb-1">Drop Meta Ads CSV file here</h3>
          <p className="text-xs text-gray-500 mb-4">or click to browse files</p>
          
          <div className="flex justify-center space-x-2 mb-4">
            <Button size="sm" className="bg-meta-blue hover:bg-meta-dark">
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
      </CardContent>
    </Card>
  );
};

export default ImportCard;
