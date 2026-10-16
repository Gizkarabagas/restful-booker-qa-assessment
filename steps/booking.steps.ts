import { createBdd } from 'playwright-bdd';
import { test } from '../fixtures/fixture';
import { validGuestData, emptyGuestData } from '../test-data/booking.data';

export const { Given, When, Then } = createBdd(test);

Given('the guest navigates to the reservation page for an available room', async ({ reservationPage, bookingContext }) => {
  const { roomId, dates } = bookingContext;
  await reservationPage.open(roomId, dates.checkin, dates.checkout);
});

When('the guest opens the reservation modal', async ({ reservationPage }) => {
  await reservationPage.openReserveModal();
});

When('the guest enters valid guest details', async ({ reservationPage }) => {
  await reservationPage.fillGuestDetails(validGuestData);
});

When('the guest leaves all guest details fields empty', async ({ reservationPage }) => {
  await reservationPage.fillGuestDetails(emptyGuestData);
});

When('the guest submits the reservation form', async ({ reservationPage }) => {
  await reservationPage.submitModal();
});

Then('the system displays the booking confirmation with the reserved dates', async ({ reservationPage, bookingContext }) => {
  const { dates } = bookingContext;
  await reservationPage.verifyBookingSuccess(dates.checkin, dates.checkout);
});

Then('the system displays a validation error banner containing mandatory field requirements', async ({ reservationPage }) => {
  await reservationPage.verifyValidationAlertVisible();
  await reservationPage.verifyErrorContains('must not be empty');
});
