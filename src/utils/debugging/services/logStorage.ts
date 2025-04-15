
import { CampaignFetchLog } from '../types/campaignLogTypes';

class LogStorage {
  private static logs: CampaignFetchLog[] = [];
  private static maxLogs = 10;

  static addLog(log: CampaignFetchLog): void {
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }
  }

  static getLogs(): CampaignFetchLog[] {
    return this.logs;
  }
}

export default LogStorage;
