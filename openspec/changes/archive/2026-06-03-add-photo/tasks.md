## 1. Backend API Endpoint

- [x] 1.1 Support `GEMINI_API_KEY` configuration retrieval via env var or `.env` in `backend/app.py`
- [x] 1.2 Implement route `POST /wardrobe/analyze-photo` in the wardrobe API blueprint
- [x] 1.3 Add code to parse uploaded multipart/form-data image files and convert them to base64
- [x] 1.4 Implement API requests to `gemini-2.5-flash` with structured prompt to extract wardrobe details in JSON format conforming to schema constraints
- [x] 1.5 Handle errors (e.g., missing API key, network error, invalid API key) and return appropriate HTTP error statuses


## 2. Frontend User Interface

- [x] 2.1 Create React component `CameraScanner` supporting camera activation, streaming, capture, preview, and recapture
- [x] 2.2 Add fallback file upload input in the UI to support scanning from saved files/photos
- [x] 2.3 Add API helper function to post the captured base64 image or file to `/wardrobe/analyze-photo`
- [x] 2.4 Integrate `CameraScanner` and review form into the Wardrobe Manager UI page
- [x] 2.5 Ensure identified attributes (category, subcategory, color, style, season) populate the add-item form and are fully editable before submitting to the backend


## 3. Integration Testing and Verification

- [x] 3.1 Test the `POST /wardrobe/analyze-photo` route with mock/actual requests to ensure correct classification
- [x] 3.2 Verify camera access and photo upload functionality in the UI

