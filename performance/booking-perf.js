import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Performance Test Script - Restful Booker Platform Booking API
 * Covers: Normal Traffic (5 RPS) -> Ramp-up -> Peak Traffic (20 RPS) -> Recovery
 */
export const options = {
  scenarios: {
    booking_traffic_ramp: {
      executor: 'ramping-arrival-rate',
      startRate: 5,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 150,
      stages: [
        { target: 5, duration: '1m' },   // Stage 1: Normal Expected Traffic (5 RPS)
        { target: 20, duration: '2m' },  // Stage 2: Gradual Traffic Increase to Peak (20 RPS)
        { target: 20, duration: '2m' },  // Stage 3: Sustained Peak Traffic (20 RPS)
        { target: 0, duration: '30s' },  // Stage 4: Ramp down / Recovery
      ],
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<1000', 'p(99)<2000'],
    'http_req_failed': ['rate<0.05'],
    'checks': ['rate>0.95'],
  },
};

export default function () {
  const url = 'https://automationintesting.online/api/booking';
  
  // Generate randomized future date slots to simulate independent guest bookings
  const randomDay = Math.floor(Math.random() * 20) + 1;
  const uniqueMonth = Math.floor(Math.random() * 5) + 1;
  const payload = JSON.stringify({
    roomid: 1,
    firstname: 'PerfGuest',
    lastname: 'k6LoadTest',
    depositpaid: false,
    bookingdates: {
      checkin: `2028-0${uniqueMonth}-${String(randomDay).padStart(2, '0')}`,
      checkout: `2028-0${uniqueMonth}-${String(randomDay + 2).padStart(2, '0')}`,
    },
    email: `perf_${__VU}_${__ITER}@loadtest.io`,
    phone: '0812345678901',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
    responseCallback: http.expectedStatuses(201, 409),
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201 or 409': (r) => r.status === 201 || r.status === 409,
    'response time OK (<1200ms)': (r) => r.timings.duration < 1200,
  });

  sleep(0.5);
}
