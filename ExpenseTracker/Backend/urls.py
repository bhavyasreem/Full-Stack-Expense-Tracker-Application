"""
URL configuration for Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # User Management
    path('users/add/', views.add_user, name='add_user'),
    path('users/', views.get_users, name='get_users'),
    path('users/update/<int:user_id>/', views.update_user, name='update_user'),
    path('users/delete/<int:user_id>/', views.delete_user, name='delete_user'),
    
    # Income Management
    path('income/add/', views.add_income, name='add_income'),
    path('income/', views.get_income, name='get_income'),
    path('income/update/<int:income_id>/', views.update_income, name='update_income'),
    path('income/delete/<int:income_id>/', views.delete_income, name='delete_income'),
    
    # Expense Management
    path('expenses/add/', views.add_expense, name='add_expense'),
    path('expenses/', views.get_expenses, name='get_expenses'),
    path('expenses/update/<int:expense_id>/', views.update_expense, name='update_expense'),
    path('expenses/delete/<int:expense_id>/', views.delete_expense, name='delete_expense'),
    
    # Category Management
    path('categories/add/', views.add_category, name='add_category'),
    path('categories/', views.get_categories, name='get_categories'),
    path('categories/update/<int:category_id>/', views.update_category, name='update_category'),
    path('categories/delete/<int:category_id>/', views.delete_category, name='delete_category'),
    
    # Budget Management
    path('budgets/add/', views.add_budget, name='add_budget'),
    path('budgets/', views.get_budgets, name='get_budgets'),
    path('budgets/update/<int:budget_id>/', views.update_budget, name='update_budget'),
    path('budgets/delete/<int:budget_id>/', views.delete_budget, name='delete_budget'),
]

