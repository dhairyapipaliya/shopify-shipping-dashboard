import type { Request, Response, NextFunction } from "express";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.adminUserId) {
    res.redirect("/login");
    return;
  }
  next();
};
