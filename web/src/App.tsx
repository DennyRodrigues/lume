import { useEffect, useMemo, useState } from "react";
import { Activity, BookOpen, Check, ChevronDown, CircleHelp, Clock3, FileCheck2, FileUp, GraduationCap, LayoutDashboard, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles, X } from "lucide-react";
const API = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:3000" : "");
type Role = "ESTUDANTE" | "COORDENADOR";
type Item = { id: string; studentId: string; title: string; institution: string; performedAt: string; modalityId: string; declaredHours: number; certificatePath: string; status: "EM_ANALISE" | "APROVADA" | "REJEITADA"; aiReport?: string; approvedHours?: number; justification?: string };
type Rule = { id: string; name: string; hoursPerParticipation?: number; maxHours?: number; note?: string };
type RulesData = { requiredHours: number; modalities: Rule[]; resolution: string };
const statusText = { EM_ANALISE: "Em análise", APROVADA: "Aprovada", REJEITADA: "Rejeitada" };
function App() {
  const [role, setRole] = useState<Role>((localStorage.getItem("role") as Role) || "ESTUDANTE");
  const [tab, setTab] = useState("painel");
  const [items, setItems] = useState<Item[]>([]);
  const [rules, setRules] = useState<RulesData>({ requiredHours: 210, modalities: [], resolution: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<Item | "new" | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const headers = { "x-user-role": role, "x-user-id": role === "ESTUDANTE" ? "estudante-demo" : "coordenacao-demo" };
  async function refresh() {
    setLoading(true); setError("");
    try {
      const [activities, rulesResponse] = await Promise.all([fetch(`${API}/api/activities`, { headers }), fetch(`${API}/api/rules`)]);
      if (!activities.ok || !rulesResponse.ok) throw new Error("Não foi possível carregar os dados. Verifique se a API está em execução.");
      setItems(await activities.json()); setRules(await rulesResponse.json());
    } catch (e) { setError(e instanceof Error ? e.message : "Falha de conexão."); } finally { setLoading(false); }
  }
  useEffect(() => { localStorage.setItem("role", role); void refresh(); }, [role]);
  const stats = useMemo(() => {
    const declared = items.reduce((s, x) => s + x.declaredHours, 0);
    const pending = items.filter(x => x.status === "EM_ANALISE").reduce((s, x) => s + x.declaredHours, 0);
    const modalitySums = new Map<string, number>();
    for (const x of items) if (x.status === "APROVADA") modalitySums.set(x.modalityId, (modalitySums.get(x.modalityId) || 0) + (x.approvedHours || 0));
    const approved = Math.min(rules.requiredHours, rules.modalities.reduce((s, rule) => s + Math.min(modalitySums.get(rule.id) || 0, rule.maxHours ?? Infinity), 0));
    return { declared, pending, approved, remaining: Math.max(0, rules.requiredHours - approved) };
  }, [items, rules]);
  const nav = role === "ESTUDANTE" ? [{ id: "painel", label: "Visão geral", icon: LayoutDashboard }, { id: "atividades", label: "Minhas atividades", icon: Activity }, { id: "regras", label: "Regras de ACC", icon: BookOpen }] : [{ id: "painel", label: "Visão geral", icon: LayoutDashboard }, { id: "avaliacoes", label: "Avaliações", icon: FileCheck2 }, { id: "regras", label: "Regras de ACC", icon: BookOpen }];
  const pendingItems = items.filter(x => x.status === "EM_ANALISE");
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}><div className="brand"><div className="brand-mark"><span /></div><div><b>lume</b><small>CIÊNCIA DA COMPUTAÇÃO</small></div><button className="icon-btn mobile-close" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X size={18}/></button></div>
      <div className="workspace-label">ESPAÇO DE TRABALHO</div><div className="role-picker"><div className="avatar"><GraduationCap size={17}/></div><div><b>{role === "ESTUDANTE" ? "Área do estudante" : "Coordenação"}</b><small>UNIFAP · Campus Marco Zero</small></div><ChevronDown size={15}/><select aria-label="Alternar perfil demonstrativo" value={role} onChange={e => setRole(e.target.value as Role)}><option value="ESTUDANTE">Estudante</option><option value="COORDENADOR">Coordenação</option></select></div>
      <div className="nav-label">MENU PRINCIPAL</div><nav>{nav.map(n => <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => { setTab(n.id); setMobileMenu(false); }}><n.icon size={18}/>{n.label}{n.id === "avaliacoes" && pendingItems.length > 0 && <span className="nav-count">{pendingItems.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={18}/></div><b>Precisa de ajuda?</b><p>Consulte as regras ou fale com a coordenação do curso.</p><button onClick={() => setTab("regras")}>Ver orientações <span>→</span></button></div><div className="profile"><div className="profile-avatar">{role === "ESTUDANTE" ? "ES" : "CC"}</div><div className="profile-text"><b>{role === "ESTUDANTE" ? "Estudante Demo" : "Coordenação CC"}</b><small>{role === "ESTUDANTE" ? "2023000000" : "Curso de Computação"}</small></div><button className="icon-btn" aria-label="Sair"><LogOut size={16}/></button></div></div>
    </aside>
    {mobileMenu && <div className="scrim" onClick={() => setMobileMenu(false)}/>}
    <main className="main"><header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu size={20}/></button><div className="breadcrumb">LUME <span>/</span> <b>{nav.find(n => n.id === tab)?.label || "Visão geral"}</b></div><div className="top-actions"><span className="semester">2026.2 <ChevronDown size={14}/></span><span className="top-divider"/><button className="icon-btn" aria-label="Buscar"><Search size={18}/></button><div className="top-avatar">{role === "ESTUDANTE" ? "ES" : "CC"}</div></div></header>
      <div className="content"><div className="page-heading"><div><div className="eyebrow">{role === "ESTUDANTE" ? "ESPAÇO DO ESTUDANTE" : "GESTÃO ACADÊMICA"}</div><h1>{tab === "regras" ? "Regras de ACC" : tab === "avaliacoes" ? "Avaliações pendentes" : tab === "atividades" ? "Minhas atividades" : role === "ESTUDANTE" ? "Olá, estudante 👋" : "Olá, coordenação 👋"}</h1><p>{tab === "regras" ? "Consulte os critérios de aproveitamento antes de cadastrar uma atividade." : "Acompanhe suas atividades complementares curriculares."}</p></div>{role === "ESTUDANTE" && tab !== "regras" && <button className="primary-btn" onClick={() => setModal("new")}><Plus size={17}/> Nova atividade</button>}</div>
      {error && <div className="error-banner">{error}<button onClick={() => void refresh()}>Tentar novamente</button></div>}
      {loading ? <div className="loading">Carregando informações…</div> : <>
        {tab === "regras" ? <Rules rules={rules}/> : tab === "avaliacoes" ? <ActivityTable items={pendingItems} coordinator onOpen={setModal}/> : tab === "atividades" ? <ActivityTable items={items} onOpen={setModal}/> : <>
          {role === "ESTUDANTE" ? <StudentDashboard stats={stats} items={items} onTab={setTab} onOpen={setModal}/> : <CoordinatorDashboard items={items} pending={pendingItems} onTab={setTab} onOpen={setModal}/>}
        </>}
      </>}
      <footer>© 2026 LUME · Universidade Federal do Amapá <span>Resolução nº 03/2017 · Vigência a confirmar</span></footer></div>
    </main>
    {modal && <Modal item={modal} rules={rules} role={role} headers={headers} onClose={() => setModal(null)} onSaved={refresh}/>}
  </div>;
}
function StudentDashboard({ stats, items, onTab, onOpen }: { stats: { declared: number; pending: number; approved: number; remaining: number }; items: Item[]; onTab: (s: string) => void; onOpen: (x: Item | "new") => void }) {
  const pct = Math.min(100, Math.round(stats.approved / 210 * 100));
  return <><section className="hero-card"><div className="hero-copy"><div className="hero-tag"><Sparkles size={14}/> SUA JORNADA ACADÊMICA</div><h2>Cada experiência<br/>conta para o seu futuro.</h2><p>Registre suas atividades complementares e acompanhe seu progresso rumo à formação.</p><button className="hero-button" onClick={() => onOpen("new")}><Plus size={16}/> Cadastrar atividade</button></div><div className="progress-visual"><div className="progress-ring" style={{ "--progress": `${pct * 3.6}deg` } as React.CSSProperties}><div><b>{pct}<small>%</small></b><span>concluído</span></div></div><div className="progress-caption"><b>{stats.approved}h <span>de 210h</span></b><small>aprovadas pela coordenação</small></div></div><div className="hero-decoration decor-a"/><div className="hero-decoration decor-b"/></section>
    <section className="stat-grid"><Stat label="Horas aprovadas" value={`${stats.approved}h`} note="Contabilizadas" icon={Check} tone="green"/><Stat label="Em análise" value={`${stats.pending}h`} note="Aguardando avaliação" icon={Clock3} tone="amber"/><Stat label="Horas declaradas" value={`${stats.declared}h`} note="Total enviado" icon={FileUp} tone="blue"/><Stat label="Horas restantes" value={`${stats.remaining}h`} note="Para concluir o curso" icon={Activity} tone="violet"/></section>
    <section className="section-card"><div className="section-head"><div><h3>Atividades recentes</h3><p>Acompanhe o status das suas submissões.</p></div><button className="text-btn" onClick={() => onTab("atividades")}>Ver todas <span>→</span></button></div><ActivityTable items={items.slice(0, 4)} onOpen={onOpen}/></section>
    <section className="notice-card"><div className="notice-icon"><ShieldCheck size={20}/></div><div><b>Suas horas são validadas pela coordenação</b><p>O parecer automático da IA é apenas auxiliar. Somente atividades aprovadas pela coordenação contam para sua carga horária.</p></div><button className="icon-btn" onClick={() => onTab("regras")} aria-label="Consultar regras"><ChevronDown size={18}/></button></section></>;
}
function CoordinatorDashboard({ items, pending, onTab, onOpen }: { items: Item[]; pending: Item[]; onTab: (s: string) => void; onOpen: (x: Item | "new") => void }) {
  const approved = items.filter(x => x.status === "APROVADA").length;
  return <><section className="coord-hero"><div><div className="hero-tag"><ShieldCheck size={14}/> PAINEL DA COORDENAÇÃO</div><h2>Gestão de atividades<br/>com mais clareza.</h2><p>Analise os certificados, consulte os pareceres auxiliares e registre sua decisão.</p></div><div className="coord-illustration"><div className="coord-icon"><FileCheck2 size={36}/></div><div className="floating-chip"><span className="live-dot"/> Fila atualizada</div></div></section><section className="stat-grid three"><Stat label="Aguardando análise" value={`${pending.length}`} note="Submissões pendentes" icon={Clock3} tone="amber"/><Stat label="Atividades aprovadas" value={`${approved}`} note="Decisões registradas" icon={Check} tone="green"/><Stat label="Total recebido" value={`${items.length}`} note="Todas as submissões" icon={Activity} tone="blue"/></section><section className="section-card"><div className="section-head"><div><h3>Fila de avaliação</h3><p>Submissões aguardando decisão.</p></div><button className="text-btn" onClick={() => onTab("avaliacoes")}>Ver fila <span>→</span></button></div><ActivityTable items={pending.slice(0, 5)} coordinator onOpen={onOpen}/></section></>;
}
function Stat({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof Activity; tone: string }) { return <article className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong><small>{note}</small></div></article>; }
function ActivityTable({ items, coordinator = false, onOpen }: { items: Item[]; coordinator?: boolean; onOpen: (item: Item) => void }) {
  if (!items.length) return <div className="empty-state"><div><FileCheck2 size={22}/></div><b>Nenhuma atividade por aqui</b><p>{coordinator ? "Novas submissões aparecerão nesta fila." : "Suas atividades cadastradas aparecerão aqui."}</p></div>;
  return <div className="table-wrap"><table><thead><tr>{coordinator && <th>ESTUDANTE</th>}<th>ATIVIDADE</th><th>MODALIDADE</th><th>HORAS</th><th>STATUS</th><th/></tr></thead><tbody>{items.map(item => <tr key={item.id}>{coordinator && <td><div className="student-cell"><span className="mini-avatar">ES</span><span><b>Estudante Demo</b><small>{item.studentId}</small></span></div></td>}<td><b className="activity-name">{item.title}</b><small className="institution">{item.institution} · {new Date(item.performedAt).toLocaleDateString("pt-BR")}</small></td><td><span className="modality-label">{item.modalityId.replaceAll("-", " ")}</span></td><td><b>{item.status === "APROVADA" ? item.approvedHours : item.declaredHours}h</b></td><td><span className={`status ${item.status.toLowerCase()}`}><i/>{statusText[item.status]}</span></td><td><button className="row-button" onClick={() => onOpen(item)}>{coordinator ? "Avaliar" : "Detalhes"}<span>→</span></button></td></tr>)}</tbody></table></div>;
}
function Rules({ rules }: { rules: RulesData }) { return <><div className="rules-summary"><div className="rules-summary-icon"><BookOpen size={21}/></div><div><b>{rules.requiredHours} horas complementares</b><p>Carga horária total exigida para integralização do curso.</p></div><span>RESOLUÇÃO 03/2017</span></div><section className="section-card rules-card"><div className="section-head"><div><h3>Modalidades e critérios de aproveitamento</h3><p>Referência: Anexo A da Resolução nº 03/2017, de 1º de dezembro de 2017.</p></div></div><div className="rules-table"><div className="rules-row rules-header"><span>MODALIDADE DE ATIVIDADE</span><span>CRITÉRIO</span></div>{rules.modalities.map(r => <div className="rules-row" key={r.id}><span>{r.name}</span><b>{r.hoursPerParticipation ? `${r.hoursPerParticipation}h por participação${r.maxHours ? ` · máximo ${r.maxHours}h` : ""}` : `Limite acumulado: ${r.maxHours}h`}{r.note && <small>{r.note}</small>}</b></div>)}</div><div className="rules-warning"><ShieldCheck size={18}/><p><b>Confirme a vigência com a coordenação.</b> Esta plataforma usa a Resolução nº 03/2017 como referência; a coordenação deve confirmar se ela continua vigente e se os critérios estão atualizados.</p></div></section></>; }
function Modal({ item, rules, role, headers, onClose, onSaved }: { item: Item | "new"; rules: RulesData; role: Role; headers: Record<string, string>; onClose: () => void; onSaved: () => Promise<void> }) {
  const isNew = item === "new";
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [decision, setDecision] = useState("APROVADA"); const [hours, setHours] = useState(isNew ? "" : String(item.approvedHours ?? item.declaredHours)); const [justification, setJustification] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); setError(""); const form = e.currentTarget;
    try { let response: Response;
      if (isNew) { response = await fetch(`${API}/api/activities`, { method: "POST", headers, body: new FormData(form) }); }
      else { response = await fetch(`${API}/api/reviews/${item.id}`, { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ decision, approvedHours: Number(hours), justification }) }); }
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Não foi possível salvar."); await onSaved(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : "Falha ao salvar."); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal"><div className="modal-head"><div><div className="eyebrow">{isNew ? "NOVA SUBMISSÃO" : role === "COORDENADOR" && item.status === "EM_ANALISE" ? "AVALIAÇÃO DE ATIVIDADE" : "DETALHES DA ATIVIDADE"}</div><h2>{isNew ? "Cadastrar atividade" : item.title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Fechar"><X size={19}/></button></div>
    {isNew ? <form onSubmit={submit} className="form-grid"><label className="full">Nome da atividade<input name="title" required maxLength={180} placeholder="Ex.: Semana de Computação"/></label><label>Instituição responsável<input name="institution" required maxLength={180} placeholder="Ex.: UNIFAP"/></label><label>Data de realização<input name="performedAt" type="date" required/></label><label className="full">Modalidade de ACC<select name="modalityId" required defaultValue=""><option value="" disabled>Selecione a modalidade</option>{rules.modalities.map(r => <option key={r.id} value={r.id}>{r.name}{r.hoursPerParticipation ? ` (${r.hoursPerParticipation}h/participação)` : ""}</option>)}</select></label><label>Carga horária declarada<input name="declaredHours" type="number" min="1" max="1000" step="0.5" required placeholder="Ex.: 20"/></label><label className="file-field">Certificado (PDF ou imagem)<input name="certificate" type="file" required accept="application/pdf,image/png,image/jpeg,image/webp"/><small>PDF, PNG, JPG ou WebP · até 10 MB</small></label><div className="form-note full"><Sparkles size={16}/> A IA analisa imagens quando configurada; PDFs exigem conferência manual. A decisão final é sempre da coordenação.</div>{error && <div className="form-error full">{error}</div>}<div className="modal-footer full"><button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button><button className="primary-btn" disabled={busy}><FileUp size={16}/>{busy ? "Enviando…" : "Enviar para análise"}</button></div></form> : <><div className="detail-meta"><span>{item.institution}</span><span>{new Date(item.performedAt).toLocaleDateString("pt-BR")}</span><span>{item.declaredHours}h declaradas</span><span className={`status ${item.status.toLowerCase()}`}><i/>{statusText[item.status]}</span></div><div className="document-view"><div><FileCheck2 size={30}/><b>Certificado anexado</b><small>Documento enviado com a submissão</small></div><CertificateLink itemId={item.id} headers={headers}/></div><div className="ai-report"><div className="ai-title"><Sparkles size={16}/> PARECER AUXILIAR DA IA</div><p>{item.aiReport || "Análise não disponível."}</p><small>A decisão de aprovação ou rejeição pertence exclusivamente à coordenação.</small></div>
      {role === "COORDENADOR" && item.status === "EM_ANALISE" ? <form onSubmit={submit} className="review-form"><div className="decision-options"><label className={decision === "APROVADA" ? "selected" : ""}><input type="radio" value="APROVADA" checked={decision === "APROVADA"} onChange={e => setDecision(e.target.value)}/><Check size={16}/> Aprovar</label><label className={decision === "REJEITADA" ? "selected reject-selected" : ""}><input type="radio" value="REJEITADA" checked={decision === "REJEITADA"} onChange={e => setDecision(e.target.value)}/><X size={16}/> Rejeitar</label></div>{decision === "APROVADA" && <label>Horas aproveitadas<input type="number" min="0.5" max={item.declaredHours} step="0.5" value={hours} onChange={e => setHours(e.target.value)} required/></label>}<label>Justificativa da decisão<textarea value={justification} onChange={e => setJustification(e.target.value)} required minLength={4} maxLength={1000} placeholder="Registre o motivo da aprovação ou rejeição…"/></label>{error && <div className="form-error">{error}</div>}<div className="modal-footer"><button type="button" className="secondary-btn" onClick={onClose}>Fechar</button><button className="primary-btn" disabled={busy}>{busy ? "Salvando…" : "Registrar decisão"}</button></div></form> : item.justification && <div className="ai-report"><div className="ai-title">JUSTIFICATIVA DA COORDENAÇÃO</div><p>{item.justification}</p></div>}</>}
  </section></div>;
}
function CertificateLink({ itemId, headers }: { itemId: string; headers: Record<string, string> }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    fetch(`${API}/api/activities/${itemId}/certificate`, { headers }).then(response => {
      if (!response.ok) throw new Error("download failed");
      return response.blob();
    }).then(blob => { objectUrl = URL.createObjectURL(blob); if (active) setUrl(objectUrl); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [itemId, headers]);
  return url ? <a href={url} target="_blank" rel="noreferrer">Abrir certificado ↗</a> : <small>{failed ? "Não foi possível abrir o documento." : "Carregando documento…"}</small>;
}
export default App;
