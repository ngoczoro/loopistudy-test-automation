import { test, expect } from '../../fixtures/auth';
import { env } from '../../helpers/env';
import { waitForHealth } from '../../helpers/health';
import { waitForFrontend } from '../../helpers/frontend';
import { SettingsPage } from '../../pages/SettingsPage';
import { uniqueLabel } from '../../helpers/testData';

test.describe('settings', () => {
  test.skip(
    !env.requireServices,
    'Set REQUIRE_SERVICES=true and start frontend + backend (with db:seed:demo)',
  );

  test.beforeEach(async () => {
    await waitForHealth({ timeoutMs: 15_000 });
    await waitForFrontend({ timeoutMs: 15_000 });
  });

  test('student can update display name', async ({ page, asStudent }) => {
    void asStudent;
    const settings = new SettingsPage(page);
    const name = uniqueLabel('E2E User');

    await settings.goto();
    const previous = await settings.displayNameInput().inputValue();

    const body = await settings.updateDisplayName(name);

    expect(body?.data?.fullName).toBe(name);
    await expect(settings.toast(/Profile updated/i)).toBeVisible({ timeout: 15_000 });
    await expect(settings.displayNameInput()).toHaveValue(name, { timeout: 15_000 });

    // Restore seed name — assert via API + input (same toast text as above is flaky with Sonner)
    if (previous && previous !== name) {
      const restored = await settings.updateDisplayName(previous);
      expect(restored?.data?.fullName).toBe(previous);
      await expect(settings.displayNameInput()).toHaveValue(previous, { timeout: 15_000 });
    }
  });
});
