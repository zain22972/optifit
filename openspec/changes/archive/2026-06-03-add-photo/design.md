## Context

To make adding clothes to the virtual wardrobe friction-free, we are introducing a camera-based input system that uses the Google Gemini API to analyze images of clothing items and suggest metadata (Category, Subcategory, Color, Style, Season). 

Currently, users have to manually type or select options when adding items. This feature allows capturing an image from the webcam or uploading a photo, sending it to a backend route, parsing the visual characteristics, and displaying the recognized properties for confirmation.

## Goals / Non-Goals

**Goals:**
- Add frontend React components supporting web camera video stream, capture, and image preview.
- Support file upload of different photos as an alternative/fallback to the camera.
- Implement a backend Flask endpoint `POST /wardrobe/analyze-photo` that interfaces with the Google Gemini API (specifically `gemini-2.5-flash`).
- Return a structured JSON response corresponding to the SQLite wardrobe schema values (Category, Subcategory, Color, Style, Season).
- Provide a field in the settings or environment to input the Gemini API Key.

**Non-Goals:**
- Retraining the local machine learning classifiers.
- Real-time video detection (only static captured photos are analyzed).
- Supporting video formats.

## Decisions

### 1. Camera Capture Mechanism
We will use HTML5 media capabilities (`navigator.mediaDevices.getUserMedia`) rendered inside a custom `<video>` tag, with canvas drawing (`canvas.getContext('2d').drawImage`) to capture still frames in React.
* **Why**: Native browser APIs are lightweight, cross-platform (works on mobile/desktop browsers), and require no heavy external npm packages.
* **Alternative**: `react-webcam` npm package. Rejected to minimize package dependency footprint and potential version conflicts.

### 2. Backend Integration with Gemini
We will call the Gemini API using standard Python `requests` to post to the `generateContent` endpoint:
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}`
* **Why**: Direct HTTP requests are reliable, fast, do not require installing the heavy `google-generativeai` package, and work seamlessly inside our existing Flask virtual environment without pip dependency version conflicts.
* **Payload Structure**: The image will be encoded in base64 and passed along with a structured prompt requesting a JSON response containing:
  - `category`: Must be one of `["Tops", "Bottoms", "Footwear", "Accessories"]`
  - `subcategory`: Must be one of `["Shirt", "T-Shirt", "Jeans", "Jacket", "Kurta", "Dress", "Shoes", "Blazer", "Hoodie"]` or fallback
  - `color`: Must be one of `["Black", "White", "Blue", "Green", "Red", "Yellow", "Brown"]` or fallback
  - `style`: Must be one of `["Casual", "Formal", "Party", "Traditional", "Streetwear"]`
  - `season`: Must be one of `["Summer", "Winter", "Rainy"]`

### 3. API Key Management
The `GEMINI_API_KEY` will be read from environment variables or a `.env` file in the `backend/` directory.

## Risks / Trade-offs

- **[Risk]**: User doesn't grant camera permissions.
  - **Mitigation**: Gracefully handle permission rejection, hide camera capture controls, and fallback to manual file upload.
- **[Risk]**: Invalid or missing Gemini API Key.
  - **Mitigation**: Return a clear `400 Bad Request` or `401 Unauthorized` with a message instructing the user to configure `GEMINI_API_KEY` in their environment.
