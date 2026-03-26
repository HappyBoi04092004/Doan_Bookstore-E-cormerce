import { Request, Response, NextFunction } from "express";

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // req.user might be undefined if authenticate middleware wasn't used first
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role.toLowerCase())) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
};