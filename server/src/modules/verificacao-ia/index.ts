import { readFile } from "node:fs/promises";
type Input = { title: string; institution: string; performedAt: string; modalityId: string; declaredHours: number; filePath: string; mimeType: string };
export async function analyzeCertificate(input: Input): Promise<string> {
  const { AI_API_URL, AI_API_KEY, AI_MODEL } = process.env;
  if (!AI_API_URL || !AI_API_KEY || !AI_MODEL) return "Análise automática indisponível. Conferência manual do certificado necessária.";
  if (input.mimeType === "application/pdf") return "O provedor de IA configurado não recebe certificados PDF neste fluxo. Conferência manual do documento necessária.";
  try {
    const base64 = (await readFile(input.filePath)).toString("base64");
    const response = await fetch(AI_API_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${AI_API_KEY}` }, body: JSON.stringify({ model: AI_MODEL, messages: [{ role: "system", content: "Você auxilia a coordenação a comparar os dados informados com o certificado anexado. Liste dados legíveis e possíveis divergências. Não decida aprovação ou rejeição; indique limites de leitura." }, { role: "user", content: [{ type: "text", text: JSON.stringify({ title: input.title, institution: input.institution, performedAt: input.performedAt, modalityId: input.modalityId, declaredHours: input.declaredHours }) }, { type: "image_url", image_url: { url: `data:${input.mimeType};base64,${base64}` } }] }] }) });
    if (!response.ok) return `Análise automática falhou (HTTP ${response.status}). Conferência manual necessária.`;
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return body.choices?.[0]?.message?.content?.slice(0, 5000) || "A IA não retornou parecer. Conferência manual necessária.";
  } catch { return "Não foi possível concluir a análise automática. Conferência manual necessária."; }
}
