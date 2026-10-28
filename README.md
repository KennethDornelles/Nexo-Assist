# Nexo Assist — primeira etapa

Monorepo PNPM para um service desk de TI. O backend NestJS é a única API pública; Prisma/PostgreSQL é a fonte de verdade para negócio e Mastra fica encapsulado no módulo de agente. O PRD não estava no workspace; `nexo.pen` foi usado apenas como referência visual.

## Executar localmente

Requer Node 22.12+ e pnpm 10+. Copie `backend/.env.example` para `backend/.env`, mantendo `LLM_MODE=mock`, depois:

```bash
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Abra `http://localhost:3000`. Contas demo: `ana.souza@nexo.com.br`, `bruno.costa@nexo.com.br`, `carla.lima@nexo.com.br` e `rafael.lima@nexo.com.br`; use qualquer senha não vazia somente com `DEMO_AUTH_ENABLED=true`.

Docker completo: `docker compose up --build -d`; execute migration e seed dentro do backend: `docker compose exec backend pnpm prisma:migrate && docker compose exec backend pnpm prisma:seed`. O volume `postgres_data` persiste após `docker compose restart`.

## Modos LLM

`mock` funciona sem chave externa. Para `real`, defina `LLM_MODE=real`, `LLM_PROVIDER=openai`, um modelo disponível (o candidato inicial é `gpt-5.4-mini`) e `OPENAI_API_KEY`; a validação falha explicitamente se faltar a chave. O agente Mastra só recebe contexto vindo de serviços Nest e ferramentas de leitura; ele não acessa o banco diretamente.

## Segurança e limites

Sessões usam cookie HttpOnly, SameSite=Lax e apenas hash do token no banco. A identidade vem sempre da sessão. Login demo não é produção. CORS restringe-se a `WEB_ORIGIN`. Chamados e conversas validam proprietário no serviço. Escritas de ticket, confirmação, handoff completo e SSE autenticado ainda não foram concluídos nesta primeira base.

## Verificação

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Para PostgreSQL hospedado futuramente (inclusive Supabase), altere somente `DATABASE_URL` para uma URL PostgreSQL compatível e aplique `pnpm db:migrate`; esta etapa não depende de serviços proprietários.

## Próximas etapas

Rascunho/confirmacão/versionamento de escrita, prioridade e SLA completos, duplicidade/reabertura em sete dias, atendimento humano, limite de 30 mensagens, recuperação do legado, avaliação de busca semântica e avaliação de qualidade do agente.
