import { test as base } from 'playwright-bdd';
import { HomePage } from '../pages/home.page';
import { ReservationPage } from '../pages/reservation.page';
import { generateFutureBookingDates, BookingDates } from '../test-data/booking.data';

export interface BookingContext {
  dates: BookingDates;
  roomId: number;
}

type CustomFixtures = {
  homePage: HomePage;
  reservationPage: ReservationPage;
  bookingContext: BookingContext;
};

export const test = base.extend<CustomFixtures>({
  bookingContext: async ({}, use) => {
    // Generate a fresh, random date interval 90-150 days in the future to avoid booking conflicts
    const randomOffset = 90 + Math.floor(Math.random() * 60);
    const dates = generateFutureBookingDates(randomOffset, 2);
    await use({
      dates,
      roomId: 1,
    });
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  reservationPage: async ({ page }, use) => {
    await use(new ReservationPage(page));
  },
});
