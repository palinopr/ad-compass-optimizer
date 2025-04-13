
import React from 'react';
import FacebookLoginTab from '@/components/meta/FacebookLoginTab';

interface LoginStepProps {
  onLoginSuccess: (userData: any) => void;
}

const LoginStep: React.FC<LoginStepProps> = ({ onLoginSuccess }) => {
  return <FacebookLoginTab onLoginSuccess={onLoginSuccess} />;
};

export default LoginStep;
