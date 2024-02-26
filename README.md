## Description

This project is a chat application built using Nest.js, providing user authentication and chat services. It allows users to create chat rooms, join existing rooms, and engage in real-time conversations.

## Features

- User Authentication: Secure user authentication to manage user accounts and sessions.
- Chat Rooms: Create and join chat rooms for group conversations.
- Real-time Messaging: Instant messaging using WebSocket for real-time communication.
- MongoDB Integration: Utilizes MongoDB as the database for storing user information and chat data.

## Installation

### Clone the repository:

```bash
$ git clone https://github.com/ovaixe/chat-app-backend.git
```

### Install dependencies:

```bash
$ cd chat-app-backend
$ npm install
```

### Set up environment variables:
#### Create a .env file in the root directory and configure the following variables:

```bash
$ MONGO_DB_URL='your mongodb url'
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

#### The application will be accessible at http://localhost:8000.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Authentication

-     POST /api/auth/signup: Register a new user.
-     POST /api/auth/login: Log in an existing user.

### Chat Rooms

-     GET /api/chats/all-chats: Get all chats from database.
-     GET /api/chats/clear-chats: Clear all chats from database.
-     GET /api/chats/all-rooms: Get all chat rooms from database.
-     GET /api/chats/rooms/:roomName: Get a single chat room from database.
-     GET /api/chats/room-host/:roomName: Get room host of a room from database.

## WebSocket

#### WebSocket endpoint for real-time messaging:

-     ws://localhost:8080

#### WebSocket (Socket.IO) Events

-     joinRoom: Join a room or create a new room
-     leaveRoom: Leave a room
-     getRooms: Get a list of existing rooms
-     getRoomHost: Get host user of a room
-     sendMessage: Send a message to a room

## MongoDB Setup

#### Configure MongoDB Connection String:

- Update the MONGO_DB_URL in the .env file with your MongoDB connection string.

## Usage

- Register a new user using the /api/auth/signup endpoint.
- Log in using the /api/auth/login endpoint to obtain an authentication token.
- Use the token for authentication when making requests to create or join chat rooms.
- Utilize WebSocket for real-time messaging within the chat rooms.

## Contributing

If you'd like to contribute to this project, you are welcome.

## Stay in touch

- Author - [Bhat Owais](https://github.com/ovaixe)
- Website - [https://ovaixe.vercel.app](https://ovaixe.vercel.app)
- Twitter - [@ovaixe](https://twitter.com/ovaixe)

## License

This project is [MIT licensed](LICENSE).

## Acknowledgments

- Mention any libraries, frameworks, or tools you used.
- Provide credits to authors or contributors of external code.

Feel free to adapt this template further based on your project's specific needs.
