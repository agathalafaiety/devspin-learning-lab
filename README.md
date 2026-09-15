# DevSpin

Laboratório de aprendizagem ativa para desenvolvimento, inteligência artificial e dados.

![Tela inicial do DevSpin](docs/images/devspin-desktop.png)

## Problema

Estudar tecnologia apenas por leitura passiva facilita a sensação de familiaridade, mas nem sempre cria compreensão prática ou capacidade de explicar o assunto. Também é comum perder tempo escolhendo o próximo tema e abandonar revisões importantes.

## Objetivo

O DevSpin transforma o estudo em ciclos curtos: a pessoa escolhe uma área e um nível, sorteia um conceito ou desafio, estuda com foco, explica com as próprias palavras, faz uma autoavaliação e recebe uma revisão futura. Tudo funciona localmente, sem conta e sem enviar o progresso para servidores.

## Funcionalidades

- 50 conceitos e 25 desafios em 12 categorias.
- Filtros por área e nível de dificuldade.
- Mini-quizzes com correção explicada.
- Sessões de foco e explicação com temporizador.
- Favoritos, histórico e fila de revisão espaçada.
- Autoavaliação após cada ciclo.
- Exportação e importação de backup em JSON.
- Limpeza do progresso com confirmação.
- Preferências de áudio salvas localmente.
- Interface responsiva e navegação por teclado.

## Tecnologias

- React 19 e TypeScript.
- Vite.
- Zod para validação de conteúdo e backups.
- Vitest e Testing Library.
- Playwright e Axe para fluxos ponta a ponta e verificações automáticas de acessibilidade.
- ESLint e Prettier.

## Executar localmente

### Requisitos

- Node.js 24.
- npm 11 ou superior.

### Instalação

```bash
git clone https://github.com/agathalafaiety/devspin-learning-lab.git
cd devspin-learning-lab
npm install
```

Copie `.env.example` para `.env` se precisar alterar o caminho-base da aplicação. O valor padrão funciona no desenvolvimento local.

```bash
npm run dev
```

Acesse `http://127.0.0.1:5173/`.

## Comandos

```bash
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção
npm run preview        # prévia do build
npm run lint           # análise estática
npm test               # testes unitários e de integração
npm run test:e2e       # testes ponta a ponta em desktop e celular
npm run check          # verificação completa
```

Na primeira execução dos testes ponta a ponta, instale o navegador automatizado:

```bash
npx playwright install chromium
```

## Estrutura

```text
apps/web/              aplicação React
content/concepts/      biblioteca de conceitos
content/challenges/    biblioteca de desafios
docs/adr/              decisões arquiteturais
docs/architecture/     histórico dos incrementos
docs/security/         modelo de ameaças
tests/e2e/             testes no navegador
```

## Privacidade e segurança

O DevSpin não possui contas, telemetria ou APIs externas. O progresso fica no `localStorage` do navegador. Backups importados têm limite de 1 MB e passam por validação estrita antes de substituir os dados locais. Arquivos `.env` não são versionados.

## Qualidade

- 30 testes unitários e de integração.
- 6 cenários ponta a ponta em desktop e celular.
- Auditoria automática sem violações graves ou críticas de acessibilidade nas telas testadas.
- Pipeline de CI com lint, testes, build e auditoria de dependências.

## Interface móvel

![DevSpin em uma tela móvel](docs/images/devspin-mobile.png)

## Licença

Distribuído sob a licença MIT. Consulte [LICENSE](LICENSE).

Desenvolvido por Agatha Lafaiety.
