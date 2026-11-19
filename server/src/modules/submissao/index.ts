import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { mkdirSync } from "node:fs";
import { prisma } from "../../shared/database";
import { currentUser, requireRole } from "../acesso";
import { modality } from "../carga-horaria";
import { analyzeCertificate } from "../verificacao-ia";
const uploadDir = process.env.UPLOAD_DIR || "uploads";
mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, ["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file.mimetype)) });
export const submissionRouter = Router();
submissionRouter.get("/", (req, res, next) => { const user = currentUser(req); prisma.activity.findMany({ where: user.role === "COORDENADOR" ? {} : { studentId: user.id }, orderBy: { createdAt: "desc" } }).then(rows => res.json(rows)).catch(next); });
submissionRouter.get("/:id/certificate", async (req, res, next) => {
  try {
    const user = currentUser(req);
    const activity = await prisma.activity.findUnique({ where: { id: req.params.id } });
    if (!activity || (user.role !== "COORDENADOR" && activity.studentId !== user.id)) return res.status(404).json({ error: "Certificado não encontrado." });
    res.sendFile(path.resolve(activity.certificatePath));
  } catch (error) { next(error); }
});
submissionRouter.post("/", requireRole("ESTUDANTE"), upload.single("certificate"), async (req, res, next) => {
  try {
    const { title, institution, performedAt, modalityId, declaredHours } = req.body;
    const hours = Number(declaredHours);
    const date = new Date(performedAt);
    if (!title?.trim() || !institution?.trim() || !performedAt || Number.isNaN(date.getTime()) || !modality(modalityId) || !Number.isFinite(hours) || hours <= 0 || !req.file) return res.status(400).json({ error: "Informe todos os dados e anexe PDF ou imagem (máximo 10 MB)." });
    const activity = await prisma.activity.create({ data: { studentId: currentUser(req).id, title: title.trim(), institution: institution.trim(), performedAt: date, modalityId, declaredHours: hours, certificatePath: req.file.path } });
    const report = await analyzeCertificate({ title, institution, performedAt, modalityId, declaredHours: hours, filePath: req.file.path, mimeType: req.file.mimetype });
    const updated = await prisma.activity.update({ where: { id: activity.id }, data: { aiReport: report, aiAnalyzedAt: new Date() } });
    res.status(201).json(updated);
  } catch (error) { next(error); }
});
