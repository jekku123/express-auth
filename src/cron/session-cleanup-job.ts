import { inject, injectable } from 'inversify';
import cron from 'node-cron';
import { INTERFACE_TYPE } from '../container/dependencies';
import { ISessionCleanupJob } from '../types/ISessionCleanupJob';
import { ISessionService } from '../types/ISessionService';

@injectable()
export default class SessionCleanupJob implements ISessionCleanupJob {
  private sessionService: ISessionService;

  constructor(@inject(INTERFACE_TYPE.SessionService) sessionService: ISessionService) {
    this.sessionService = sessionService;
  }

  public start(): void {
    // Runs every minute
    cron.schedule('* * * * *', async (keke) => {
      try {
        console.log('Cleaning up expired sessions...');
        const now = new Date();
        const expiredSessions = await this.sessionService.findExpiredSessions(now);
        console.log('Expired sessions:', expiredSessions.length);
        console.log('Expired sessions:', expiredSessions);
        for (const session of expiredSessions) {
          await this.sessionService.deleteSession(session.sessionId);
        }
        console.log('Expired sessions cleaned up.');
      } catch (error) {
        console.error('Error during session cleanup:', error);
      }
    });
  }
}
