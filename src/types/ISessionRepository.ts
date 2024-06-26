import { FilterQuery } from 'mongoose';
import { ISession } from '../models/session';

export interface ISessionRepository {
  create({
    userId,
    sessionId,
    expiresAt,
  }: Partial<Omit<ISession, 'userId'>> & { userId: string }): Promise<ISession>;
  delete(sessionId: string): Promise<ISession | null>;
  find(data: FilterQuery<ISession>): Promise<ISession | null>;
  findById(id: string): Promise<ISession | null>;
  findMany(data: FilterQuery<ISession>): Promise<ISession[]>;
}
