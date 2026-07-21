import { expect, type Locator, type Page } from '@playwright/test';
import { toast } from '../helpers/testData';

/** Seeded demo quiz for alex.demo@loopi.com */
export const SEEDED_QUIZ_TITLE = 'Linear Algebra — Quick Review';

/** Correct option labels for the seeded 3-question demo quiz. */
export const SEEDED_CORRECT_ANSWERS = ['1', 'Queue', 'Chloroplast'] as const;

export class QuizPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/quiz');
    await expect(
      this.page.getByRole('heading', { name: /My Quizzes|No Quizzes Yet/ }),
    ).toBeVisible({ timeout: 15_000 });
  }

  quizCard(title: string): Locator {
    return this.page
      .locator('div.bg-card')
      .filter({ has: this.page.getByRole('heading', { name: title, exact: true }) })
      .first();
  }

  async openQuiz(title: string) {
    await this.quizCard(title).click();
    await expect(this.page.getByText(/^Q1\./)).toBeVisible({ timeout: 15_000 });
  }

  /** Click option buttons by visible answer text (full option string). */
  async answerByOptionText(optionTexts: readonly string[]) {
    for (let i = 0; i < optionTexts.length; i++) {
      const question = this.page
        .locator('div.bg-card')
        .filter({ hasText: new RegExp(`Q${i + 1}\\.`) })
        .first();
      await question
        .locator('button')
        .filter({ has: this.page.getByText(optionTexts[i], { exact: true }) })
        .click();
    }
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Submit Quiz' }).click();
  }

  async expectResults(scorePercent?: number) {
    await expect(this.page.getByText('Quiz results')).toBeVisible({ timeout: 15_000 });
    if (scorePercent !== undefined) {
      await expect(this.page.getByText(`Score: ${scorePercent}%`)).toBeVisible();
    }
  }

  async filterReview(filter: 'All' | 'Incorrect' | 'Correct') {
    await this.page.getByRole('button', { name: filter, exact: true }).click();
  }

  async tryAgain() {
    await this.page.getByRole('button', { name: /Try again|Retake/ }).click();
    await expect(this.page.getByRole('button', { name: 'Submit Quiz' })).toBeVisible({
      timeout: 10_000,
    });
  }

  async backToQuizzes() {
    await this.page.getByRole('button', { name: 'Back to quizzes' }).click();
    await expect(this.page.getByRole('heading', { name: 'My Quizzes' })).toBeVisible({
      timeout: 15_000,
    });
  }

  async reviewFromList(title: string) {
    const card = this.quizCard(title);
    await expect(card.getByRole('button', { name: 'Review' })).toBeVisible({
      timeout: 15_000,
    });
    await card.getByRole('button', { name: 'Review' }).click();
    await expect(this.page.getByText('Quiz results')).toBeVisible({ timeout: 15_000 });
  }

  async renameQuiz(title: string, nextTitle: string) {
    const card = this.quizCard(title);
    await card.hover();
    await card.getByTitle('Rename quiz').click({ force: true });
    await expect(this.page.getByRole('heading', { name: 'Rename quiz' })).toBeVisible();
    await this.page.locator('#quiz-rename-title').fill(nextTitle);
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
  }

  async deleteQuiz(title: string) {
    const card = this.quizCard(title);
    await card.hover();
    await card.getByTitle('Delete quiz').click({ force: true });
    await expect(this.page.getByRole('heading', { name: 'Delete Quiz' })).toBeVisible();
    await this.page.getByRole('button', { name: 'Delete', exact: true }).click();
  }

  toast(text: string | RegExp) {
    return toast(this.page, text);
  }
}
