import type { Request, Response, NextFunction } from "express";
export type UserRole = "ESTUDANTE" | "COORDENADOR";
export type AuthenticatedRequest = Request & { user: { id: string; role: UserRole } };
export function currentUser(req: Request): { id: string; role: UserRole } {
  const role = req.header("x-user-role") === "COORDENADOR" ? "COORDENADOR" : "ESTUDANTE";
  const id = (req.header("x-user-id") || (role === "COORDENADOR" ? "coordenacao-demo" : "estudante-demo")).slice(0, 100);
  return { id, role };
}
export function requireRole(role: UserRole) { return (req: Request, res: Response, next: NextFunction) => currentUser(req).role === role ? next() : res.status(403).json({ error: "Acesso não autorizado." }); }
