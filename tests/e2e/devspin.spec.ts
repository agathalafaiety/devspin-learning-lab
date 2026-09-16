import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('devspin.onboarding.v1', 'complete');
  });
  await page.reload();
});

test('orienta a primeira visita e inicia a experiência', async ({ page }) => {
  await page.evaluate(() => localStorage.removeItem('devspin.onboarding.v1'));
  await page.reload();

  await expect(page.getByRole('dialog', { name: 'Comece com três pequenos giros' })).toBeVisible();
  await page.getByRole('button', { name: 'Começar a explorar' }).click();

  await expect(page.getByRole('dialog', { name: 'Comece com três pequenos giros' })).toBeHidden();
  await expect(page.getByRole('heading', { name: 'O que você quer dominar hoje?' })).toBeVisible();
});

test('explora um conceito e responde ao mini-quiz', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'O que você quer dominar hoje?' })).toBeVisible();
  await page.getByText('Testar conhecimento').click();
  await page
    .getByRole('radio', { name: 'É apenas uma escolha de aparência sem efeito técnico.' })
    .check();
  await page.getByRole('button', { name: 'Confirmar resposta' }).click();

  await expect(page.getByRole('status')).toContainText('Ainda não.');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});

test('filtra uma categoria específica dentro da trilha', async ({ page }) => {
  await page.getByRole('button', { name: 'IA & ML' }).click();
  await expect(page.getByRole('group', { name: 'Categorias da trilha selecionada' })).toBeVisible();

  await page.getByRole('button', { name: 'Visão Computacional' }).click();

  await expect(page.getByRole('button', { name: 'IA & ML' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Visão Computacional' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText(/Visão Computacional ·/)).toBeVisible();
});

test('aguarda o comando para iniciar cada etapa do temporizador', async ({ page }) => {
  await page.getByRole('button', { name: /Explorar · 30 min/i }).click();

  await expect(page.getByRole('dialog', { name: 'Tempo de foco' })).toBeVisible();
  await expect(page.getByText('PRONTO')).toBeVisible();
  await expect(page.getByText('30:00')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Começar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Concluir agora' })).toBeHidden();

  await page.waitForTimeout(1_100);
  await expect(page.getByText('30:00')).toBeVisible();

  await page.getByRole('button', { name: 'Começar' }).click();
  await expect(page.getByRole('button', { name: 'Pausar' })).toBeVisible();
  await page.getByRole('button', { name: 'Concluir agora' }).click();

  await expect(page.getByRole('dialog', { name: 'Hora de explicar' })).toBeVisible();
  await expect(page.getByText('15:00')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Começar' })).toBeVisible();
});

test('salva e limpa o progresso local com confirmação', async ({ page }) => {
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.getByRole('button', { name: /1 item salvo/i }).click();
  await expect(page.getByRole('dialog', { name: 'Seu progresso local' })).toBeVisible();
  await page.getByRole('button', { name: 'Limpar progresso' }).click();
  await page.getByRole('button', { name: 'Sim, apagar progresso' }).click();

  await expect(page.getByRole('status')).toHaveText('Progresso local removido.');
  await expect(page.getByText('Você ainda não salvou nenhum item.')).toBeVisible();
});

test('não apresenta violações automáticas graves de acessibilidade', async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(results.violations.filter((violation) => violation.impact === 'serious')).toEqual([]);
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([]);
});
