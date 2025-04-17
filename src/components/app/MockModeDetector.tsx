
import React, { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

// Enhanced global mock mode detection function with safeguards
export const isMockMode = (): boolean => {
  try {
    // First check if we're in a browser environment at all
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Then safely check localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem("USE_MOCK_MODE") === "true";
      } catch (e) {
        console.error("Error accessing localStorage for mock mode check:", e);
      }
    }
    
    // If localStorage access failed, try URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('mock') === 'true';
    } catch (e) {
      console.error("Error checking URL parameters for mock mode:", e);
    }
    
    return false;
  } catch (e) {
    // Catch any unexpected errors and default to false
    console.error("Unexpected error checking mock mode:", e);
    return false;
  }
};

interface MockModeDetectorProps {
  onDetected: (isMockMode: boolean) => void;
}

const MockModeDetector: React.FC<MockModeDetectorProps> = ({ onDetected }) => {
  useEffect(() => {
    try {
      // Double check we're in browser
      if (typeof window === 'undefined') return;
      
      // Check for mock mode on initial load with error handling
      let mockEnabled = false;
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        mockEnabled = urlParams.get('mock') === 'true';
      } catch (urlError) {
        console.error("Error checking URL parameters:", urlError);
      }
      
      onDetected(mockEnabled);
      
      // Only attempt localStorage operations if available
      if (typeof localStorage !== 'undefined') {
        try {
          // Store in localStorage for consistent global access
          localStorage.setItem("USE_MOCK_MODE", mockEnabled ? "true" : "false");
          
          if (mockEnabled) {
            console.log('[ROOT APP] Mock mode detected - using simulated data');
            
            toast({
              title: "🎭 Mock Data Mode Active",
              description: "Using simulated data instead of connecting to Meta API",
              duration: 5000,
            });
            
            // Store additional information
            localStorage.setItem('mock_mode_enabled', 'true');
            localStorage.setItem('mock_mode_enabled_at', new Date().toISOString());
            
            // Pre-populate required states to ensure UI works correctly
            localStorage.setItem('selected_ad_account', 'act_123456789');
            localStorage.setItem('meta_auth_token', 'mock_token_123456789');
            
            // Dispatch event to notify components about mock mode
            window.dispatchEvent(new CustomEvent('mock-mode-enabled'));
          } else {
            localStorage.removeItem('mock_mode_enabled');
            localStorage.removeItem('USE_MOCK_MODE');
          }
        } catch (storageError) {
          console.error("Error manipulating localStorage:", storageError);
        }
      }
    } catch (e) {
      console.error("Error in mock mode initialization:", e);
    }
  }, [onDetected]);

  return null;
};

export default MockModeDetector;
