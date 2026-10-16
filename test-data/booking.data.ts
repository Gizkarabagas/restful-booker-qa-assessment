export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface BookingDates {
  checkin: string;
  checkout: string;
}

/**
 * Generates dynamic future dates to guarantee non-colliding booking slots across test runs.
 */
export function generateFutureBookingDates(offsetDays: number = 180, durationNights: number = 2): BookingDates {
  const now = new Date();
  
  const checkin = new Date(now);
  checkin.setDate(now.getDate() + offsetDays);

  const checkout = new Date(checkin);
  checkout.setDate(checkin.getDate() + durationNights);

  const toYMD = (d: Date) => d.toISOString().split('T')[0];

  return {
    checkin: toYMD(checkin),
    checkout: toYMD(checkout),
  };
}

export const validGuestData: GuestDetails = {
  firstName: 'Alexander',
  lastName: 'QAEngineer',
  email: 'alexander.sdet@automationqa.io',
  phone: '0812345678901', // 13 digits (valid between 11 and 21)
};

export const emptyGuestData: GuestDetails = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export const invalidPhoneGuestData: GuestDetails = {
  firstName: 'Sarah',
  lastName: 'Connor',
  email: 'sarah.connor@test.com',
  phone: '12345', // below 11 digits
};
