import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import {
  QuizPage,
  SEEDED_CORRECT_ANSWERS,
  SEEDED_QUIZ_TITLE,
} from '../../pages/QuizPage';
import {
  cleanupQuizzesByTitle,
  cleanupQuizzesByTitlePrefix,
  createQuizViaApi,
  safeCleanup,
} from '../../helpers/apiCleanup';
import { uniqueLabel } from '../../helpers/testData';

test.describe('quiz', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    test.setTimeout(90_000);
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can take seeded quiz and review results', async ({ page, asStudent }) => {
    void asStudent;
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.openQuiz(SEEDED_QUIZ_TITLE);
    await quiz.answerByOptionText(SEEDED_CORRECT_ANSWERS);
    await quiz.submit();

    await expect(quiz.toast(/Quiz submitted!/i)).toBeVisible({ timeout: 15_000 });
    await quiz.expectResults(100);

    await quiz.filterReview('Correct');
    await expect(page.getByText('Question 1')).toBeVisible();
    await quiz.filterReview('Incorrect');
    await expect(page.getByText('Question 1')).toHaveCount(0);
    await quiz.filterReview('All');
    await expect(page.getByText('Question 1')).toBeVisible();

    await quiz.backToQuizzes();
    await quiz.reviewFromList(SEEDED_QUIZ_TITLE);
    await expect(page.getByText('Quiz results')).toBeVisible();
  });

  test('student can rename and delete a quiz', async ({ page, asStudent, studentSession }) => {
    void asStudent;
    const title = uniqueLabel('E2E Quiz');
    const renamed = `${title} Renamed`;

    await safeCleanup(async () => {
      await cleanupQuizzesByTitlePrefix(studentSession.accessToken, 'E2E Quiz');
    });

    const created = await createQuizViaApi(studentSession.accessToken, title);
    expect(created?.id).toBeTruthy();

    const quiz = new QuizPage(page);

    try {
      await quiz.goto();
      await expect(quiz.quizCard(title)).toBeVisible({ timeout: 15_000 });

      await quiz.renameQuiz(title, renamed);
      await expect(quiz.toast(/Quiz renamed successfully/i)).toBeVisible({ timeout: 15_000 });
      await expect(quiz.quizCard(renamed)).toBeVisible({ timeout: 15_000 });

      await quiz.deleteQuiz(renamed);
      await expect(quiz.toast(/Quiz deleted successfully/i)).toBeVisible({ timeout: 15_000 });
      await expect(quiz.quizCard(renamed)).toHaveCount(0, { timeout: 15_000 });
    } finally {
      await safeCleanup(async () => {
        await cleanupQuizzesByTitle(studentSession.accessToken, title);
        await cleanupQuizzesByTitle(studentSession.accessToken, renamed);
      });
    }
  });
});
