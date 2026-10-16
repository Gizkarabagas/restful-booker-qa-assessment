import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * HomePage represents the landing page of Shady Meadows B&B.
 * Encapsulates room listings, navigation links, and availability checks.
 */
export class HomePage extends BasePage {
  readonly pageTitle: Locator;
  readonly roomsSection: Locator;
  readonly bookNowButtons: Locator;
  readonly checkAvailabilityButton: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('text=Shady Meadows B&B').first();
    this.roomsSection = page.locator('#rooms, .row.hotel-room, [class*="room"]');
    this.bookNowButtons = page.locator('a:has-text("Book now"), button:has-text("Book now")');
    this.checkAvailabilityButton = page.locator('button:has-text("Check Availability")');
  }

  /**
   * Navigates to the homepage and waits for rooms to load
   */
  async open(): Promise<void> {
    await this.navigateTo('/');
    await this.page.waitForLoadState('domcontentloaded');
    await this.bookNowButtons.first().waitFor({ state: 'attached', timeout: 15000 });
  }

  /**
   * Clicks 'Book now' on the first available room on the homepage
   */
  async clickFirstBookNow(): Promise<void> {
    await this.safeClick(this.bookNowButtons.first());
    await this.page.waitForLoadState('domcontentloaded');
  }
}
