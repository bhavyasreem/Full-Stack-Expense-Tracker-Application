# Expense Tracker Application

A comprehensive, full-stack personal finance and expense tracking solution. It features a Django REST API backend backed by MongoDB Atlas (via PyMongo), and a responsive, high-end dark-themed web frontend using HTML5, CSS3, and JavaScript (ES6) with fetch-based async integrations.

---

## Technical Stack

* **Frontend**: HTML5, CSS3 (Custom Black Theme & Neon Accents), Vanilla JavaScript (ES6), Fetch API
* **Backend**: Django REST Framework, Function-Based Views (REST APIs)
* **Database**: MongoDB Atlas (PyMongo & dnspython)
* **Security & Environment**: python-dotenv (`.env`) for database credentials

---

## Folder Structure

```
ExpenseTracker/
│
├── Backend/
│   ├── .env               # Environment configuration (MongoDB URI)
│   ├── db.py              # PyMongo connection wrapper and ID generator
│   ├── views.py           # Function-based CRUD views (20 APIs)
│   ├── urls.py            # API routing mapping
│   ├── settings.py        # Django application configurations (CORS, apps)
│   ├── wsgi.py / asgi.py  # Production gateway interfaces
│   └── manage.py          # Django administrative CLI
│
└── Frontend/
    ├── index.html         # Homepage (Intro & Welcome hero)
    ├── login.html         # User credentials form
    ├── register.html      # Profile signup form (name, email, city, etc.)
    ├── dashboard.html     # Aggregated balances, transactions, and categories
    ├── income.html        # Revenue transaction ledger (Add, Edit, View, Delete)
    ├── expenses.html      # Expense tracker with categories and limits validation
    ├── categories.html    # Spending limits configuration
    ├── budget.html        # Monthly projection planner (Auto-fill utility)
    ├── style.css          # Central stylesheet (Black theme, animations, layout)
    └── script.js          # Core fetch client and authorization state manager
```

---

## Setup & Running Locally

### 1. Prerequisites
Ensure you have **Python 3.10+** and **pip** installed.

### 2. Backend Setup
1. Open a terminal and navigate to the `ExpenseTracker` directory.
2. Initialize or verify your environment file:
   Create a `.env` file in the root `ExpenseTracker/` with the following variables:
   ```env
   MONGO_URI=......
   SECRET_KEY=django-insecure-expense-tracker-secret-key-123456
   DEBUG=True
   ALLOWED_HOSTS=*
   ```
3. Run Django validation:
   ```bash
   python manage.py check
   ```
4. Start the backend development server:
   ```bash
   python manage.py runserver
   ```
   The backend APIs will now be live on `http://127.0.0.1:8000/`.

### 3. Frontend Setup
1. Simply double-click `ExpenseTracker/Frontend/index.html` to open it in any web browser, or serve it using any simple local server (e.g. Live Server in VS Code, or python HTTP server: `python -m http.server`).
2. Make sure your browser has access to `http://127.0.0.1:8000/` (CORS headers are fully enabled on the backend).

---

## Database Schemas

### 1. User Schema (`users`)
* `user_id` (Number, Unique)
* `full_name` (String)
* `email` (String, Unique)
* `phone` (String)
* `password` (String)
* `city` (String)

### 2. Income Schema (`income`)
* `income_id` (Number, Unique)
* `user_name` (String, links to user name)
* `source` (String)
* `amount` (Number)
* `received_date` (Date string)
* `description` (String)

### 3. Expense Schema (`expenses`)
* `expense_id` (Number, Unique)
* `user_name` (String)
* `category` (String)
* `amount` (Number)
* `expense_date` (Date string)
* `payment_method` (String: Cash, UPI, Debit Card, Credit Card, Net Banking)
* `description` (String)

### 4. Category Schema (`categories`)
* `category_id` (Number, Unique)
* `category_name` (String, Unique)
* `monthly_limit` (Number)
* `description` (String)

### 5. Budget Schema (`budgets`)
* `budget_id` (Number, Unique)
* `user_name` (String)
* `month` (String)
* `total_income` (Number)
* `total_expense` (Number)
* `savings` (Number)
* `budget_status` (String: Under Budget, Over Budget)

---

## API Endpoints (20 Total APIs)

### 1. User Management (4 APIs)
* **POST** `/users/add/` : Registers a new profile.
* **GET** `/users/` : Fetches all registered users.
* **PUT** `/users/update/<id>/` : Modifies profile details for given `user_id`.
* **DELETE** `/users/delete/<id>/` : Deletes user by `user_id`.

### 2. Income Management (4 APIs)
* **POST** `/income/add/` : Add revenue entry.
* **GET** `/income/` : List all income (supports filtering via `?user_name=`).
* **PUT** `/income/update/<id>/` : Update record for given `income_id`.
* **DELETE** `/income/delete/<id>/` : Remove record by `income_id`.

### 3. Expense Management (4 APIs)
* **POST** `/expenses/add/` : Record new spending.
* **GET** `/expenses/` : List expenses (supports `?user_name=` and `?category=` filter).
* **PUT** `/expenses/update/<id>/` : Modify expense details for `expense_id`.
* **DELETE** `/expenses/delete/<id>/` : Delete entry by `expense_id`.

### 4. Category Management (4 APIs)
* **POST** `/categories/add/` : Add custom budget category.
* **GET** `/categories/` : Fetch all category limits.
* **PUT** `/categories/update/<id>/` : Modify limits/details by `category_id`.
* **DELETE** `/categories/delete/<id>/` : Delete by `category_id`.

### 5. Budget Management (4 APIs)
* **POST** `/budgets/add/` : Store monthly budget card projections.
* **GET** `/budgets/` : List budgets (supports `?user_name=`).
* **PUT** `/budgets/update/<id>/` : Modify budget row by `budget_id`.
* **DELETE** `/budgets/delete/<id>/` : Delete budget record by `budget_id`.

---

## Sample Testing Credentials

You can use the following seeded credential records to verify implementation immediately:

* **Email**: `rahul@gmail.com`
* **Password**: `rahul123`
* **Seeded Profile Name**: `Rahul Sharma` (Hyderabad)
* **Seeded Income**: Salary (₹60,000) on 2026-07-01
* **Seeded Expense**: Food (₹450) on 2026-07-05
* **Seeded Category**: Food (Limit: ₹8,000)
* **Seeded Budget**: July 2026 (Income: ₹60,000 | Expense: ₹35,000 | Savings: ₹25,000 | Status: Under Budget)
