## Why

Users want a frictionless way to add clothing items to their virtual wardrobe. Manually entering parameters such as color, category, style, and season is tedious and error-prone. By allowing users to take a photo of their clothing using their device's camera and automatically detecting these attributes using Gemini API vision capabilities, we can dramatically improve the onboarding and wardrobe digitization experience.

## What Changes

- **Frontend Camera Integration**: Add a web camera component to capture real-time photos of clothing items.
- **Dynamic Photo Handling**: Support taking and previewing different photos rather than relying on a static image template.
- **Backend Wardrobe Classifier**: Implement a Flask endpoint that accepts an uploaded image, sends it to the Google Gemini API (using a user-provided Gemini API key), and parses the response to extract structured wardrobe details (category, style, season, color).
- **Wardrobe Detail Form**: Allow users to review and edit the detected attributes before saving the item to their wardrobe.

## Capabilities

### New Capabilities
- `add-photo`: Allow users to digitize wardrobe items using device camera input and automated Gemini vision analysis to extract item metadata.

### Modified Capabilities
<!-- No modified capabilities since there are no existing specs -->

## Impact

- **Frontend**: React components for camera integration, image selection, and the digitized item details review form.
- **Backend**: API endpoint `POST /wardrobe/analyze-photo` to handle incoming image uploads, interface with the Gemini API, and return structured JSON metadata.
- **Configuration**: Support for configuring the `GEMINI_API_KEY` (via environment variables or settings).
