import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage encapsulates common browser actions, waiting strategies,
 * and assertions following the Object-Oriented Programming (OOP) paradigm.
 */
export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigates to a specific path relative to the baseURL or absolute URL
   */
  async navigateTo(path: string = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Safely clicks an element after ensuring it is visible and enabled
   */
  async safeClick(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.click();
  }

  /**
   * Safely fills an input field after clearing existing text
   */
  async safeFill(locator: Locator, text: string, timeout: number = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill(text);
  }

  /**
   * Waits for network requests to settle
   */
  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Asserts element visibility with custom timeout
   */
  async assertVisible(locator: Locator, timeout: number = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Asserts element contains specific text
   */
  async assertContainsText(locator: Locator, expectedText: string | RegExp): Promise<void> {
    await expect(locator).toContainText(expectedText);
  }
}
