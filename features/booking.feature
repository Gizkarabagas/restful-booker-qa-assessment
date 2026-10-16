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
