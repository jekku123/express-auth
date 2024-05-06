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
        const now = new Date();
        const expiredSessions = await this.sessionService.findExpiredSessions(now);

        for (const session of expiredSessions) {
          await this.sessionService.deleteSession(session.sessionId);
          console.log(`Session ${session.sessionId} deleted by cleanup job`);
        }
      } catch (error) {
        console.error('Error during session cleanup:', error);
      }
    });
  }
}
