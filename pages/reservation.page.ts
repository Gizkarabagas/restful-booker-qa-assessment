import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { GuestDetails } from '../test-data/booking.data';

/**
 * ReservationPage represents the detailed room booking page (/reservation/{id})
 * Encapsulates the pricing summary, date calendar, guest details modal, and confirmation view.
 */
export class ReservationPage extends BasePage {
  readonly roomHeading: Locator;
  readonly reserveNowButton: Locator;
  
  // Booking modal locators
  readonly modalContainer: Locator;
  readonly firstnameInput: Locator;
  readonly lastnameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly modalSubmitButton: Locator;
  readonly modalCancelButton: Locator;

  // Confirmation view locators
  readonly confirmationHeading: Locator;
  readonly returnHomeButton: Locator;

  // Validation alert locators
  readonly validationAlert: Locator;

  constructor(page: Page) {
    super(page);
    this.roomHeading = page.locator('h1, h2').first();
    this.reserveNowButton = page.locator('button:has-text("Reserve Now")').first();

    // Modal elements
    this.modalContainer = page.locator('.modal-content, .modal, div[role="dialog"]');
    this.firstnameInput = page.locator('input[name="firstname"]');
    this.lastnameInput = page.locator('input[name="lastname"]');
    this.emailInput = page.locator('input[name="email"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.modalSubmitButton = page.locator('.modal-content button:has-text("Reserve Now"), div[role="dialog"] button:has-text("Reserve Now"), button:has-text("Reserve Now")').last();
    this.modalCancelButton = page.locator('button:has-text("Cancel")');

    // Confirmation elements
    this.confirmationHeading = page.locator('text=Booking Confirmed');
    this.returnHomeButton = page.locator('text=Return home');

    // Validation alerts
    this.validationAlert = page.locator('.alert, .alert-danger, [class*="alert"]');
  }

  /**
   * Directly navigates to a reservation page for a given room and date range
   */
  async open(roomId: number = 1, checkin: string, checkout: string): Promise<void> {
    const url = `/reservation/${roomId}?checkin=${checkin}&checkout=${checkout}`;
    await this.navigateTo(url);
    await this.reserveNowButton.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Clicks 'Reserve Now' in the summary sidebar to trigger the guest information modal
   */
  async openReserveModal(): Promise<void> {
    await this.safeClick(this.reserveNowButton);
    await this.firstnameInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Populates the guest information form inside the modal
   */
  async fillGuestDetails(guest: GuestDetails): Promise<void> {
    if (guest.firstName !== undefined) {
      await this.safeFill(this.firstnameInput, guest.firstName);
    }
    if (guest.lastName !== undefined) {
      await this.safeFill(this.lastnameInput, guest.lastName);
    }
    if (guest.email !== undefined) {
      await this.safeFill(this.emailInput, guest.email);
    }
    if (guest.phone !== undefined) {
      await this.safeFill(this.phoneInput, guest.phone);
    }
  }

  /**
   * Submits the reservation modal
   */
  async submitModal(): Promise<void> {
    await this.safeClick(this.modalSubmitButton);
  }

  /**
   * Asserts that booking confirmation has appeared with correct dates
   */
  async verifyBookingSuccess(checkin: string, checkout: string): Promise<void> {
    await expect(this.confirmationHeading).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(`text=${checkin} - ${checkout}`)).toBeVisible();
    await expect(this.returnHomeButton).toBeVisible();
  }

  /**
   * Asserts that validation alert banner is displayed
   */
  async verifyValidationAlertVisible(): Promise<void> {
    await expect(this.validationAlert).toBeVisible({ timeout: 10000 });
  }

  /**
   * Asserts specific validation error text is present in the alert banner
   */
  async verifyErrorContains(errorSnippet: string): Promise<void> {
    await expect(this.validationAlert).toContainText(errorSnippet);
  }
}
