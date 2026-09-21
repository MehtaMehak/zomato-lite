# Zomato Lite

A simple restaurant review web app: browse restaurants, read reviews, and rate your meal.

**Stack:** Express + SQLite (Node built-in `node:sqlite`) backend, Vite + React frontend.

## Requirements

- Node.js 22.5+ (Node 24 LTS recommended — `node:sqlite` is stable there)

## Setup

```bash
npm install        # installs all workspaces (server + client)
npm run seed       # seeds the database with sample restaurants & reviews
npm run dev        # starts API (port 3001) + Vite dev server (port 5173)
```

Open http://localhost:5173

## Scripts

| Script            | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Run API + frontend together            |
| `npm run dev:server` | API only (with auto-restart)        |
| `npm run dev:client` | Frontend only                       |
| `npm run seed`    | Reset/seed the SQLite database         |
| `npm start`       | Run the API in production mode         |

## API

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| GET    | `/api/restaurants`              | List restaurants w/ averages |
| GET    | `/api/restaurants/:id`          | Restaurant + its reviews     |
| POST   | `/api/restaurants`              | Create a restaurant          |
| POST   | `/api/restaurants/:id/reviews`  | Add a review (1–5 stars)     |

## Structure

```
server/          Express API + SQLite (data/zomato.db created at runtime)
client/          Vite + React frontend
```

Frontend dev server proxies `/api` requests to the Express API on port 3001.