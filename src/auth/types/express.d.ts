import { UserContext } from '../auth/types/user-context.interface';

declare global {
  namespace Express {
    export interface Request {
      user?: UserContext;
    }
  }
}
