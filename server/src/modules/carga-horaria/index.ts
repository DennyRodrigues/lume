export { MODALITIES, REQUIRED_HOURS, modality } from "./rules";
import { MODALITIES, REQUIRED_HOURS, modality } from "./rules";
export type HourActivity = { modalityId: string; declaredHours: number; approvedHours: number | null; status: string };
export function summarizeHours(items: HourActivity[]) {
  const declared = items.reduce((sum, item) => sum + item.declaredHours, 0);
  const pending = items.filter(item => item.status === "EM_ANALISE").reduce((sum, item) => sum + item.declaredHours, 0);
  const approvedByModality: Record<string, number> = {};
  for (const item of items) if (item.status === "APROVADA") approvedByModality[item.modalityId] = (approvedByModality[item.modalityId] ?? 0) + (item.approvedHours ?? 0);
  const approved = MODALITIES.reduce((sum, rule) => sum + Math.min(approvedByModality[rule.id] ?? 0, rule.maxHours ?? Infinity), 0);
  return { declared, pending, approved: Math.min(approved, REQUIRED_HOURS), required: REQUIRED_HOURS, remaining: Math.max(0, REQUIRED_HOURS - approved) };
}
export function permittedHours(modalityId: string, currentApproved: number, requested: number): number {
  const rule = modality(modalityId);
  if (!rule) throw new Error("Modalidade inválida.");
  const allowance = rule.maxHours === undefined ? requested : Math.min(requested, Math.max(0, rule.maxHours - currentApproved));
  return Math.max(0, allowance);
}
