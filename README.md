# LUME ACC

V1 da plataforma de Atividades Complementares Curriculares do curso de Ciência da Computação da UNIFAP. Monólito modular com API Express, PostgreSQL/Prisma e interface React/Vite.

## Executar localmente

Requer Node.js 22+ e Docker. Copie `.env.example` para `.env`, inicie o banco com `docker compose up -d db`, instale dependências com `npm install`, aplique a migração (`npm run db:deploy`) e inicie `npm run dev`. A interface fica em `http://localhost:5173` e a API em `http://localhost:3000`.

Ou inicie a aplicação e o banco com `docker compose up --build` (crie `.env` antes).

## Acesso demonstrativo

Com `DEMO_AUTH=true`, selecione Estudante ou Coordenação no seletor da interface. Esse modo serve apenas para demonstração; em produção deve ser substituído por autenticação institucional e autorização confiável no servidor.

## Regras acadêmicas

O catálogo em `server/src/modules/carga-horaria/rules.ts` é a fonte única para cálculo e exibição. Valores sem teto no Anexo A são tratados sem limite acumulado próprio, e atividades submetidas/em análise não contam como aprovadas. A carga exigida é 210h. A vigência da Resolução 03/2017 deve ser confirmada pela coordenação antes do uso oficial.

## IA

Configure `AI_API_URL`, `AI_API_KEY` e `AI_MODEL` para habilitar análise de imagens em endpoint compatível com a API de chat completions. PDFs são aceitos como certificados, mas neste fluxo ficam para conferência manual. Sem configuração, a análise indica indisponibilidade e exige conferência humana. O parecer nunca aprova nem rejeita uma atividade.

## Módulos

`acesso`, `submissao`, `verificacao-ia`, `carga-horaria` e `avaliacao` exportam suas interfaces públicas em `index.ts`. O servidor compõe os módulos sem importar implementações internas de outro módulo.
