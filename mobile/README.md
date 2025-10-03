# Test Scanner Mobile App

A React Native app built with Expo for capturing and processing test strip images.

## Features

- **Camera Interface**: Capture test strip photos with guided positioning
- **Image Preview**: Preview captured images before submission
- **History Screen**: View all submitted images with processing status
- **QR Code Detection**: Visual indicators for QR code detection status
- **Offline Support**: User-friendly offline detection
- **Pull-to-Refresh**: Refresh submission history
- **Error Handling**: Comprehensive error messages

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript with strict mode
- **Navigation**: React Navigation (Bottom Tabs)
- **State Management**: Zustand
- **Camera**: Expo Camera
- **Icons**: Expo Vector Icons
- **Network Detection**: React Native NetInfo

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your mobile device (for testing)

### Installation

1. Navigate to the app directory:

   ```bash
   cd mobile/eli-test-scanner-mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Scan the QR code with Expo Go app or run on simulator:
   - iOS Simulator: Press `i`
   - Android Emulator: Press `a`
   - Web: Press `w`

## Project Structure

```
src/
├── components/
│   └── OfflineNotice.tsx     # Offline detection component
├── screens/
│   ├── CameraScreen.tsx      # Main camera interface
│   └── HistoryScreen.tsx     # Submission history
├── store/
│   └── appStore.ts           # Zustand state management
└── types/
    └── index.ts              # TypeScript type definitions
```

## Key Features Implementation

### Camera Screen

- Camera permissions handling
- Real-time camera preview
- Guided positioning with overlay
- Photo capture with quality settings
- Image preview modal before submission
- Camera flip functionality

### History Screen

- List of all submissions with thumbnails
- Status indicators (pending, processed, error)
- QR code detection status display
- Pull-to-refresh functionality
- Empty state handling

### State Management

- Centralized app state with Zustand
- Submission management (add, update)
- Error handling
- Offline status tracking

### Error Handling

- User-friendly error messages
- Network connectivity detection
- Graceful error recovery

## Development Notes

- TypeScript strict mode is enabled for better type safety
- Uses React Navigation for tab-based navigation
- Implements proper camera permissions flow
- Offline-first approach with network detection
- Follows React Native best practices for performance

## Future Backend Integration

The app is structured to easily integrate with a backend API:

- Submission upload functionality ready for API integration
- Error handling prepared for network requests
- State management supports async operations
- QR code processing results from server response

## Testing

Run the app using Expo Go on your device to test:

1. Camera functionality and permissions
2. Image capture and preview
3. Navigation between tabs
4. Offline/online status detection
5. Error handling scenarios

## Build for Production

When ready for production build:

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

Note: Requires EAS CLI and configuration for production builds.
