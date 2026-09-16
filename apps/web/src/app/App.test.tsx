import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('experiência inicial', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('devspin.onboarding.v1', 'complete');
    window.history.replaceState({}, '', '/');
  });

  it('orienta a primeira visita em três passos', async () => {
    const user = userEvent.setup();
    localStorage.removeItem('devspin.onboarding.v1');
    render(<App />);

    expect(
      screen.getByRole('dialog', { name: 'Comece com três pequenos giros' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Escolha seu foco')).toBeInTheDocument();
    expect(screen.getByText('Gire um conteúdo')).toBeInTheDocument();
    expect(screen.getByText('Teste e revise')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Começar a explorar' }));
    expect(
      screen.queryByRole('dialog', { name: 'Comece com três pequenos giros' }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem('devspin.onboarding.v1')).toBe('complete');
  });

  it('alterna do modo Explorar para Executar com nomes acessíveis', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.getByRole('heading', { name: /O que você quer dominar hoje/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explorar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Executar' }));

    expect(screen.getByRole('button', { name: 'Executar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Executar · 30 min/i })).toBeInTheDocument();
  });

  it('abre o modo foco e permite concluir antes do limite', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Explorar · 30 min/i }));
    expect(screen.getByRole('dialog', { name: 'Tempo de foco' })).toBeInTheDocument();
    expect(screen.getByText('30:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Concluir agora' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Começar' }));
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Concluir agora' }));
    expect(screen.getByRole('dialog', { name: 'Hora de explicar' })).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Começar' })).toBeInTheDocument();
  });

  it('conclui o ciclo com autoavaliação e agenda uma revisão', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Explorar · 30 min/i }));
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir agora' }));
    await user.click(screen.getByRole('button', { name: 'Começar' }));
    await user.click(screen.getByRole('button', { name: 'Concluir agora' }));

    expect(screen.getByRole('dialog', { name: /Como você se sente/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Preciso revisar/i }));

    expect(screen.getByText('1 item agendado')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Revisar' }));
    expect(screen.getByRole('heading', { name: 'Variáveis, valores e tipos' })).toBeInTheDocument();
  });

  it('salva um favorito e restaura o dado após remontar', async () => {
    const user = userEvent.setup();
    const firstRender = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('1 item salvo')).toBeInTheDocument();
    firstRender.unmount();
    render(<App />);

    expect(screen.getByRole('button', { name: 'Salvo' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 item salvo')).toBeInTheDocument();
  });

  it('revela as duas dicas do desafio em sequência', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Executar' }));

    await user.click(screen.getByRole('button', { name: 'Mostrar dica 1' }));
    expect(screen.getByText(/Dica 1:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mostrar dica 2' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mostrar dica 2' }));
    expect(screen.getByText(/Dica 2:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver conceitos esperados' })).toBeInTheDocument();
  });

  it('reaplica trilha e nível ao trocar de modo', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'SQL' }));
    await user.click(screen.getByRole('button', { name: 'Avançado' }));
    await user.click(screen.getByRole('button', { name: 'Executar' }));

    expect(
      await screen.findByText(
        /(?:SQL e Bancos de Dados|Engenharia de Bancos de Dados|Modelagem de Dados) · Avançado/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'SQL' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Avançado' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('permite escolher uma categoria específica dentro da trilha', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'IA & ML' }));
    expect(
      screen.getByRole('group', { name: 'Categorias da trilha selecionada' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Visão Computacional' }));

    expect(screen.getByRole('button', { name: 'IA & ML' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Visão Computacional' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(await screen.findByText(/Visão Computacional ·/)).toBeInTheDocument();
  });

  it('oferece um mini-quiz com correção explicada', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByText('Testar conhecimento'));
    await user.click(
      screen.getByRole('radio', {
        name: 'É apenas uma escolha de aparência sem efeito técnico.',
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Confirmar resposta' }));

    expect(screen.getByRole('status')).toHaveTextContent('Ainda não.');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Variáveis dão nomes a valores; tipos definem quais operações fazem sentido para eles.',
    );

    await user.click(screen.getByRole('button', { name: /0 itens salvos/i }));
    expect(screen.getByText('1 tentativa em quizzes')).toBeInTheDocument();
  });

  it('mantém o giro no botão principal e apresenta três perguntas-chave', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole('button', { name: 'Sortear item anterior' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sortear próximo item' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Girar conceito' })).toBeInTheDocument();

    await user.click(screen.getByText('Ver roteiro de estudo'));
    expect(screen.getByText('3 perguntas-chave')).toBeInTheDocument();
    expect(screen.getByText('Qual é a ideia principal?')).toBeInTheDocument();
    expect(screen.getByText('Quando usar esse conceito?')).toBeInTheDocument();
    expect(screen.getByText('Qual erro deve ser evitado?')).toBeInTheDocument();
  });

  it('limpa favoritos, histórico e revisões após confirmação', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    await user.click(screen.getByRole('button', { name: /1 item salvo/i }));
    await user.click(screen.getByRole('button', { name: 'Limpar progresso' }));
    await user.click(screen.getByRole('button', { name: 'Sim, apagar progresso' }));

    expect(screen.getByRole('status')).toHaveTextContent('Progresso local removido.');
    expect(screen.getByText('Você ainda não salvou nenhum item.')).toBeInTheDocument();
  });

  it('não expõe uma página separada de Design System', () => {
    window.history.replaceState({}, '', '/design-system');
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'O que você quer dominar hoje?' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Design System')).not.toBeInTheDocument();
  });
});
