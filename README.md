# Restful Booker Platform - Playwright BDD Test Automation Framework

An enterprise-grade test automation framework built for **Restful Booker Platform** ([automationintesting.online](https://automationintesting.online/)), combining **Playwright**, **BDD (Cucumber / Gherkin)**, **TypeScript**, and **Object-Oriented Page Object Model (POM)**.

Designed for seamless integration with **Jira + Xray Test Management** and CI/CD pipelines.

---

## 📋 Table of Contents
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Project Structure](#-project-structure)
- [Scenarios Automated](#-scenarios-automated)
- [Prerequisites & Installation](#-prerequisites--installation)
- [Running Tests](#-running-tests)
- [Test Reports & Jira Xray Integration](#-test-reports--jira-xray-integration)
- [Defects & Technical Findings](#-defects--technical-findings)
- [What I Would Improve with Additional Time](#-what-i-would-improve-with-additional-time)

---

## 🏗 Architecture & Design Decisions

### 1. Why Playwright-BDD?
* **Single Source of Truth:** Business-readable Gherkin feature files serve as living documentation that maps 1:1 with manual test cases in Jira Xray.
* **Native Playwright Performance:** Unlike legacy Cucumber wrappers that introduce execution friction, `playwright-bdd` compiles Gherkin scenarios into native `@playwright/test` runners. We retain the full power of Playwright:
  * Automatic waiting & self-healing element retries (no brittle `sleep`).
  * High-fidelity Playwright Trace Viewer and video on failure.
  * Native parallelization capabilities.

### 2. Object-Oriented Programming (OOP) & Page Object Model (POM)
* **Encapsulation & Decoupling:** Step definitions (`steps/`) never touch DOM locators or CSS/XPath selectors. They act as thin orchestration controllers delegating actions to typed Page Objects.
* **Inheritance via `BasePage`:** Common browser operations (`safeClick`, `safeFill`, `navigateTo`, visibility assertions) are centralized in `BasePage` to maintain DRY (Don't Repeat Yourself) principles.
* **Dependency Injection via Custom Fixtures:** Page objects are instantiated and passed into test scenarios via Playwright's extensible fixture mechanism (`fixtures/fixture.ts`), avoiding global state leaks across tests.

### 3. Dynamic Test Data Generation
* Public sandboxes are prone to test collision when hardcoded dates are used. The framework implements dynamic date generation (`test-data/booking.data.ts`) to reserve unique future intervals (e.g., 90–150 days out), guaranteeing test determinism and zero false positives.

---

## 📁 Project Structure

```text
├── .features-gen/              # Auto-generated Playwright spec files from BDD compiler
├── docs/                       # Assessment documentation & evidence
│   ├── evidence/               # Screenshots of UI workflows and defects
│   ├── TASK_1_TEST_CASES_AND_DEFECTS.md
│   └── TASK_2_API_TESTING.md
├── postman/                    # Postman Collection & Environment artifacts
│   ├── Restful-Booker-Platform.postman_collection.json
│   └── Restful-Booker-Platform.postman_environment.json
├── features/                   # Gherkin BDD Feature Files (Jira Xray aligned)
│   └── booking.feature
├── steps/                      # BDD Step Definitions (thin controllers)
│   └── booking.steps.ts
├── pages/                      # Page Object Model (OOP classes)
│   ├── base.page.ts            # Abstract base page with safe wrappers
│   ├── home.page.ts            # Home page interactions
│   └── reservation.page.ts     # Room reservation, calendar & modal interactions
├── fixtures/                   # Playwright-BDD Dependency Injection fixture
│   └── fixture.ts
├── test-data/                  # Typed interfaces, static payloads & dynamic generators
│   └── booking.data.ts
├── results/                    # JUnit XML output for Jira Xray execution import
│   └── results.xml
├── playwright-report/          # Interactive HTML report
├── playwright.config.ts        # Framework configuration (reporters, timeouts, devices)
├── tsconfig.json               # TypeScript compiler configuration
├── package.json
└── README.md
```

---

## 🎯 Scenarios Automated

Two high-value scenarios were automated covering both business critical success and defensive validation:

| Test ID | Scenario Description | Tags | Classification |
| :--- | :--- | :--- | :--- |
| **XRAY-101** | **Successful End-to-End Room Booking**<br>Guest selects an available room, opens the reservation modal, fills valid guest credentials, and submits. Asserts confirmation card displays the reserved dates and return link. | `@XRAY-101` `@smoke` `@e2e` | Happy Path E2E |
| **XRAY-102** | **Mandatory Field Form Validation**<br>Guest opens the reservation modal, leaves all fields blank, and attempts to submit. Asserts that client/server validation alert banner appears with constraint notices. | `@XRAY-102` `@negative` `@validation` | Negative / Validation |

---

## ⚙️ Prerequisites & Installation

### Requirements
* **Node.js:** v18.0.0 or higher (tested on Node v24.13.0)
* **npm:** v9.0.0 or higher

### Installation Steps
1. Clone this repository:
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd "Teknikal test IO Software Solutions"
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browser binaries:
   ```bash
   npx playwright install chromium
   ```

---

## 🚀 Running Tests

### 1. Run all scenarios (Headless)
```bash
npm test
```
*(Runs `bddgen` to compile `.feature` files, followed by `playwright test`)*

### 2. Run in Headed mode (View browser execution)
```bash
npm run test:headed
```

### 3. Run in Playwright Interactive UI Mode
```bash
npm run test:ui
```

### 4. Run specific scenario tag (Smoke / Regression)
```bash
npm run test:smoke
npm run test:regression
```

---

## 📊 Test Reports & Jira Xray Integration

### HTML Report
Generate and view Playwright's interactive HTML test report:
```bash
npm run report
```
The report includes execution timelines, step-by-step Gherkin breakdown, and DOM snapshots.

### Jira Xray Integration (JUnit XML)
Every test execution automatically generates a standard JUnit XML report at:
```text
results/results.xml
```
* Each `<testcase>` name is prefixed with the Jira Issue Key (`[XRAY-101]`, `[XRAY-102]`).
* In your CI/CD pipeline (GitHub Actions, GitLab CI, or Jenkins), you can ingest the execution directly into Jira Xray using the Xray REST API:
  ```bash
  curl -H "Content-Type: multipart/form-data" \
       -H "Authorization: Bearer $XRAY_TOKEN" \
       -F "file=@results/results.xml" \
       "https://xray.cloud.getxray.app/api/v2/import/execution/junit?projectKey=BOOK"
  ```

---

## 🐞 Defects & Technical Findings

Full defect documentation is available in [`docs/TASK_1_TEST_CASES_AND_DEFECTS.md`](docs/TASK_1_TEST_CASES_AND_DEFECTS.md). Key findings include:

1. **[BUG-001] Critical:** UI crashes to an unhandled React Error Boundary (*"This page couldn't load"*) when attempting to book dates that overlap with an existing reservation (HTTP 409 Conflict).
2. **[BUG-002] Medium:** Phone number validation only checks string length (11–21 chars) but permits alphabetic characters (`"abcdefghijk12"`), returning `HTTP 201 Created`.
3. **[BUG-003] UX / Medium:** Unhandled raw backend validation strings dumped directly into the UI error alert without field labeling or duplicate suppression.

---

## 🔮 What I Would Improve with Additional Time

1. **Cross-Browser & Multi-Device Testing:** Expand project configurations in `playwright.config.ts` to include Firefox, WebKit (Safari), and mobile viewports (e.g. Mobile Chrome / Pixel 7, Mobile Safari / iPhone 14).
2. **Visual Regression Testing:** Integrate Playwright's native pixel snapshot comparisons (`expect(page).toHaveScreenshot()`) for the calendar component and pricing breakdown card.
3. **API-Seeded Test Isolation:** Before UI tests run, invoke the `/api/booking` or `/api/room` endpoints via Playwright's `APIRequestContext` to dynamically create fresh room inventory and tear it down in an `afterEach` hook, ensuring zero external environment dependency.
4. **CI/CD Pipeline Setup:** Add a `.github/workflows/e2e.yml` GitHub Actions pipeline that triggers tests on Pull Request, uploads test artifacts/traces, and posts test summary comments.
5. **Localization / Internationalization Testing:** Parameterize Gherkin scenario outlines to test currency symbols (£, $, €) and multilingual date formats.
