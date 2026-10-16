# Task 2: API Testing Strategy & Documentation

**Application Under Test:** Restful Booker Platform API ([automationintesting.online](https://automationintesting.online/))  
**Tool Used:** Postman (Schema v2.1.0) & Newman CLI  
**Author:** QA / SDET Specialist  

---

## 1. Overview of Exposed APIs

The Restful Booker Platform is constructed on a decoupled microservices architecture serving the frontend hotel booking application. Through exploratory reverse proxy and network analysis, the exposed REST endpoints are mapped as follows:

| Service / Resource | HTTP Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/auth/login` | No | Authenticates admin user and returns session `token`. |
| **Rooms** | `GET` | `/api/room` | No | Retrieves all hotel rooms with pricing, amenities, and types. |
| **Rooms** | `GET` | `/api/room/{id}` | No | Retrieves detailed configuration of a specific room. |
| **Booking** | `POST` | `/api/booking` | No | Creates a new guest reservation. Public endpoint. |
| **Booking** | `GET` | `/api/booking/{id}` | **Yes** (Cookie `token`) | Retrieves guest details and dates for an existing reservation. |
| **Booking** | `DELETE` | `/api/booking/{id}` | **Yes** (Cookie `token`) | Cancels / deletes a reservation by booking ID. |
| **Calendar Reports**| `GET` | `/api/report/room/{id}` | No | Returns array of unavailable date intervals for calendar rendering. |
| **Contact Messages**| `POST` | `/api/message` | No | Submits inquiry message from the "Contact Us" form. |
| **Branding** | `GET` | `/api/branding` | No | Returns hotel metadata, geo-coordinates, address, and contact info. |

---

## 2. API Test Scenarios Matrix

The exported Postman collection executes 11 automated test requests covering both happy-path business logic and defensive error handling:

| Scenario ID | Test Request Name | Method & Endpoint | Auth State | Scenario Type | Expected Status | Primary Assertions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-TC-001** | Login - Admin | `POST /api/auth/login` | None | Positive | `200 OK` | - Status is 200<br>- Response contains non-empty `token`<br>- Dynamic token saved to `authToken` env variable. |
| **API-TC-002** | Login - Invalid Credentials | `POST /api/auth/login` | None | Negative | `401 / 403` | - Rejects unauthorized login with HTTP 401 or 403. |
| **API-TC-003** | Get All Rooms | `GET /api/room` | None | Positive | `200 OK` | - `rooms` is non-empty array<br>- Each room object contains `roomid`, `roomPrice`, and `type`. |
| **API-TC-004** | Get Room by ID | `GET /api/room/{roomId}` | None | Positive | `200 OK` | - Status is 200<br>- Returned `roomid` matches requested environment parameter. |
| **API-TC-005** | Get Non-existent Room | `GET /api/room/999999` | None | Negative | `404 Not Found` | - Status code verifies resource absence (404/empty). |
| **API-TC-006** | Create Booking - Valid Payload | `POST /api/booking` | None | Positive (E2E) | `201 Created` | - Pre-request script generates unique non-colliding future dates<br>- Returns `bookingid`<br>- `createdBookingId` captured in environment. |
| **API-TC-007** | Create Booking - Validation Errors | `POST /api/booking` | None | Negative | `400 Bad Request` | - Empty mandatory payload triggers 400<br>- `errors` array contains field validation constraints. |
| **API-TC-008** | Create Booking - Date Overlap Conflict | `POST /api/booking` | None | Negative (Conflict)| `409 Conflict` | - Attempting to double-book already reserved dates triggers HTTP 409<br>- Body contains `{"error": "Failed to create booking"}`. |
| **API-TC-009** | Get Booking by ID - Authenticated | `GET /api/booking/1` | Token Cookie | Positive | `200 OK` | - Request passes `Cookie: token={{authToken}}`<br>- Status is 200 with guest and date payload. |
| **API-TC-010** | Get Booking by ID - Unauthenticated | `GET /api/booking/1` | Missing Cookie | Negative (Security)| `403 Forbidden` | - Request without token cookie is blocked with 403 Forbidden. |
| **API-TC-011** | Submit Contact Message | `POST /api/message` | None | Positive | `200 OK` | - Valid contact payload returns `{"success": true}`. |

---

## 3. Postman Artifacts & Execution Guide

### Exported Artifacts Location
* **Collection:** `postman/Restful-Booker-Platform.postman_collection.json`
* **Environment:** `postman/Restful-Booker-Platform.postman_environment.json`

### Environment Variables
| Variable Key | Default Value | Description |
| :--- | :--- | :--- |
| `baseUrl` | `https://automationintesting.online` | Root domain of the target application |
| `adminUsername` | `admin` | Default admin username |
| `adminPassword` | `password` | Default admin password |
| `authToken` | `(dynamic)` | Populated automatically after running request #1 (`Login - Admin`) |
| `roomId` | `1` | Default room used for booking queries |
| `createdBookingId`| `(dynamic)` | Stored dynamically after `Create Booking - Valid Payload` |

### How to Run in Postman GUI
1. Open Postman.
2. Click **Import** $\rightarrow$ select both `postman/Restful-Booker-Platform.postman_collection.json` and `postman/Restful-Booker-Platform.postman_environment.json`.
3. Select the **Restful Booker Platform - Production Demo** environment from the top-right environment selector.
4. Click **Run collection** $\rightarrow$ Click **Run Restful Booker Platform API Test Suite**.
5. All tests will execute sequentially with automated token chaining and assertion evaluation.

### How to Run via Newman (CLI)
You can run the entire collection headlessly via Newman:
```bash
npx newman run postman/Restful-Booker-Platform.postman_collection.json \
  -e postman/Restful-Booker-Platform.postman_environment.json \
  --reporters cli
```
