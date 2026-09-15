import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
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
