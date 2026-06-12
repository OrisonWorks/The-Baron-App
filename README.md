# The Baron ZM

**The Baron ZM** is a full-stack e-commerce application designed with a decoupled architecture, consisting of a dedicated NestJS backend and a React frontend.

---

## 🛠️ Technology Stack

### Backend (`backend-app`)
- **Framework**: [NestJS](https://nestjs.com/) (Node.js framework)
- **Language**: TypeScript
- **Database**: **SQLite** (located at `backend-app/data/thebaronzm.sqlite`)
- **ORM**: **TypeORM** for database interactions
- **Key Features**:
  - `ProductsModule`: Catalog management and retrieval.
  - `OrdersModule`: Order processing and transaction management.
  - Global Validation Pipes and CORS enabled.

### Frontend (`frontend/frontend-app`)
- **Framework**: **React**
- **Language**: JavaScript
- **State Management**: **React Context** (`CartContext`, `ToastContext`)
- **Routing**: `react-router-dom`
- **Key Components**:
  - `ProductList` & `ProductDetail`: Product discovery.
  - `Cart` & `Checkout`: Purchase flow.
  - `AdminOrders`: Admin dashboard for order fulfillment.

---

## 📂 Project Structure

```text
TheBaronZM/
├── backend-app/          # NestJS application (Backend)
│   ├── src/              # Source code
│   ├── data/             # SQLite database storage
│   └── test/             # Backend tests
├── frontend/
│   └── frontend-app/     # React application (Frontend)
│       ├── src/          # Source code
│       └── public/       # Static assets
└── backend/              # Placeholder directory
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Docker & Docker Compose (optional, for containerized execution)

### 🐳 Running with Docker (Recommended)

The easiest way to run the entire system is using Docker Compose:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Database**: SQLite data is persisted in a Docker volume `backend-data`.

### 💻 Local Development

#### 1. Clone the repository
#### 2. Install Backend dependencies
   ```bash
   cd backend-app
   npm install
   ```
#### 3. Install Frontend dependencies
   ```bash
   cd frontend/frontend-app
   npm install
   ```

### Running the Application Locally

For the best experience, run both the backend and frontend simultaneously.

#### Start the Backend
```bash
cd backend-app
npm run start:dev
```
The server will start on `http://localhost:4000`.

#### Start the Frontend
```bash
cd frontend/frontend-app
npm start
```
The application will be available at `http://localhost:3000`.

---

## 💡 Key Functionalities

1. **Product Browsing**: Dynamic catalog fetched from the backend.
2. **Shopping Cart**: Persistent cart management using React Context.
3. **Checkout System**: Streamlined process to capture customer details and place orders.
4. **Admin Dashboard**: View and manage all orders placed through the system.
5. **Real-time Notifications**: Toast notifications for user actions (e.g., adding to cart).

---

## 📝 API Endpoints

- `GET /products`: Retrieve all products.
- `GET /products/:id`: Get specific product details.
- `POST /orders`: Submit a new customer order.
- `GET /orders`: Fetch all orders (Admin only).

---

## 🛠️ CI/CD and DevOps

This project includes:
- **Docker Support**: Multi-stage Dockerfiles for optimized production builds.
- **Docker Compose**: Orchestration for easy local development and deployment.
- **GitHub Actions**: Automated CI pipeline that runs tests and builds Docker images on every push to `main` or `master`.
