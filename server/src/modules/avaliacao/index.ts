import { Router } from "express";
import { prisma } from "../../shared/database";
import { currentUser, requireRole } from "../acesso";
import { permittedHours, REQUIRED_HOURS } from "../carga-horaria";
export const evaluationRouter = Router();
evaluationRouter.use(requireRole("COORDENADOR"));
evaluationRouter.get("/", async (_req, res, next) => { try { res.json(await prisma.activity.findMany({ where: { status: "EM_ANALISE" }, orderBy: { createdAt: "asc" } })); } catch (error) { next(error); } });
evaluationRouter.patch("/:id", async (req, res, next) => {
  try {
    const { decision, approvedHours, justification } = req.body as { decision?: string; approvedHours?: number; justification?: string };
    if (!["APROVADA", "REJEITADA"].includes(decision || "") || !justification?.trim()) return res.status(400).json({ error: "Informe uma decisão e sua justificativa." });
    const activity = await prisma.activity.findUnique({ where: { id: req.params.id } });
    if (!activity || activity.status !== "EM_ANALISE") return res.status(404).json({ error: "Submissão pendente não encontrada." });
    let accepted: number | null = null;
    if (decision === "APROVADA") {
      const hours = Number(approvedHours);
      if (!Number.isFinite(hours) || hours <= 0 || hours > activity.declaredHours) return res.status(400).json({ error: "Horas aproveitadas devem ser positivas e não exceder as declaradas." });
      const prior = await prisma.activity.findMany({ where: { studentId: activity.studentId, status: "APROVADA" } });
      const usedInModality = prior.filter(row => row.modalityId === activity.modalityId).reduce((sum, row) => sum + (row.approvedHours ?? 0), 0);
      const usedOverall = prior.reduce((sum, row) => sum + (row.approvedHours ?? 0), 0);
      accepted = Math.min(permittedHours(activity.modalityId, usedInModality, hours), Math.max(0, REQUIRED_HOURS - usedOverall));
      if (accepted <= 0) return res.status(400).json({ error: "O limite da modalidade ou a carga horária total de 210h já foi atingido." });
    }
    const updated = await prisma.activity.update({ where: { id: activity.id }, data: { status: decision as "APROVADA" | "REJEITADA", approvedHours: accepted, justification: justification.trim(), reviewedBy: currentUser(req).id } });
    res.json(updated);
  } catch (error) { next(error); }
});
