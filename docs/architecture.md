# Arquitetura e decisões

- `backend/`: Nest modular, com módulos de auth, users, conversations, tickets, knowledge, agent, handoffs, audit e health.
- `frontend/`: Next App Router; só usa HTTP e, futuramente, SSE.
- `packages/contracts`: schemas e eventos sem Prisma/Nest.
- Prisma em `backend/prisma`, PostgreSQL relacional e migrations versionadas. Não há SQL manual na aplicação.
- Estado da conversa é independente do status de Ticket. Mensagens e estado são fonte de verdade no PostgreSQL; Mastra não mantém memória autoritativa.
- Mastra é integrado atrás de `AgentService`; as ferramentas são serviços Nest com autorização baseada na sessão. O modo mock não tenta contatar OpenAI.
- Ações da IA registram somente o que foi executado, evidências, justificativa operacional, duração e consumo quando disponível; confiança ausente é `null`, não inventada.

CSRF usa token aleatório separado da sessão, exposto somente em cookie não-HttpOnly, enviado no cabeçalho `X-CSRF-Token`, comparado ao cookie e validado pelo hash ligado à sessão; a origem também é validada. `SESSION_SECRET` não é usado por sessões opacas e foi removido da configuração necessária.

Pendências desta etapa: SSE autenticado, console funcional de transferência e testes de integração PostgreSQL. Esses itens não devem ser tratados como implementados.

## Recuperação de execução

Na inicialização, a única instância do backend marca execuções `PROCESSING` remanescentes como `FAILED` com `PROCESS_INTERRUPTED` e libera a ocupação correspondente. Não há reexecução automática. Esta estratégia não suporta múltiplas instâncias concorrentes; recuperação distribuída permanece pendente.
