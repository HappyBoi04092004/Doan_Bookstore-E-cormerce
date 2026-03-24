import { JwtPayload } from "../middleware/authenticate";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {}; // Ensure it's treated as a module
