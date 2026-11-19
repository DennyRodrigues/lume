export const REQUIRED_HOURS = 210;
export type Modality = { id: string; name: string; hoursPerParticipation?: number; maxHours?: number; note?: string };
export const MODALITIES: Modality[] = [
  { id: "programas-projetos", name: "Participação em programas e projetos institucionais de pesquisa e/ou extensão", hoursPerParticipation: 40 },
  { id: "anais-eventos", name: "Publicação em anais de eventos científicos", hoursPerParticipation: 20 },
  { id: "revista-cientifica", name: "Publicação em revista científica com corpo editorial", hoursPerParticipation: 40 },
  { id: "livro-capitulo", name: "Publicação de livro ou capítulo de livro", hoursPerParticipation: 20 },
  { id: "publicacao-nao-cientifica", name: "Publicação em jornais ou revistas não científicas", hoursPerParticipation: 10, maxHours: 20 },
  { id: "palestrante", name: "Participação em eventos como palestrante", hoursPerParticipation: 10 },
  { id: "eventos-ouvinte", name: "Participação em seminários, simpósios, congressos e conferências", maxHours: 120, note: "O Anexo A informa o limite acumulado, mas não especifica o cômputo por participação." },
  { id: "estagio", name: "Estágios extracurriculares oferecidos pelo curso", hoursPerParticipation: 40 },
  { id: "defesas", name: "Participação como ouvinte em defesas acadêmicas relacionadas ao curso", hoursPerParticipation: 1, maxHours: 20 },
  { id: "representacao", name: "Representação estudantil em órgãos colegiados", hoursPerParticipation: 5, maxHours: 10 },
  { id: "outras", name: "Outras atividades relacionadas à Ciência da Computação, autorizadas previamente pela coordenação", hoursPerParticipation: 5, maxHours: 20 }
];
export function modality(id: string): Modality | undefined { return MODALITIES.find(item => item.id === id); }
