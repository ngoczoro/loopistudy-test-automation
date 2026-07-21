/** Unique suffix so parallel/demo data doesn't collide. */
export function uniqueLabel(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function toast(page: import('@playwright/test').Page, text: string | RegExp) {
  // Prefer currently visible toasts — Sonner keeps old nodes in DOM after dismiss
  return page
    .locator('[data-sonner-toast][data-visible="true"]')
    .filter({ hasText: text });
}

