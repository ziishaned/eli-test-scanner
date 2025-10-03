# ELI Test Scanner

A mobile application for scanning and processing ELI test strips with QR code detection and image analysis.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Yarn** (package manager)
- **Docker** and **Docker Compose**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Project Structure

```
eli-test-scanner/
├── backend/                 # API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── tests/               # Backend tests
│   └── schema.sql           # Database schema
├── mobile/                  # React Native/Expo app
│   ├── app/                 # App screens
│   ├── src/                 # Source code
│   └── assets/              # Static assets
├── uploads/                 # Uploaded images storage
└── docker-compose.yml       # Docker configuration
```

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone git@github.com:ziishaned/eli-test-scanner.git --depth 1
cd eli-test-scanner
yarn install
```

### 2. Start with Docker (Recommended)

This will start both the database and backend API:

```bash
docker-compose up -d
```

The backend API will be available at `http://localhost:3000`

### 3. Set Up Database Schema

```bash
# Connect to the PostgreSQL container
docker exec -it eli-test-scanner-postgres-1 psql -U eli_user -d eli_test_strips

# Run the schema (copy and paste the contents of backend/schema.sql)
# Or run it directly:
docker exec -i eli-test-scanner-postgres-1 psql -U eli_user -d eli_test_strips < backend/schema.sql
```

### 4. Start Mobile App

```bash
cd mobile
yarn start
```

Then choose your preferred platform:

- Press `a` for Android
- Press `i` for iOS

## Manual Setup (Without Docker)

### Backend Setup

1. **Install PostgreSQL locally** and create database:

```bash
createdb eli_test_strips
```

2. **Set up environment variables** in `backend/.env`:

```env
cp backend/.env.example backend/.env
```

3. **Install dependencies and start backend**:

```bash
cd backend
yarn install
yarn dev
```

4. **Run database schema**:

```bash
psql eli_test_strips < schema.sql
```

### Mobile App Setup

1. **Install dependencies**:

```bash
cd mobile
yarn install
```

2. **Start the development server**:

```bash
yarn start
```

3. **Run on specific platforms**:

```bash
# Android
yarn android

# iOS
yarn ios
```

## API Endpoints

The backend provides the following endpoints:

- **POST** `/api/test-strips/upload` - Upload and process test strip image
- **GET** `/api/test-strips` - Get all test strip submissions
- **GET** `/api/test-strips/:id` - Get specific test strip submission
- **GET** `/health` - Health check endpoint
- **GET** `/uploads/:filename` - Serve uploaded images

## Testing

### Backend Tests

```bash
cd backend
yarn test
```
