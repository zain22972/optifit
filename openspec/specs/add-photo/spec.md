# add-photo Specification

## Purpose
TBD - created by archiving change add-photo. Update Purpose after archive.
## Requirements
### Requirement: Camera Capture Interface
The system SHALL provide a frontend user interface to access the device's camera, stream a live video feed, capture a still photo, and preview the captured image.

#### Scenario: Grant camera permission and capture photo
- **WHEN** user clicks "Scan Clothing with Camera"
- **THEN** system requests camera permission and displays live feed upon authorization
- **WHEN** user clicks "Capture"
- **THEN** system freezes the frame to show a preview and shows "Recapture" and "Analyze Photo" options

#### Scenario: Recapture photo
- **WHEN** user clicks "Recapture" from preview state
- **THEN** system resumes the live video feed and discards the previously captured image

### Requirement: Gemini-Powered Wardrobe Recognition
The system SHALL send the captured image to a backend endpoint `POST /wardrobe/analyze-photo`. The backend SHALL send the image to the Google Gemini API (using a configured Gemini API key) and request details: color, category, style, and season, returning them as a structured JSON object.

#### Scenario: Successful Gemini recognition
- **WHEN** user clicks "Analyze Photo" with valid Gemini API Key configured
- **THEN** backend sends request to Gemini API, extracts metadata, and returns `200` with category, style, season, and primary color
- **THEN** frontend populates the review form with these detected attributes

#### Scenario: Missing or Invalid API Key
- **WHEN** user requests analysis but the Gemini API Key is missing or invalid
- **THEN** backend returns a `400` or `401` error response
- **THEN** frontend displays a clear error message instructing the user to configure their Gemini API Key

### Requirement: Review and Save Wardrobe Item
The frontend SHALL present a form populated with the Gemini-recognized attributes, allowing the user to inspect, modify, and save the item to their virtual wardrobe database.

#### Scenario: Modify and save item
- **WHEN** user changes any recognized attribute (e.g., Category from 'Shirt' to 'Jacket') and clicks "Save to Wardrobe"
- **THEN** system submits the item to the database, shows a success notification, and resets the interface

