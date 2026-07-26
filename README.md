# One23 - Quick Split Ride Matching Platform

A full-stack application for matching ride requests using a Spring Boot backend and React/Vite frontend.

## Project Structure

```
one23/
├── backend/          # Spring Boot REST API and WebSocket server
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
├── frontend/         # React + Vite web application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Java 21
- Node.js and npm

### Running the Backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend API will be available at `http://localhost:8080`

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Build Commands

### Backend Build

```bash
cd backend
./mvnw clean package
```

### Frontend Build

```bash
cd frontend
npm run build
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```
ONE23_DATABASE_URL=jdbc:postgresql://localhost:5432/one23
ONE23_DATABASE_USERNAME=your_username
ONE23_DATABASE_PASSWORD=your_password
```

## Features

- User registration and authentication
- Ride request creation and matching
- Real-time WebSocket communication
- Ride matching algorithm
- Request cleanup and scheduling

## Technology Stack

### Backend
- Spring Boot 4.0.5
- Spring Data JPA
- Spring WebSocket
- PostgreSQL

### Frontend
- React 18
- Vite
- React Router
- Axios
- Socket.js + STOMP

## API Endpoints

- `POST /api/rides` - Create a new ride request
- `GET /api/rides` - Get all ride requests
- WebSocket: `/ws` - Real-time ride matching updates

## Development Notes

- Backend runs on port 8080
- Frontend dev server runs on port 5173
- WebSocket endpoint: `ws://localhost:8080/ws`
