## Mobile Application (React Native + TypeScript)

### Core Features:

- Camera interface for capturing test strip photos
- Image preview before submission
- Submit button to send to backend
- History screen showing all submissions (with QR codes - extracted by server)
- Pull-to-refresh on history screen
- Error handling with user-friendly messages
- Visual indicator showing QR code detection status (after server response)

### Technical Implementation:

- TypeScript with strict mode enabled
- Proper state management (Context API, Redux Toolkit, or Zustand)
- Basic offline detection - show user-friendly message when offline
- Display QR code information received from server response
