import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

describe('experiência inicial', () => {
  beforeEach(() => {
    localStorage.clear();
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

    await user.click(screen.getByRole('button', { name: 'Concluir agora' }));
    expect(screen.getByRole('dialog', { name: 'Hora de explicar' })).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('conclui o ciclo com autoavaliação e agenda uma revisão', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /Explorar · 30 min/i }));
    await user.click(screen.getByRole('button', { name: 'Concluir agora' }));
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

  it('reaplica os filtros ao trocar de modo e mostra combinação vazia', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'SQL' }));
    await user.click(screen.getByRole('button', { name: 'Avançado' }));
    await user.click(screen.getByRole('button', { name: 'Executar' }));

    expect(
      screen.getByRole('heading', { name: 'Ainda não há item nessa órbita.' }),
    ).toBeInTheDocument();
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
});
