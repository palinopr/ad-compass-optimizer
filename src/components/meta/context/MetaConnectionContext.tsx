
import React, { createContext, useContext } from 'react';
import { MetaConnectionContextType, initialMetaConnectionContext } from '../types/metaConnection';

// Create the context with default values
const MetaConnectionContext = createContext<MetaConnectionContextType>(initialMetaConnectionContext);

// Custom hook for consuming the context
export const useMetaConnection = () => useContext(MetaConnectionContext);

// Export the context for the provider
export { MetaConnectionContext };
