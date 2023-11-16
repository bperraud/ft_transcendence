Windows 95 desktop reproduction with additionnal features

TODO : - double notification askgame

## Description

This web application consist of multiple applications available in a windows 95 style desktop.
To name a fiew : Pong, Shell, Chat, Paint

## Images

![readme1](https://github.com/bperraud/ft_transcendence/assets/93911934/ed118971-9734-47e5-8d8f-c8e2f0c986aa)
![readme2](https://github.com/bperraud/ft_transcendence/assets/93911934/694a8d1a-aa01-4b6f-a692-06184da78e4c)

## Installation

Firstly you will need to create a .env in frontend/ that look like this : (use your 42 credentials API keys if you have a 42 intra account)

```yaml
DATABASE_URL="postgresql://postgres:123@localhost:5434/nest?schema=public"
JWT_SECRET=secret
FORTYTWO_CLIENT_ID=secret
FORTYTWO_CLIENT_SECRET=secret
APP_URL=http://localhost:3000
CALLBACK=auth/42login/callback
UPLOAD_PATH=backend/uploads/
FRONTEND_URL=http://localhost:5173
```

.env inside backend/ :

```yaml
PUBLIC_WEBSERV_URL=http://localhost:8080
PUBLIC_BACKEND_URL=http://localhost:3000
```

Then install the necessary packages in both repository

```sh
npm i
```

To start the client (in frontend/)

```sh
npm run dev
```

To start the server (in backend/)
```sh
npm run docker:start
npm run db:dev:restart
prisma migrate dev
prisma migrate deploy
npm run start:dev
```

