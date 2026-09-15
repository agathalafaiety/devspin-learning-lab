# Modelo de ameaças curto — Fase 1

## Dados e fronteiras

O progresso, os favoritos, as revisões e a preferência de áudio são salvos somente no navegador. Não existem contas, tokens, chaves, telemetria ou chamadas de API. O único arquivo aceito pela interface é um backup JSON iniciado pela própria pessoa usuária.

## Riscos já tratados

- Conteúdo JSON passa por schema estrito e rejeita propriedades inesperadas.
- React renderiza strings como texto; não há HTML dinâmico, `eval` ou `dangerouslySetInnerHTML`.
- Fontes, ícones e código são empacotados localmente, sem CDN em tempo de execução.
- CSP e headers defensivos são aplicados nos servidores local e de preview.
- O Fast Refresh baseado em preâmbulo inline foi removido para preservar `script-src 'self'` sem `unsafe-inline`; o Vite mantém recarga normal durante o desenvolvimento.
- CSS e fontes são carregados por folhas externas processadas pelo Vite. Desenvolvimento e preview preservam `style-src 'self'`, e a aplicação não cria atributos `style`.
- Áudio não toca no carregamento e é reduzido quando a aba está oculta.
- CI executa lint, testes, build e `npm audit --audit-level=high`.
- Backups são limitados a 1 MB, analisados como JSON e validados por schema estrito antes de substituir o estado local.
- O schema limita quantidades e tamanhos de strings para reduzir abuso de memória e rejeita campos desconhecidos.
- A limpeza do progresso exige confirmação explícita e não altera a preferência de áudio.
- Arquivos `.env` são ignorados pelo Git; somente `.env.example`, sem segredos, pode ser versionado.

## Riscos residuais

- O progresso local pode ser apagado pelo navegador ou por ferramentas de limpeza do dispositivo; a exportação de backup reduz esse risco.
- Uma extensão maliciosa com acesso à página pode ler o `localStorage`; por isso o aplicativo não armazena credenciais nem dados sensíveis.
- A política de headers da hospedagem pública deve ser conferida novamente se o projeto migrar para outro provedor.
