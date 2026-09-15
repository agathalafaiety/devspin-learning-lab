# ADR 001 — Frontend local-first antes de serviços

## Status

Aceita para a Fase 1.

## Contexto

O primeiro ciclo do DevSpin precisa operar sem conta, API, banco ou conexão obrigatória. O repositório começou vazio e o frontend é a prioridade desta fase.

## Decisão

- Usar um workspace npm com a aplicação em `apps/web`.
- Manter regras de sorteio e temporizador em funções puras, sem dependência de React.
- Validar o conteúdo versionado na fronteira de infraestrutura com Zod.
- Usar `localStorage` apenas por um adaptador versionado quando o incremento de persistência começar.
- Sintetizar feedback sonoro via Web Audio API somente após interação explícita.
- Adiar API, banco, autenticação, executor de código e IA até uma necessidade aprovada.

## Consequências

O build é estático, a aplicação não transmite dados pessoais e as regras centrais podem ser testadas sem navegador. Sincronização entre dispositivos permanece fora do escopo.
