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
- React 19
- TanStack Start (Vite) + TanStack Router
- Axios
- SockJS + STOMP

## API Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT
- `POST /api/join` - Join the ride-matching queue for a pickup hub + destination
- `GET /api/my-rides` - List the logged-in user's rides
- `PATCH /api/rides/{id}/cancel` - Cancel a waiting ride
- `GET /api/groups/{groupId}` - Load a matched group's details
- `PATCH /api/rides/{groupId}/start` - Start a matched ride
- `PATCH /api/rides/{groupId}/end` - End a ride
- `PATCH /api/rides/{groupId}/cancel-group` - Leave a matched group
- `GET /api/chat/{groupId}` - Load a group's chat history
- WebSocket: `/ws` - Real-time match updates, group chat, live location, and group lifecycle events

## Development Notes

- Backend runs on port 8080
- Frontend dev server runs on port 5173
- WebSocket endpoint: `ws://localhost:8080/ws`
