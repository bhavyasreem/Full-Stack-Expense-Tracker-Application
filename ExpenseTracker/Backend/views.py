from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .db import (
    users_col, income_col, expenses_col, categories_col, budgets_col, get_next_id
)

# Helper to convert to number safely
def to_num(val, default=0):
    if val is None or val == "":
        return default
    try:
        return float(val) if '.' in str(val) else int(val)
    except (ValueError, TypeError):
        return default

# ----------------- MODULE 1: USER MANAGEMENT -----------------

@api_view(['POST'])
def add_user(request):
    data = request.data
    full_name = data.get('full_name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    city = data.get('city')
    
    if not (full_name and email and password):
        return Response({"error": "full_name, email, and password are required"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if users_col.find_one({"email": email}):
        return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
    user_id = data.get('user_id')
    if user_id is None:
        user_id = get_next_id(users_col, 'user_id', start_val=100)
    else:
        user_id = to_num(user_id, None)
        if user_id is None:
            return Response({"error": "user_id must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        if users_col.find_one({"user_id": user_id}):
            return Response({"error": f"User ID {user_id} already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
    user_doc = {
        "user_id": user_id,
        "full_name": full_name,
        "email": email,
        "phone": phone or "",
        "password": password,
        "city": city or ""
    }
    users_col.insert_one(user_doc)
    return Response({"message": "User added successfully", "user": {"user_id": user_id, "full_name": full_name, "email": email}}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_users(request):
    users = list(users_col.find({}, {"_id": 0}))
    return Response(users, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_user(request, user_id):
    if not users_col.find_one({"user_id": int(user_id)}):
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    update_fields = {}
    if 'full_name' in data: update_fields['full_name'] = data['full_name']
    if 'email' in data: update_fields['email'] = data['email']
    if 'phone' in data: update_fields['phone'] = data['phone']
    if 'password' in data: update_fields['password'] = data['password']
    if 'city' in data: update_fields['city'] = data['city']
    
    if not update_fields:
        return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)
        
    users_col.update_one({"user_id": int(user_id)}, {"$set": update_fields})
    return Response({"message": "User updated successfully"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_user(request, user_id):
    res = users_col.delete_one({"user_id": int(user_id)})
    if res.deleted_count == 0:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"message": "User deleted successfully"}, status=status.HTTP_200_OK)


# ----------------- MODULE 2: INCOME MANAGEMENT -----------------

@api_view(['POST'])
def add_income(request):
    data = request.data
    user_name = data.get('user_name')
    source = data.get('source')
    amount = to_num(data.get('amount'))
    received_date = data.get('received_date')
    description = data.get('description', '')
    
    if not (user_name and source and amount and received_date):
        return Response({"error": "user_name, source, amount, and received_date are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    income_id = data.get('income_id')
    if income_id is None:
        income_id = get_next_id(income_col, 'income_id', start_val=200)
    else:
        income_id = to_num(income_id, None)
        if income_id is None:
            return Response({"error": "income_id must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        if income_col.find_one({"income_id": income_id}):
            return Response({"error": f"Income ID {income_id} already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
    income_doc = {
        "income_id": income_id,
        "user_name": user_name,
        "source": source,
        "amount": amount,
        "received_date": received_date,
        "description": description
    }
    income_col.insert_one(income_doc)
    return Response({"message": "Income added successfully", "income_id": income_id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_income(request):
    user_name = request.query_params.get('user_name')
    query = {}
    if user_name:
        query["user_name"] = user_name
        
    incomes = list(income_col.find(query, {"_id": 0}))
    return Response(incomes, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_income(request, income_id):
    if not income_col.find_one({"income_id": int(income_id)}):
        return Response({"error": "Income record not found"}, status=status.HTTP_404_NOT_FOUND)
        
    data = request.data
    update_fields = {}
    if 'user_name' in data: update_fields['user_name'] = data['user_name']
    if 'source' in data: update_fields['source'] = data['source']
    if 'amount' in data: update_fields['amount'] = to_num(data['amount'])
    if 'received_date' in data: update_fields['received_date'] = data['received_date']
    if 'description' in data: update_fields['description'] = data['description']
    
    if not update_fields:
        return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)
        
    income_col.update_one({"income_id": int(income_id)}, {"$set": update_fields})
    return Response({"message": "Income updated successfully"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_income(request, income_id):
    res = income_col.delete_one({"income_id": int(income_id)})
    if res.deleted_count == 0:
        return Response({"error": "Income record not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"message": "Income deleted successfully"}, status=status.HTTP_200_OK)


# ----------------- MODULE 3: EXPENSE MANAGEMENT -----------------

@api_view(['POST'])
def add_expense(request):
    data = request.data
    user_name = data.get('user_name')
    category = data.get('category')
    amount = to_num(data.get('amount'))
    expense_date = data.get('expense_date')
    payment_method = data.get('payment_method')
    description = data.get('description', '')
    
    if not (user_name and category and amount and expense_date and payment_method):
        return Response({"error": "user_name, category, amount, expense_date, and payment_method are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    expense_id = data.get('expense_id')
    if expense_id is None:
        expense_id = get_next_id(expenses_col, 'expense_id', start_val=300)
    else:
        expense_id = to_num(expense_id, None)
        if expense_id is None:
            return Response({"error": "expense_id must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        if expenses_col.find_one({"expense_id": expense_id}):
            return Response({"error": f"Expense ID {expense_id} already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
    expense_doc = {
        "expense_id": expense_id,
        "user_name": user_name,
        "category": category,
        "amount": amount,
        "expense_date": expense_date,
        "payment_method": payment_method,
        "description": description
    }
    expenses_col.insert_one(expense_doc)
    return Response({"message": "Expense added successfully", "expense_id": expense_id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_expenses(request):
    user_name = request.query_params.get('user_name')
    category = request.query_params.get('category')
    
    query = {}
    if user_name:
        query["user_name"] = user_name
    if category:
        query["category"] = category
        
    expenses = list(expenses_col.find(query, {"_id": 0}))
    return Response(expenses, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_expense(request, expense_id):
    if not expenses_col.find_one({"expense_id": int(expense_id)}):
        return Response({"error": "Expense record not found"}, status=status.HTTP_404_NOT_FOUND)
        
    data = request.data
    update_fields = {}
    if 'user_name' in data: update_fields['user_name'] = data['user_name']
    if 'category' in data: update_fields['category'] = data['category']
    if 'amount' in data: update_fields['amount'] = to_num(data['amount'])
    if 'expense_date' in data: update_fields['expense_date'] = data['expense_date']
    if 'payment_method' in data: update_fields['payment_method'] = data['payment_method']
    if 'description' in data: update_fields['description'] = data['description']
    
    if not update_fields:
        return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)
        
    expenses_col.update_one({"expense_id": int(expense_id)}, {"$set": update_fields})
    return Response({"message": "Expense updated successfully"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_expense(request, expense_id):
    res = expenses_col.delete_one({"expense_id": int(expense_id)})
    if res.deleted_count == 0:
        return Response({"error": "Expense record not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"message": "Expense deleted successfully"}, status=status.HTTP_200_OK)


# ----------------- MODULE 4: CATEGORY MANAGEMENT -----------------

@api_view(['POST'])
def add_category(request):
    data = request.data
    category_name = data.get('category_name')
    monthly_limit = to_num(data.get('monthly_limit'))
    description = data.get('description', '')
    
    if not (category_name and monthly_limit):
        return Response({"error": "category_name and monthly_limit are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    category_id = data.get('category_id')
    if category_id is None:
        category_id = get_next_id(categories_col, 'category_id', start_val=400)
    else:
        category_id = to_num(category_id, None)
        if category_id is None:
            return Response({"error": "category_id must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        if categories_col.find_one({"category_id": category_id}):
            return Response({"error": f"Category ID {category_id} already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
    # Check if category name already exists
    if categories_col.find_one({"category_name": category_name}):
        return Response({"error": f"Category '{category_name}' already exists"}, status=status.HTTP_400_BAD_REQUEST)
        
    category_doc = {
        "category_id": category_id,
        "category_name": category_name,
        "monthly_limit": monthly_limit,
        "description": description
    }
    categories_col.insert_one(category_doc)
    return Response({"message": "Category added successfully", "category_id": category_id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_categories(request):
    categories = list(categories_col.find({}, {"_id": 0}))
    return Response(categories, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_category(request, category_id):
    if not categories_col.find_one({"category_id": int(category_id)}):
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
        
    data = request.data
    update_fields = {}
    if 'category_name' in data: update_fields['category_name'] = data['category_name']
    if 'monthly_limit' in data: update_fields['monthly_limit'] = to_num(data['monthly_limit'])
    if 'description' in data: update_fields['description'] = data['description']
    
    if not update_fields:
        return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)
        
    categories_col.update_one({"category_id": int(category_id)}, {"$set": update_fields})
    return Response({"message": "Category updated successfully"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_category(request, category_id):
    res = categories_col.delete_one({"category_id": int(category_id)})
    if res.deleted_count == 0:
        return Response({"error": "Category not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"message": "Category deleted successfully"}, status=status.HTTP_200_OK)


# ----------------- MODULE 5: BUDGET MANAGEMENT -----------------

@api_view(['POST'])
def add_budget(request):
    data = request.data
    user_name = data.get('user_name')
    month = data.get('month')
    total_income = to_num(data.get('total_income'))
    total_expense = to_num(data.get('total_expense'))
    savings = to_num(data.get('savings'))
    budget_status_val = data.get('budget_status')
    
    if not (user_name and month):
        return Response({"error": "user_name and month are required"}, status=status.HTTP_400_BAD_REQUEST)
        
    budget_id = data.get('budget_id')
    if budget_id is None:
        budget_id = get_next_id(budgets_col, 'budget_id', start_val=500)
    else:
        budget_id = to_num(budget_id, None)
        if budget_id is None:
            return Response({"error": "budget_id must be a number"}, status=status.HTTP_400_BAD_REQUEST)
        if budgets_col.find_one({"budget_id": budget_id}):
            return Response({"error": f"Budget ID {budget_id} already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
    # Calculate savings and status dynamically if possible, or use provided
    calculated_savings = total_income - total_expense
    if not budget_status_val:
        budget_status_val = "Under Budget" if total_expense <= total_income else "Over Budget"
        
    budget_doc = {
        "budget_id": budget_id,
        "user_name": user_name,
        "month": month,
        "total_income": total_income,
        "total_expense": total_expense,
        "savings": savings if savings != 0 else calculated_savings,
        "budget_status": budget_status_val
    }
    budgets_col.insert_one(budget_doc)
    return Response({"message": "Budget added successfully", "budget_id": budget_id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_budgets(request):
    user_name = request.query_params.get('user_name')
    query = {}
    if user_name:
        query["user_name"] = user_name
        
    budgets = list(budgets_col.find(query, {"_id": 0}))
    return Response(budgets, status=status.HTTP_200_OK)

@api_view(['PUT'])
def update_budget(request, budget_id):
    if not budgets_col.find_one({"budget_id": int(budget_id)}):
        return Response({"error": "Budget record not found"}, status=status.HTTP_404_NOT_FOUND)
        
    data = request.data
    update_fields = {}
    if 'user_name' in data: update_fields['user_name'] = data['user_name']
    if 'month' in data: update_fields['month'] = data['month']
    if 'total_income' in data: update_fields['total_income'] = to_num(data['total_income'])
    if 'total_expense' in data: update_fields['total_expense'] = to_num(data['total_expense'])
    if 'savings' in data: update_fields['savings'] = to_num(data['savings'])
    if 'budget_status' in data: update_fields['budget_status'] = data['budget_status']
    
    # Recalculate status/savings if not supplied but income/expenses are updated
    if ('total_income' in data or 'total_expense' in data) and 'savings' not in update_fields:
        # fetch existing doc to get values
        existing = budgets_col.find_one({"budget_id": int(budget_id)})
        ti = update_fields.get('total_income', existing.get('total_income', 0))
        te = update_fields.get('total_expense', existing.get('total_expense', 0))
        update_fields['savings'] = ti - te
        if 'budget_status' not in update_fields:
            update_fields['budget_status'] = "Under Budget" if te <= ti else "Over Budget"
            
    if not update_fields:
        return Response({"error": "No fields to update"}, status=status.HTTP_400_BAD_REQUEST)
        
    budgets_col.update_one({"budget_id": int(budget_id)}, {"$set": update_fields})
    return Response({"message": "Budget updated successfully"}, status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_budget(request, budget_id):
    res = budgets_col.delete_one({"budget_id": int(budget_id)})
    if res.deleted_count == 0:
        return Response({"error": "Budget record not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"message": "Budget deleted successfully"}, status=status.HTTP_200_OK)
