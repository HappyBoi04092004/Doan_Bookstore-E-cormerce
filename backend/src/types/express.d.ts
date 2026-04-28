declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: any;
      name?: string;
      avatar?: string | null;
    }
    interface Request {
      user?: User;
    }
  }
}

export {}; // Ensure it's treated as a module
