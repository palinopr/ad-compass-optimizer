
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AuthenticationStatusProps {
  isAuthenticated: boolean;
}

const AuthenticationStatus: React.FC<AuthenticationStatusProps> = ({ isAuthenticated }) => {
  return (
    <>
      <div>Authentication:</div>
      <div className="flex items-center">
        {isAuthenticated ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">Authenticated</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">Not Authenticated</span>
          </>
        )}
      </div>
    </>
  );
};

export default AuthenticationStatus;
