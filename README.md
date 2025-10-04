# ELI test scanner

A monorepo containing backend API and mobile application for scanning and processing ELI test strips with QR code detection and image analysis.

## Demo

### Mobile

<img src="https://media.giphy.com/media/Z1yHiMUUn06SB2joeb/giphy.gif" />

### Backend

<img src="https://imgur.com/PsZVx3J.png">

## Screenshots

| Empty                                                                   | History                                                                 | Camera                                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <img src="https://i.imgur.com/bsVuc6N.jpeg" width="260" height="540" /> | <img src="https://i.imgur.com/y1D0yoj.jpeg" width="260" height="540" /> | <img src="https://i.imgur.com/41SuSZQ.jpeg" width="260" height="540" /> |

| Preview                                                                 | Details                                                                 | No internet connection                                                  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| <img src="https://i.imgur.com/SFaTHKd.jpeg" width="260" height="540" /> | <img src="https://i.imgur.com/R4srIpy.jpeg" width="260" height="540" /> | <img src="https://i.imgur.com/k3VHaPG.jpeg" width="260" height="540" /> |

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Yarn** (package manager)
- **Docker** and **Docker Compose**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## Project structure

| Backend                                                              | Mobile                                                               |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <img src="https://imgur.com/wzLYmG3.png" width="392" height="757" /> | <img src="https://imgur.com/dAbPEbO.png" width="392" height="757" /> |

## Quick Start

### 1. Clone and install dependencies

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

### 3. Set up database schema

```bash
# Connect to the PostgreSQL container
docker exec -it eli-test-scanner-postgres-1 psql -U eli_user -d eli_test_strips

# Run the schema
docker exec -i eli-test-scanner-postgres-1 psql -U eli_user -d eli_test_strips < backend/schema.sql
```

### 4. Start mobile app

```bash
cd mobile
yarn start
```

Then choose your preferred platform:

- Press `a` for Android
- Press `i` for iOS

### 5. Using ngrok for mobile development (optional)

If you want to test the mobile app with the backend API on a physical device or need to access the backend from outside your local network, you can use ngrok to expose your local backend:

```bash
npm install -g ngrok
ngrok http 3000
```

Then update your mobile app's API endpoint to use the ngrok URL (e.g., `https://abc123.ngrok.io/api`).

## Manual setup (without Docker)

### Backend setup

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

### Mobile app setup

1. **Install dependencies**:

```bash
cd mobile
yarn install
```

2. **Set up environment variables** in `mobile/.env`:

```env
cp mobile/.env.example mobile/.env
```

3. **Start the development server**:

```bash
yarn start
```

4. **Run on specific platforms**:

```bash
# Android
yarn android

# iOS
yarn ios
```

## API endpoints

The backend provides the following endpoints:

- **POST** `/api/test-strips/upload` - Upload and process test strip image
- **GET** `/api/test-strips` - Get all test strip submissions
- **GET** `/api/test-strips/:id` - Get specific test strip submission
- **GET** `/health` - Health check endpoint
- **GET** `/uploads/:filename` - Serve uploaded images

### Testing with Postman

A Postman collection is included in the repository (`postman_collection.json`) with pre-configured API requests.

To import the collection:

1. Open Postman
2. Click **Import** button
3. Select **File** tab
4. Choose `postman_collection.json` from the project root
5. Click **Import**

Make sure to set up environment variables in Postman:

- `url`: Your backend URL (e.g., `http://localhost:3000/api` for local development)

## Backend tests

```bash
cd backend
yarn test
```
