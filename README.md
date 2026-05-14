# Cassiano Sociedade de Advogados — Sistema de Avaliação de Desempenho

Sistema web completo de gestão de desempenho e talentos com avaliações 90°, 180° e 360°, banco de dados em nuvem, acesso multiusuário em tempo real e exportações profissionais.

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Front-end | React 19 + TypeScript |
| Estilização | Tailwind CSS |
| Estado global | Zustand |
| Formulários | React Hook Form + Zod |
| Gráficos | Chart.js + react-chartjs-2 |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Vercel |
| Export | jsPDF + xlsx |

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com) (gratuita)
- Conta no [Vercel](https://vercel.com) (gratuita)

---

## Configuração local

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU-USER/cassiano-performance.git
cd cassiano-performance
npm install
```

### 2. Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. No **SQL Editor**, execute em ordem:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed.sql`
3. Vá em **Project Settings → API** e copie:
   - Project URL
   - anon/public key

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Preencha `.env` com suas credenciais do Supabase.

### 4. Rodar localmente
```bash
npm run dev
```
Acesse: http://localhost:5173

---

## Deploy na Vercel

### Opção A — Via CLI
```bash
npx vercel --prod
```

### Opção B — Via GitHub (recomendado)
1. Suba o projeto no GitHub
2. Acesse [vercel.com](https://vercel.com) → New Project → Import do GitHub
3. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → URL pública gerada automaticamente

---

## Criar primeiro usuário admin

No **Supabase Authentication → Users**, clique em "Invite user" e envie o convite.  
Depois, no SQL Editor:
```sql
update public.users
set role = 'admin', nome = 'Dr. Cassiano'
where email = 'admin@cassiano.com.br';
```

---

## Estrutura do projeto

```
cassiano-performance/
├── src/
│   ├── app/               # App.tsx e rotas
│   ├── components/
│   │   ├── layout/        # Sidebar, Layout
│   │   └── ui/            # Componentes base
│   ├── features/
│   │   ├── auth/          # Login, authStore
│   │   ├── employees/     # Funcionários CRUD
│   │   ├── evaluations/   # Avaliações 90/180/360
│   │   ├── dashboard/     # Dashboard com gráficos
│   │   ├── sectors/       # Resultado por setor
│   │   └── pdi/           # PDI
│   ├── hooks/             # Custom hooks
│   ├── lib/               # supabase.ts, constants.ts
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # calculator.ts, export.ts
├── supabase/
│   └── migrations/        # SQL migrations
├── .env.example
├── vercel.json
└── README.md
```

---

## Módulos

| Módulo | Descrição |
|---|---|
| **Autenticação** | Login com e-mail/senha via Supabase Auth, perfis: admin, rh, gestor, colaborador |
| **Funcionários** | CRUD completo com busca, filtros, paginação e tempo real |
| **Avaliações** | 90°, 180° e 360° com pesos configuráveis por avaliador |
| **Dashboard** | KPIs executivos, gráfico de conceitos, radar de dimensões, tabulação filtrada |
| **Por Setor** | Ranking e métricas por área com gráfico comparativo |
| **PDI** | Plano de Desenvolvimento Individual com objetivos, ações e check-ins |
| **Exportações** | CSV, Excel (.xlsx) e PDF profissional com identidade Cassiano |

---

## Dimensões de avaliação

| Dimensão | Peso |
|---|---|
| Resultados e KPIs | 40% |
| Competências Técnicas | 25% |
| Comportamental | 25% |
| Desenvolvimento | 10% |

---

## Segurança (Row Level Security)

- Admin/RH: acesso total
- Gestor: criar e ver avaliações
- Colaborador: ver próprias avaliações
- Soft delete em funcionários e PDIs
- Auditoria de todas as alterações

---

## Suporte

Em caso de dúvidas, abra uma issue no repositório ou entre em contato com o time de RH.
