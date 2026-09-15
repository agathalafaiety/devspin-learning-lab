# Fase 1 · incremento 2 — ciclo local de aprendizagem

## Escopo entregue

- favoritos de conceitos e desafios, com abertura e remoção pelo painel de progresso;
- histórico local das sessões concluídas e revisões realizadas;
- autoavaliação com as opções “Preciso revisar”, “Quase entendi” e “Consigo explicar”;
- agendamento local de revisão com intervalos iniciais de 1, 3 e 7 dias;
- crescimento do intervalo após novas revisões bem-sucedidas;
- modo Revisar funcional, com tentativa de recordação antes da revelação do conteúdo;
- roteiro de estudo expansível no modo Explorar;
- duas dicas reveladas sequencialmente e conceitos esperados no modo Executar;
- preferências de áudio integradas ao documento de progresso local;
- armazenamento validado, versionado e com migração segura da versão zero;
- fallback sem interrupção quando o `localStorage` estiver indisponível ou cheio.

## Documento local

O estado pessoal utiliza a chave `devspin.progress.v1` e o schema abaixo:

```text
LocalProgress
├── schemaVersion
├── favoriteKeys
├── history
├── reviews
└── preferences
    └── audio
```

Os arquivos JSON oficiais continuam somente leitura. O documento local guarda apenas chaves dos
itens e dados pessoais de progresso. O histórico é limitado às 100 atividades mais recentes.

## Regra inicial de revisão

| Autoavaliação    | Primeiro intervalo |
| ---------------- | -----------------: |
| Preciso revisar  |              1 dia |
| Quase entendi    |             3 dias |
| Consigo explicar |             7 dias |

Em uma nova revisão, “Preciso revisar” volta para um dia, “Quase entendi” cresce gradualmente e
“Consigo explicar” dobra o intervalo anterior, respeitando o mínimo de sete dias.

## Verificações

- lint sem avisos;
- 21 testes unitários e de integração;
- build TypeScript e Vite;
- inspeção visual em desktop e em 390 px;
- ausência de rolagem horizontal na largura móvel;
- console do navegador sem erros ou avisos.

## Fora deste incremento

- importação e exportação de backup em JSON;
- limpeza seletiva do histórico com confirmação;
- biblioteca definitiva de 50 conceitos e 25 desafios;
- miniquiz interativo;
- testes de fluxo completo com Playwright no CI.

Esses itens permanecem nos próximos incrementos da Fase 1. Nenhum backend, banco de dados ou
serviço externo foi introduzido.
