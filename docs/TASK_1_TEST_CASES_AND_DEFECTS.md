# Task 1: Test Case Design & Defect Reporting

**Application Under Test:** Restful Booker Platform ([automationintesting.online](https://automationintesting.online/))  
**Workflow Under Test:** Room Booking & Reservation Workflow  
**Author:** QA / SDET Specialist  
**Target Management System:** Jira + Xray Test Management (BDD / Cucumber format)  

---

## 1. Overview & Workflow Analysis

The **Room Booking Workflow** is the core business process of the Shady Meadows B&B application. It allows potential guests to:
1. Browse available rooms from the storefront.
2. Select desired stay dates (Check-in and Check-out).
3. Review room details, amenities, policies, and pricing breakdown (nightly rate + cleaning fee + service fee).
4. Provide guest contact information (Firstname, Lastname, Email, Phone).
5. Submit the reservation and receive an instant booking confirmation with reservation details.

---

## 2. Test Case Design Matrix

Below is a comprehensive suite of test cases designed in **Jira Xray BDD / Cucumber format**, encompassing **Positive**, **Negative**, and **Boundary / Edge** scenarios.

| Test ID | Scenario Summary | Test Type | Priority | Given (Precondition) | When (Action Steps) | Then (Expected Result) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-BOOK-001** | Successful room booking with valid guest details and available dates | Positive (E2E) | High (P1) | User is on the room reservation page with available dates | 1. User clicks "Reserve Now"<br>2. User enters valid Firstname, Lastname, Email, and Phone (11+ digits)<br>3. User submits reservation | Booking is confirmed successfully (HTTP 201), confirmation card displays check-in/out dates, and "Return home" button is visible. |
| **TC-BOOK-002** | Submit booking modal with all mandatory fields empty | Negative | High (P1) | User has opened the booking modal for an available room | 1. User leaves Firstname, Lastname, Email, and Phone blank<br>2. User clicks "Reserve Now" | Form is not submitted (HTTP 400), red validation banner appears containing specific errors for blank Firstname, Lastname, Email, and Phone. |
| **TC-BOOK-003** | Submit booking with Firstname and Lastname below minimum boundary (2 chars) | Boundary (Negative) | Medium (P2) | User is on the booking modal | 1. User inputs 2 characters for Firstname ("Jo") and Lastname ("Do")<br>2. Valid email and phone provided<br>3. User clicks "Reserve Now" | Validation error is triggered indicating name size must be between 3 and 18 characters. Form is not submitted. |
| **TC-BOOK-004** | Submit booking with Firstname and Lastname at maximum boundary (18 chars) | Boundary (Positive) | Medium (P2) | User is on the booking modal | 1. User inputs exactly 18 characters for Firstname and Lastname<br>2. Valid email and phone provided<br>3. User clicks "Reserve Now" | Reservation succeeds without validation error (HTTP 201). Boundary of 18 chars is correctly accepted. |
| **TC-BOOK-005** | Submit booking with invalid email format (missing '@' and domain) | Negative | High (P1) | User is on the booking modal | 1. User inputs valid names and phone<br>2. User inputs "invalidemailstring"<br>3. User clicks "Reserve Now" | Form displays validation error regarding invalid email format. Booking is rejected. |
| **TC-BOOK-006** | Submit booking with Phone number below minimum boundary (10 digits) | Boundary (Negative) | High (P1) | User is on the booking modal | 1. User inputs a 10-digit phone number (e.g. "0123456789")<br>2. Other fields valid<br>3. User clicks "Reserve Now" | Validation error displays "size must be between 11 and 21". Form is rejected. |
| **TC-BOOK-007** | Submit booking with Phone number at boundary limits (11 and 21 digits) | Boundary (Positive) | Medium (P2) | User is on the booking modal | 1. User tests with 11 digits and 21 digits valid numerical phone<br>2. Other fields valid<br>3. User clicks "Reserve Now" | Reservation succeeds for both 11-digit and 21-digit boundaries (HTTP 201). |
| **TC-BOOK-008** | Attempt to book dates that overlap with an existing confirmed booking | Negative (Conflict) | High (P1) | A confirmed booking already exists for Room 101 on dates 2026-11-10 to 2026-11-12 | 1. Another guest attempts to book Room 101 for the exact overlapping dates<br>2. User fills valid details and submits | System rejects booking with HTTP 409 Conflict. UI displays a clear, graceful error banner stating "Room is unavailable for the selected dates". (See Defect BUG-001). |
| **TC-BOOK-009** | Minimum length stay (1 night booking) | Boundary (Positive) | Medium (P2) | User is on the booking calendar | 1. User selects check-in date 2026-11-20 and check-out date 2026-11-21 (1 night)<br>2. User verifies price calculation<br>3. User submits reservation | Price calculation shows `1 night x rate + cleaning fee + service fee`. Reservation succeeds. |
| **TC-BOOK-010** | Attempt to select Check-out date prior to Check-in date (Reverse date range) | Edge Case (Negative) | High (P1) | User is on the booking calendar | 1. User sets Check-out date earlier than Check-in date via date picker or URL params<br>2. User attempts to submit | Date picker disallows earlier checkout OR form validation blocks submission with "Check-out date must be after Check-in date". |
| **TC-BOOK-011** | Submit booking containing purely alphabetic string in Phone number field | Edge Case (Negative) | Medium (P2) | User is on the booking modal | 1. User inputs "abcdefghijk12" (13 chars) in phone input<br>2. Other fields valid<br>3. User clicks "Reserve Now" | Form validation rejects non-numeric phone format with "Phone must contain valid phone digits". (See Defect BUG-002). |
| **TC-BOOK-012** | Guest name with international characters and apostrophes (e.g. "O'Connor", "René") | Edge Case (Positive) | Low (P3) | User is on the booking modal | 1. User enters Firstname "René" and Lastname "O'Connor"<br>2. Other fields valid<br>3. User submits reservation | System successfully processes special characters without string corruption or injection errors (HTTP 201). |

---

### 2.1 Gherkin Feature File Syntax (`booking.feature`)

File ini dapat langsung diimport ke **Jira Xray (Cucumber Test Type)** atau dieksekusi langsung oleh test runner:

```gherkin
@booking @regression
Feature: Room Reservation Workflow
  As a guest of Shady Meadows B&B
  I want to select and book a hotel room online
  So that I have a confirmed reservation for my stay

  @XRAY-101 @smoke @e2e
  Scenario: [XRAY-101] Successfully book a room with valid guest details
    Given the guest navigates to the reservation page for an available room
    When the guest opens the reservation modal
    And the guest enters valid guest details
    And the guest submits the reservation form
    Then the system displays the booking confirmation with the reserved dates

  @XRAY-102 @negative @validation
  Scenario: [XRAY-102] Display validation errors when submitting booking form with missing mandatory fields
    Given the guest navigates to the reservation page for an available room
    When the guest opens the reservation modal
    And the guest leaves all guest details fields empty
    And the guest submits the reservation form
    Then the system displays a validation error banner containing mandatory field requirements

  @XRAY-103 @boundary @negative
  Scenario Outline: [XRAY-103] Validation on guest names below minimum boundary (< 3 characters)
    Given the guest navigates to the reservation page for an available room
    When the guest opens the reservation modal
    And the guest inputs Firstname "<firstname>" and Lastname "<lastname>"
    And the guest submits the reservation form
    Then the system displays a validation error "size must be between 3 and 18"

    Examples:
      | firstname | lastname |
      | Al        | Do       |
      | J         | K        |

  @XRAY-108 @negative @conflict
  Scenario: [XRAY-108] Reject booking on date conflict with an existing reservation
    Given a room has an existing confirmed reservation on "2026-11-10" to "2026-11-12"
    When another guest attempts to book the same room on "2026-11-10" to "2026-11-12"
    And the guest submits valid guest information
    Then the system rejects the booking with an HTTP 409 conflict
    And the UI displays an error alert indicating the room is unavailable
```

---

## 3. Structured Defect Reports

During exploratory and automated execution against the live demo application (`https://automationintesting.online/`), **three (3) critical and medium defects** were identified, reproduced, and documented using industry-standard Jira defect templates.

---

### Defect 1: [BUG-001] Frontend Crashes to Unhandled Error Boundary ("This page couldn't load") on Date Conflict (HTTP 409)

* **Issue Key:** BUG-001
* **Severity:** Critical (S1)
* **Priority:** High (P1)
* **Component:** Frontend / Booking Modal / Error Handling
* **Environment:** Production Demo (`https://automationintesting.online/`), Next.js 14+ Client, Google Chrome / Playwright Chromium Headless/Headed

#### Description
When a user attempts to book a room for dates that already have an existing reservation, the backend API correctly returns an `HTTP 409 Conflict` with JSON payload `{"error":"Failed to create booking"}`. However, the frontend application fails to catch or handle the HTTP 409 status code. Instead of displaying a user-friendly error message inside the modal (e.g. *"These dates are no longer available. Please choose different dates"*), the entire React application crashes and renders Next.js's fallback unhandled error screen: **"This page couldn't load. Reload to try again, or go back."**

#### Steps to Reproduce
1. Navigate to `https://automationintesting.online/`
2. Select Room 101 and navigate to the reservation URL with dates that already have a booking, e.g.:  
   `https://automationintesting.online/reservation/1?checkin=2026-11-10&checkout=2026-11-12`
3. Click the blue **"Reserve Now"** button on the right summary card.
4. Fill in valid guest details:
   * Firstname: `John`
   * Lastname: `Doe`
   * Email: `john.doe@example.com`
   * Phone: `0812345678901`
5. Click **"Reserve Now"** inside the modal.

#### Expected Result
The modal remains open and renders a prominent warning alert:  
`"The selected dates are already booked or unavailable. Please select alternative dates."`  
User state and inputs are preserved.

#### Actual Result
The API call `POST /api/booking` responds with `HTTP 409 Conflict`. The UI immediately crashes to a full-page error boundary screen:
> **"This page couldn't load. Reload to try again, or go back."**  
All user input is lost.

#### Evidence
* **Screenshot:** [screenshot_double_booking.png](file:///d:/Teknikal%20test%20IO%20Software%20Solutions/docs/evidence/screenshot_double_booking.png)
* **Network Payload:**
  * Request: `POST https://automationintesting.online/api/booking`
  * Response: `HTTP/1.1 409 Conflict`
  * Response Body: `{"error":"Failed to create booking"}`

#### Suggested Fix
In the booking submission handler (e.g., `handleReserveSubmit`), wrap the API call in a `try...catch` block. Check `response.status === 409` and set an error state `errorMessage = "The selected dates are unavailable. Please select another date."` to be displayed in an `<Alert variant="danger">` inside the modal rather than bubbling up as an uncaught Promise rejection.

---

### Defect 2: [BUG-002] Missing Phone Number Format Validation (Accepts Purely Alphabetic Strings)

* **Issue Key:** BUG-002
* **Severity:** Medium (S2)
* **Priority:** Medium (P2)
* **Component:** Backend API / Validation Layer (`/api/booking`)
* **Environment:** Production Demo (`https://automationintesting.online/api/booking`)

#### Description
The phone number validation on both the client-side and backend API only checks the string length constraint (`size must be between 11 and 21`). It fails to validate character types or regex patterns. As a result, users can submit purely alphabetic strings (e.g. `"abcdefghijk12"`) as their contact phone number, and the system accepts the reservation with `HTTP 201 Created`.

#### Steps to Reproduce
1. Send a `POST` request to `https://automationintesting.online/api/booking` with the following payload:
   ```json
   {
     "roomid": 1,
     "firstname": "Tester",
     "lastname": "AlphaPhone",
     "depositpaid": false,
     "bookingdates": {
       "checkin": "2026-12-01",
       "checkout": "2026-12-03"
     },
     "email": "test@example.com",
     "phone": "abcdefghijk12"
   }
   ```
2. Inspect the HTTP status code and response body.

#### Expected Result
The API should validate the phone field against numeric/international phone format (e.g. `^[+0-9\s\-()]{11,21}$`) and reject with `HTTP 400 Bad Request`:  
`{"errors": ["Phone number must contain only numbers and valid dialing characters"]}`.

#### Actual Result
The API responds with `HTTP 201 Created`:
```json
{
  "bookingdates": { "checkin": "2026-12-01", "checkout": "2026-12-03" },
  "bookingid": 5,
  "depositpaid": false,
  "firstname": "Tester",
  "lastname": "AlphaPhone",
  "roomid": 1
}
```

#### Impact
Hotel staff cannot contact guests via phone in case of emergencies, check-in arrangements, or booking disputes due to invalid customer contact data entering the production database.

#### Suggested Fix
Add regex format validation in the Java/Spring Boot `Booking` DTO:
```java
@Pattern(regexp = "^[0-9+() -]{11,21}$", message = "Phone must be a valid phone number format")
private String phone;
```

---

### Defect 3: [BUG-003] Raw Unmapped Backend Error Messages Displayed in UI with Duplicates and Missing Field Names

* **Issue Key:** BUG-003
* **Severity:** Low / UX (S3)
* **Priority:** Medium (P2)
* **Component:** Frontend / Booking Modal Validation Banner
* **Environment:** Production Demo (`https://automationintesting.online/`)

#### Description
When a user clicks "Reserve Now" in the booking modal with empty inputs, the backend responds with `HTTP 400 Bad Request` containing an unformatted array of JSR-303/Hibernate validation messages:
```json
{"errors":["size must be between 3 and 18","must not be empty","Lastname should not be blank","Firstname should not be blank","size must be between 3 and 30","size must be between 11 and 21","must not be empty"]}
```
The frontend modal directly dumps this raw array into a red alert box without associating each error with its corresponding input field. This leads to:
1. Duplicate error lines: `"must not be empty"` is displayed twice.
2. Cryptic messages: `"size must be between 3 and 18"` and `"size must be between 11 and 21"` do not inform the user which field they pertain to.

#### Steps to Reproduce
1. Navigate to `https://automationintesting.online/reservation/1?checkin=2026-10-17&checkout=2026-10-18`
2. Click "Reserve Now" on the summary card.
3. Leave all inputs (Firstname, Lastname, Email, Phone) completely blank.
4. Click "Reserve Now" in the modal.
5. Observe the red validation error banner.

#### Expected Result
- Validation errors should either be displayed inline directly below each corresponding input field (e.g. *"Firstname is required"*, *"Phone must be between 11 and 21 characters"*).
- If displayed in a top banner, each message must explicitly name the field and avoid duplicate bullet points.

#### Actual Result
The red banner displays a disorganized, raw string dump:
```text
size must be between 3 and 18
must not be empty
Lastname should not be blank
Firstname should not be blank
size must be between 3 and 30
size must be between 11 and 21
must not be empty
```

#### Evidence
* **Screenshot:** [screenshot_validation_errors.png](file:///d:/Teknikal%20test%20IO%20Software%20Solutions/docs/evidence/screenshot_validation_errors.png)

#### Suggested Fix
Implement frontend schema validation (using Zod or Yup with React Hook Form) prior to submitting the network request. Map server validation errors to structured field keys (`{ field: 'phone', message: '...' }`).
