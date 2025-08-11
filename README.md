# Messenger

## Table of contents

- [Introduction](#introduction)
- [About](#about)
- [Technologies used](#technologies-used)
- [Downloading](#downloading)
- [Prerequisites for assembly and launch](#prerequisites-for-assembly-and-launch)
- [Building](#building)
- [Launch of the project](#launch-of-the-project)
  - [Prerequisites for launch](#prerequisites-for-launch)
  - [Instructions](#instructions)

## Introduction

Since this is a server application, it is not intended for direct use. You can try using it through the client application located at this [address](https://messenger-client.pages.dev). If you want to interact with the server directly, it is located at this [address](https://messenger-server-1apa.onrender.com).

## About

A very primitive messenger with very limited functionality. Create chats, send messages, thereby transmitting your thoughts to others, wherever you are.

Implemented functions:

- registration
- login
- search for a user by nickname or email address
- editing by a user of some information related to his account
- 2 types of chats:
  - personal (for 2 people only)
  - group (for several people)
- creating chats
- deleting chats
- adding members to a group chat
- text messages only
- sending messages
- editing messages
- deleting messages
- forwarding messages

This repository is part of the Messenger project. It contains the server application. The source code for the corresponding client application can be found in this [repository](https://github.com/C0o1Pr0g3r/messenger-client).

## Technologies used

The project uses the following technologies:

- [Node.js](https://nodejs.org/en/) — JavaScript runtime environment
- [NestJS](https://nestjs.com/) — framework for creating server applications
- [PostgreSQL](https://www.postgresql.org/) — relational database management system
- [TypeORM](https://typeorm.io/) — ORM for working with database
- [Vercel Blob](https://vercel.com/docs/vercel-blob) — file storage service
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) — password hashing library
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) — library for working with JSON web tokens
- [zod](https://zod.dev/) — library for schema-based data validation
- [ws](https://github.com/websockets/ws) — WebSocket client and server implementation

## Downloading

To download the project, run the following commands:

```sh
git clone https://github.com/C0o1Pr0g3r/messenger-server.git
```

## Prerequisites for assembly and launch

To build and run the project, the following programs must be installed on your computer:

- [Node.js](https://nodejs.org/en/) — JavaScript runtime environment
- [npm](https://docs.npmjs.com/) — program for managing dependencies of [Node.js](https://nodejs.org/en/) projects

You also need to have a local or remote PostgreSQL database.

Note: the commands to build and run the project must be executed from the project root directory.

## Building

To build the project, you need to go to its root directory. To do this, run the following commands:

```sh
npm install
npm run build
```

## Launch of the project

### Prerequisites for launch

Before running the project, you need to provide the required environment variables and migrate the database.

Create an environment variables file by doing one of the following, depending on your operating system.

On Linux, run the following command:

```sh
cp .env.example .env
```

On another operating system, make a copy of the `.env.example` file named `.env`.

Note: most of the variables in the .env file are already set up for running the project locally. You will most likely need to change the database related variables, and in any case you will need to populate the Vercel Blob related variable.

To get variables related to the database, you can install PostgreSQL DBMS locally or via Docker and create a database in it. The second option is to create a database at a provider (for example, Vercel) and get remote access to it.

To get variables related to [Vercel](https://vercel.com/), you need to register with it and create a Blob storage on it.

After filling in the database related variables, run the database migration using the following command:

```sh
npm run typeorm:migration:run
```

### Instructions

There are 2 ways to run a project:

- run an already built project
- build and run a project at the same time

To run an already built project, you obviously need to build it first ([see above for how to do this](#building)). After that, run the following commands:

```sh
npm run start:prod
```

To build and run the project at the same time, run the following commands:

```sh
npm install
npm run start
```
