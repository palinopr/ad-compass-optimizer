
import { QueueManager } from './QueueManager';

// Export the singleton instance
export const strictSequentialQueue = QueueManager.getInstance();

// Explicitly expose the singleton to make it more obvious this is the only instance
Object.freeze(strictSequentialQueue);
