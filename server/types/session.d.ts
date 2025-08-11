import 'express-session';

declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    user?: {
      id: number;
      username: string;
      role: string;
      permissions: string[];
    };
    crmAuthenticated?: boolean;
    crmUser?: {
      id: number;
      username: string;
      fullName: string;
      role: string;
      permissions: string[];
      panelType: string;
    };
  }
}