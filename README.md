# 🧠 Identity Reconciliation Service

A simple Node.js + TypeScript microservice for identity reconciliation, built using Express and PostgreSQL, and deployed on Render.

## 🚀 Live Demo

👉 [https://identity-reconciliation-yni9.onrender.com/identify](https://identity-reconciliation-yni9.onrender.com/identify)

This endpoint accepts a `POST` request with structured input and returns the reconciled identity output. Refer to the **Usage** section for request/response format.

---

## 📦 Tech Stack

- **Node.js**
- **Express.js**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **Docker**

---

## ⚙️ Environment Setup

To run the project locally, set the following environment variables:

```env
PORT=3000
DATABASE_URL=your_postgres_database_url
```

A sample `.env-example` file is provided.

---

## 🐳 Run with Docker

You can run the app in a container using the provided `Dockerfile`.

### Build the image

```bash
docker build -t identity-reconciliation .
```

### Run the container

```bash
docker run -p 3000:3000 --env-file .env identity-reconciliation
```

---

## 💻 Run Locally (Without Docker)

### 1. Install dependencies

```bash
npm install
```

### 2. Generate Prisma client and push schema

Make sure your Postgres DB is running and `DATABASE_URL` is set in `.env`.

```bash
npx prisma generate
npx prisma db push
```

### 3. Run the dev server

```bash
npm run dev
```

Or to run the compiled production build:

```bash
npm run build
npm start
```

---

## 📨 API Usage

### Endpoint

```
POST /identify
```

### Request Example

```json
{
  "contacts": [
    {
      "email": "john@example.com",
      "phoneNumber": "123456"
    }
  ]
}
```

### Response Example

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["john@example.com"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": []
  }
}
```

---

## 🧪 Testing

Test files are located in the `src/tests/` directory. To run tests:

```bash
npm run test
```

> Note: Dev dependencies like Jest are not installed in the production Docker image.

---

## 📂 Project Structure

```
src/
├── config/            # Prisma client
├── controllers/       # Request handlers
├── routes/            # Express routes
├── services/          # Business logic
├── middleware/        # Error handling
├── tests/             # Unit tests
└── index.ts           # Entry point
```

---

## 📄 License

MIT

---

## 🙋‍♂️ Author

**Vipul H.**  
_Reach out for collaborations or feedback!_
