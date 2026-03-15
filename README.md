# Smart Expense Tracker

A full-stack application to manage and track your daily expenses with insightful analytics.

## Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2**
- **MongoDB Atlas** (NoSQL Database)
- **Lombok** (Boilerplate reduction)
- **Jakarta Validation**

### Frontend
- **React.js** (JavaScript)
- **TailwindCSS** (Styling)
- **Axios** (API calls)
- **Chart.js** (Data visualization)
- **Lucide React** (Icons)

## Project Structure
```
expense-tracker/
├── backend/            # Spring Boot Application
│   ├── pom.xml
│   └── src/main/java/com/expensetracker/...
└── frontend/           # React Application
    ├── package.json
    └── src/...
```

## Setup Instructions

### 1. Backend Setup
1. Navigate to `backend/` folder.
2. Update `src/main/resources/application.properties` with your **MongoDB Atlas URI**.
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### 2. Frontend Setup
1. Navigate to `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will start on `http://localhost:3000`.

## Features
- **Dashboard**: Quick overview of monthly spending and recent transactions.
- **Add Expense**: Intuitive form to log new expenses with categories and payment methods.
- **Expense History**: Searchable and filterable table of all your past spending.
- **Analytics**: Visual representation of spending patterns using Pie and Bar charts.
- **Responsive Design**: Works seamlessly on mobile and desktop.
