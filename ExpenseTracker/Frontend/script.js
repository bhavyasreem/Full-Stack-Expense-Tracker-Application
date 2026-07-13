// API Base URL
const API_URL = 'http://127.0.0.1:8000';

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
    initAuthNav();
    
    // Page-specific initialization
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    
    if (page === 'dashboard.html') {
        requireAuth();
        loadDashboard();
    } else if (page === 'income.html') {
        requireAuth();
        loadIncomePage();
    } else if (page === 'expenses.html') {
        requireAuth();
        loadExpensesPage();
    } else if (page === 'categories.html') {
        requireAuth();
        loadCategoriesPage();
    } else if (page === 'budget.html') {
        requireAuth();
        loadBudgetPage();
    } else if (page === 'login.html') {
        initLoginPage();
    } else if (page === 'register.html') {
        initRegisterPage();
    } else if (page === 'index.html' || page === '') {
        initHomePage();
    }
});

// Toast Notification Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button style="background:transparent; border:none; color:#fff; cursor:pointer;" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(toast);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Authentication Helpers
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function requireAuth() {
    if (!isLoggedIn()) {
        showToast('Please login to access this page.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Initialize navigation links dynamically
function initAuthNav() {
    const navLinks = document.getElementById('nav-links');
    const userContainer = document.getElementById('nav-user-container');
    if (!navLinks || !userContainer) return;
    
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        // Logged-in links
        navLinks.innerHTML = `
            <li><a href="index.html" class="${page === 'index.html' || page === '' ? 'active' : ''}">Home</a></li>
            <li><a href="dashboard.html" class="${page === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
            <li><a href="income.html" class="${page === 'income.html' ? 'active' : ''}">Income</a></li>
            <li><a href="expenses.html" class="${page === 'expenses.html' ? 'active' : ''}">Expenses</a></li>
            <li><a href="categories.html" class="${page === 'categories.html' ? 'active' : ''}">Categories</a></li>
            <li><a href="budget.html" class="${page === 'budget.html' ? 'active' : ''}">Budget</a></li>
        `;
        
        userContainer.innerHTML = `
            <span class="user-badge">👤 ${user.full_name}</span>
            <button class="btn btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;" id="logout-btn">Log Out</button>
        `;
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    } else {
        // Logged-out links
        navLinks.innerHTML = `
            <li><a href="index.html" class="${page === 'index.html' || page === '' ? 'active' : ''}">Home</a></li>
            <li><a href="login.html" class="${page === 'login.html' ? 'active' : ''}">Log In</a></li>
            <li><a href="register.html" class="${page === 'register.html' ? 'active' : ''}">Register</a></li>
        `;
        userContainer.innerHTML = '';
    }
}

// ----------------- HOME PAGE -----------------
function initHomePage() {
    const heroActions = document.getElementById('hero-actions');
    if (!heroActions) return;
    
    if (isLoggedIn()) {
        heroActions.innerHTML = `
            <a href="dashboard.html" class="btn btn-primary">Go to Dashboard</a>
        `;
    }
}

// ----------------- LOGIN PAGE -----------------
function initLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const res = await fetch(`${API_URL}/users/`);
            if (!res.ok) throw new Error('Failed to fetch users');
            
            const users = await res.json();
            const foundUser = users.find(u => u.email === email && u.password === password);
            
            if (foundUser) {
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                showToast(`Welcome back, ${foundUser.full_name}!`, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                showToast('Invalid email or password', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Backend connection error', 'danger');
        }
    });
}

// ----------------- REGISTER PAGE -----------------
function initRegisterPage() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const full_name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const city = document.getElementById('reg-city').value;
        const password = document.getElementById('reg-password').value;
        const user_id_val = document.getElementById('reg-userid').value;
        
        const payload = { full_name, email, phone, city, password };
        if (user_id_val) {
            payload.user_id = parseInt(user_id_val);
        }
        
        try {
            const res = await fetch(`${API_URL}/users/add/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();
            if (res.ok) {
                showToast('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                showToast(data.error || 'Registration failed', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Server error while registering', 'danger');
        }
    });
}

// ----------------- DASHBOARD PAGE -----------------
async function loadDashboard() {
    const user = getCurrentUser();
    document.getElementById('dashboard-welcome').innerText = `Welcome, ${user.full_name}. Here is your financial summary from ${user.city}.`;
    
    try {
        // Fetch Income, Expenses, and Categories in parallel
        const [incRes, expRes, catRes] = await Promise.all([
            fetch(`${API_URL}/income/?user_name=${encodeURIComponent(user.full_name)}`),
            fetch(`${API_URL}/expenses/?user_name=${encodeURIComponent(user.full_name)}`),
            fetch(`${API_URL}/categories/`)
        ]);
        
        const incomes = incRes.ok ? await incRes.json() : [];
        const expenses = expRes.ok ? await expRes.json() : [];
        const categories = catRes.ok ? await catRes.json() : [];
        
        // Calculate Totals
        const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
        const totalSavings = totalIncome - totalExpenses;
        
        // Render Stat Cards
        document.getElementById('stat-total-income').innerText = `₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('stat-total-expenses').innerText = `₹${totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        
        const savingsEl = document.getElementById('stat-total-savings');
        savingsEl.innerText = `₹${totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        if (totalSavings < 0) {
            savingsEl.style.color = 'var(--danger)';
        } else {
            savingsEl.style.color = 'var(--success)';
        }
        
        // Render Recent Transactions (merge & sort)
        const recentTxList = document.getElementById('recent-transactions-list');
        const transactions = [
            ...incomes.map(i => ({ date: i.received_date, type: 'Income', label: i.source, amount: i.amount })),
            ...expenses.map(e => ({ date: e.expense_date, type: 'Expense', label: e.category, amount: e.amount }))
        ];
        
        // Sort by Date descending
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const latestTx = transactions.slice(0, 5);
        if (latestTx.length === 0) {
            recentTxList.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No transactions recorded.</td></tr>`;
        } else {
            recentTxList.innerHTML = latestTx.map(tx => `
                <tr>
                    <td>${tx.date}</td>
                    <td><span class="badge ${tx.type === 'Income' ? 'badge-success' : 'badge-danger'}">${tx.type}</span></td>
                    <td>${tx.label}</td>
                    <td style="font-weight: 600; color: ${tx.type === 'Income' ? 'var(--success)' : 'var(--danger)'}">
                        ${tx.type === 'Income' ? '+' : '-'} ₹${tx.amount.toLocaleString('en-IN')}
                    </td>
                </tr>
            `).join('');
        }
        
        // Render Category Progress
        const categoryProgress = document.getElementById('dashboard-category-progress');
        if (categories.length === 0) {
            categoryProgress.innerHTML = `<p style="text-align: center; color: var(--text-muted);">No categories available. Please configure them on the Categories page.</p>`;
        } else {
            categoryProgress.innerHTML = categories.map(cat => {
                // Calculate actual spent in this category
                const spent = expenses
                    .filter(e => e.category.toLowerCase() === cat.category_name.toLowerCase())
                    .reduce((sum, item) => sum + item.amount, 0);
                
                const percent = Math.min((spent / cat.monthly_limit) * 100, 100);
                const isOver = spent > cat.monthly_limit;
                
                return `
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem;">
                            <span style="font-weight: 600;">${cat.category_name}</span>
                            <span style="color: ${isOver ? 'var(--danger)' : 'var(--text-secondary)'}">
                                ₹${spent.toLocaleString('en-IN')} / ₹${cat.monthly_limit.toLocaleString('en-IN')}
                            </span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar ${isOver ? 'danger' : ''}" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
    } catch (err) {
        console.error(err);
        showToast('Error syncing dashboard numbers', 'danger');
    }
}

// ----------------- INCOME PAGE -----------------
let cachedIncomes = [];

async function loadIncomePage() {
    const user = getCurrentUser();
    const listContainer = document.getElementById('income-list');
    const form = document.getElementById('income-form');
    const cancelBtn = document.getElementById('income-cancel-btn');
    
    // Clear and set defaults
    document.getElementById('inc-date').valueAsDate = new Date();
    
    async function refreshIncomes() {
        try {
            const res = await fetch(`${API_URL}/income/?user_name=${encodeURIComponent(user.full_name)}`);
            if (!res.ok) throw new Error('Failed to fetch income logs');
            
            cachedIncomes = await res.json();
            
            if (cachedIncomes.length === 0) {
                listContainer.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No income logs recorded yet.</td></tr>`;
            } else {
                listContainer.innerHTML = cachedIncomes.map(item => `
                    <tr>
                        <td>${item.income_id}</td>
                        <td style="font-weight:600;">${item.source}</td>
                        <td style="color: var(--success); font-weight:600;">₹${item.amount.toLocaleString('en-IN')}</td>
                        <td>${item.received_date}</td>
                        <td style="color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${item.description || '-'}
                        </td>
                        <td>
                            <button class="btn btn-secondary edit-inc-btn" data-id="${item.income_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button>
                            <button class="btn btn-danger del-inc-btn" data-id="${item.income_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
                        </td>
                    </tr>
                `).join('');
                
                // Add event listeners
                document.querySelectorAll('.edit-inc-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => startEditIncome(e.target.dataset.id));
                });
                
                document.querySelectorAll('.del-inc-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteIncome(e.target.dataset.id));
                });
            }
        } catch (err) {
            console.error(err);
            listContainer.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load income records.</td></tr>`;
        }
    }
    
    // Save or Edit Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('income-edit-id').value;
        
        const source = document.getElementById('inc-source').value;
        const amount = parseFloat(document.getElementById('inc-amount').value);
        const received_date = document.getElementById('inc-date').value;
        const description = document.getElementById('inc-description').value;
        const custom_id = document.getElementById('inc-id').value;
        
        const payload = {
            user_name: user.full_name,
            source,
            amount,
            received_date,
            description
        };
        
        try {
            let res;
            if (editId) {
                // Update
                res = await fetch(`${API_URL}/income/update/${editId}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                // Insert
                if (custom_id) {
                    payload.income_id = parseInt(custom_id);
                }
                res = await fetch(`${API_URL}/income/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            
            const data = await res.json();
            if (res.ok) {
                showToast(editId ? 'Income updated successfully!' : 'Income record added!', 'success');
                resetIncomeForm();
                refreshIncomes();
            } else {
                showToast(data.error || 'Failed to submit form', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Server sync error', 'danger');
        }
    });
    
    // Cancel Editing
    cancelBtn.addEventListener('click', resetIncomeForm);
    
    function startEditIncome(id) {
        const item = cachedIncomes.find(i => i.income_id == id);
        if (!item) return;
        
        document.getElementById('income-form-title').innerText = 'Edit Income';
        document.getElementById('income-form-desc').innerText = `Modifying record ID: ${id}`;
        document.getElementById('income-edit-id').value = id;
        document.getElementById('inc-source').value = item.source;
        document.getElementById('inc-amount').value = item.amount;
        document.getElementById('inc-date').value = item.received_date;
        document.getElementById('inc-description').value = item.description || '';
        document.getElementById('inc-id').disabled = true; // cannot change id on edit
        
        document.getElementById('income-btn').innerText = 'Update Income';
        cancelBtn.style.display = 'inline-flex';
    }
    
    function resetIncomeForm() {
        document.getElementById('income-form-title').innerText = 'Add Income';
        document.getElementById('income-form-desc').innerText = 'Record a new source of revenue';
        document.getElementById('income-edit-id').value = '';
        form.reset();
        document.getElementById('inc-date').valueAsDate = new Date();
        document.getElementById('inc-id').disabled = false;
        
        document.getElementById('income-btn').innerText = 'Save Income';
        cancelBtn.style.display = 'none';
    }
    
    async function deleteIncome(id) {
        if (!confirm('Are you sure you want to delete this income record?')) return;
        try {
            const res = await fetch(`${API_URL}/income/delete/${id}/`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Income deleted successfully', 'success');
                refreshIncomes();
            } else {
                showToast('Could not delete income', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error', 'danger');
        }
    }
    
    // Initial Load
    refreshIncomes();
}

// ----------------- EXPENSES PAGE -----------------
let cachedExpenses = [];

async function loadExpensesPage() {
    const user = getCurrentUser();
    const listContainer = document.getElementById('expenses-list');
    const form = document.getElementById('expense-form');
    const cancelBtn = document.getElementById('expense-cancel-btn');
    const categorySelect = document.getElementById('exp-category');
    const filterSelect = document.getElementById('filter-category');
    
    document.getElementById('exp-date').valueAsDate = new Date();
    
    // Fetch categories first to populate options
    async function loadCategoryDropdowns() {
        try {
            const res = await fetch(`${API_URL}/categories/`);
            if (!res.ok) throw new Error();
            const categories = await res.json();
            
            // Rebuild category form options
            categorySelect.innerHTML = `<option value="" disabled selected>Select Category</option>` +
                categories.map(c => `<option value="${c.category_name}">${c.category_name}</option>`).join('');
                
            // Rebuild filter options
            filterSelect.innerHTML = `<option value="">All Categories</option>` +
                categories.map(c => `<option value="${c.category_name}">${c.category_name}</option>`).join('');
        } catch (err) {
            console.error(err);
            showToast('Failed to load categories', 'danger');
        }
    }
    
    // Reload history list
    async function refreshExpenses() {
        const catFilter = filterSelect.value;
        let url = `${API_URL}/expenses/?user_name=${encodeURIComponent(user.full_name)}`;
        if (catFilter) {
            url += `&category=${encodeURIComponent(catFilter)}`;
        }
        
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            
            cachedExpenses = await res.json();
            
            if (cachedExpenses.length === 0) {
                listContainer.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No expenses recorded.</td></tr>`;
            } else {
                listContainer.innerHTML = cachedExpenses.map(item => `
                    <tr>
                        <td>${item.expense_id}</td>
                        <td style="font-weight:600;"><span class="badge badge-success" style="background:rgba(99,102,241,0.15); color:var(--primary); border:1px solid rgba(99,102,241,0.3)">${item.category}</span></td>
                        <td style="color: var(--danger); font-weight:600;">₹${item.amount.toLocaleString('en-IN')}</td>
                        <td>${item.expense_date}</td>
                        <td>${item.payment_method}</td>
                        <td style="color: var(--text-secondary); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${item.description || '-'}
                        </td>
                        <td>
                            <button class="btn btn-secondary edit-exp-btn" data-id="${item.expense_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button>
                            <button class="btn btn-danger del-exp-btn" data-id="${item.expense_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
                        </td>
                    </tr>
                `).join('');
                
                // Add event listeners
                document.querySelectorAll('.edit-exp-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => startEditExpense(e.target.dataset.id));
                });
                
                document.querySelectorAll('.del-exp-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteExpense(e.target.dataset.id));
                });
            }
        } catch (err) {
            console.error(err);
            listContainer.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load expenses history.</td></tr>`;
        }
    }
    
    // Filter listener
    filterSelect.addEventListener('change', refreshExpenses);
    
    // Save/Update Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('expense-edit-id').value;
        const category = categorySelect.value;
        const amount = parseFloat(document.getElementById('exp-amount').value);
        const expense_date = document.getElementById('exp-date').value;
        const payment_method = document.getElementById('exp-payment').value;
        const description = document.getElementById('exp-description').value;
        const custom_id = document.getElementById('exp-id').value;
        
        const payload = {
            user_name: user.full_name,
            category,
            amount,
            expense_date,
            payment_method,
            description
        };
        
        try {
            // Fetch category limits to see if we will overrun
            const catRes = await fetch(`${API_URL}/categories/`);
            if (catRes.ok) {
                const categories = await catRes.json();
                const matchedCat = categories.find(c => c.category_name.toLowerCase() === category.toLowerCase());
                if (matchedCat) {
                    // Calculate current spent + this amount
                    const spentBefore = cachedExpenses
                        .filter(e => e.category.toLowerCase() === category.toLowerCase() && e.expense_id != editId)
                        .reduce((sum, item) => sum + item.amount, 0);
                    
                    if (spentBefore + amount > matchedCat.monthly_limit) {
                        showToast(`Warning: This purchase will exceed your ₹${matchedCat.monthly_limit} monthly limit for '${category}'!`, 'warning');
                    }
                }
            }
            
            let res;
            if (editId) {
                res = await fetch(`${API_URL}/expenses/update/${editId}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                if (custom_id) {
                    payload.expense_id = parseInt(custom_id);
                }
                res = await fetch(`${API_URL}/expenses/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            
            const data = await res.json();
            if (res.ok) {
                showToast(editId ? 'Expense updated successfully!' : 'Expense logged successfully!', 'success');
                resetExpenseForm();
                refreshExpenses();
            } else {
                showToast(data.error || 'Failed to submit expense', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Server sync failed', 'danger');
        }
    });
    
    cancelBtn.addEventListener('click', resetExpenseForm);
    
    function startEditExpense(id) {
        const item = cachedExpenses.find(e => e.expense_id == id);
        if (!item) return;
        
        document.getElementById('expense-form-title').innerText = 'Edit Expense';
        document.getElementById('expense-form-desc').innerText = `Modifying record ID: ${id}`;
        document.getElementById('expense-edit-id').value = id;
        categorySelect.value = item.category;
        document.getElementById('exp-amount').value = item.amount;
        document.getElementById('exp-date').value = item.expense_date;
        document.getElementById('exp-payment').value = item.payment_method;
        document.getElementById('exp-description').value = item.description || '';
        document.getElementById('exp-id').disabled = true;
        
        document.getElementById('expense-btn').innerText = 'Update Expense';
        cancelBtn.style.display = 'inline-flex';
    }
    
    function resetExpenseForm() {
        document.getElementById('expense-form-title').innerText = 'Add Expense';
        document.getElementById('expense-form-desc').innerText = 'Record a new payment transaction';
        document.getElementById('expense-edit-id').value = '';
        form.reset();
        document.getElementById('exp-date').valueAsDate = new Date();
        document.getElementById('exp-id').disabled = false;
        
        document.getElementById('expense-btn').innerText = 'Save Expense';
        cancelBtn.style.display = 'none';
    }
    
    async function deleteExpense(id) {
        if (!confirm('Delete this expense transaction?')) return;
        try {
            const res = await fetch(`${API_URL}/expenses/delete/${id}/`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Expense record deleted', 'success');
                refreshExpenses();
            } else {
                showToast('Could not delete record', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error', 'danger');
        }
    }
    
    // Init loads
    await loadCategoryDropdowns();
    await refreshExpenses();
}

// ----------------- CATEGORIES PAGE -----------------
let cachedCategories = [];

async function loadCategoriesPage() {
    const listContainer = document.getElementById('categories-list');
    const form = document.getElementById('category-form');
    const cancelBtn = document.getElementById('category-cancel-btn');
    
    async function refreshCategories() {
        try {
            const res = await fetch(`${API_URL}/categories/`);
            if (!res.ok) throw new Error();
            
            cachedCategories = await res.json();
            
            if (cachedCategories.length === 0) {
                listContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No categories set up yet. Use the form to configure one.</td></tr>`;
            } else {
                listContainer.innerHTML = cachedCategories.map(cat => `
                    <tr>
                        <td>${cat.category_id}</td>
                        <td style="font-weight:600;"><span class="badge" style="background:rgba(99,102,241,0.15); color:var(--primary); border:1px solid rgba(99,102,241,0.3)">${cat.category_name}</span></td>
                        <td style="color: var(--text-primary); font-weight:600;">₹${cat.monthly_limit.toLocaleString('en-IN')}</td>
                        <td style="color: var(--text-secondary); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${cat.description || '-'}
                        </td>
                        <td>
                            <button class="btn btn-secondary edit-cat-btn" data-id="${cat.category_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button>
                            <button class="btn btn-danger del-cat-btn" data-id="${cat.category_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
                        </td>
                    </tr>
                `).join('');
                
                // Bind actions
                document.querySelectorAll('.edit-cat-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => startEditCategory(e.target.dataset.id));
                });
                
                document.querySelectorAll('.del-cat-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteCategory(e.target.dataset.id));
                });
            }
        } catch (err) {
            console.error(err);
            listContainer.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger);">Failed to load categories.</td></tr>`;
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('category-edit-id').value;
        const category_name = document.getElementById('cat-name').value;
        const monthly_limit = parseFloat(document.getElementById('cat-limit').value);
        const description = document.getElementById('cat-description').value;
        const custom_id = document.getElementById('cat-id').value;
        
        const payload = { category_name, monthly_limit, description };
        
        try {
            let res;
            if (editId) {
                res = await fetch(`${API_URL}/categories/update/${editId}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                if (custom_id) {
                    payload.category_id = parseInt(custom_id);
                }
                res = await fetch(`${API_URL}/categories/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            
            const data = await res.json();
            if (res.ok) {
                showToast(editId ? 'Category limits updated' : 'New category configured!', 'success');
                resetCategoryForm();
                refreshCategories();
            } else {
                showToast(data.error || 'Failed to configure category', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Server sync failed', 'danger');
        }
    });
    
    cancelBtn.addEventListener('click', resetCategoryForm);
    
    function startEditCategory(id) {
        const cat = cachedCategories.find(c => c.category_id == id);
        if (!cat) return;
        
        document.getElementById('category-form-title').innerText = 'Edit Category';
        document.getElementById('category-form-desc').innerText = `Editing limits for ID: ${id}`;
        document.getElementById('category-edit-id').value = id;
        document.getElementById('cat-name').value = cat.category_name;
        document.getElementById('cat-limit').value = cat.monthly_limit;
        document.getElementById('cat-description').value = cat.description || '';
        document.getElementById('cat-id').disabled = true;
        
        document.getElementById('category-btn').innerText = 'Update Category';
        cancelBtn.style.display = 'inline-flex';
    }
    
    function resetCategoryForm() {
        document.getElementById('category-form-title').innerText = 'Add Category';
        document.getElementById('category-form-desc').innerText = 'Create a new container for tagging expenses';
        document.getElementById('category-edit-id').value = '';
        form.reset();
        document.getElementById('cat-id').disabled = false;
        
        document.getElementById('category-btn').innerText = 'Save Category';
        cancelBtn.style.display = 'none';
    }
    
    async function deleteCategory(id) {
        if (!confirm('Deleting this category will un-tag expenses in this category. Continue?')) return;
        try {
            const res = await fetch(`${API_URL}/categories/delete/${id}/`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Category deleted successfully', 'success');
                refreshCategories();
            } else {
                showToast('Could not delete category', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error', 'danger');
        }
    }
    
    refreshCategories();
}

// ----------------- BUDGET PAGE -----------------
let cachedBudgets = [];

async function loadBudgetPage() {
    const user = getCurrentUser();
    const listContainer = document.getElementById('budgets-list');
    const form = document.getElementById('budget-form');
    const cancelBtn = document.getElementById('budget-cancel-btn');
    
    const incomeInput = document.getElementById('bud-income');
    const expenseInput = document.getElementById('bud-expense');
    const savingsInput = document.getElementById('bud-savings');
    const statusSelect = document.getElementById('bud-status');
    const monthSelect = document.getElementById('bud-month');
    
    // Autocalculate savings on form input change
    function updateComputedValues() {
        const inc = parseFloat(incomeInput.value) || 0;
        const exp = parseFloat(expenseInput.value) || 0;
        const savings = inc - exp;
        savingsInput.value = savings;
        
        statusSelect.value = (exp <= inc) ? 'Under Budget' : 'Over Budget';
    }
    
    incomeInput.addEventListener('input', updateComputedValues);
    expenseInput.addEventListener('input', updateComputedValues);
    
    // Auto-fill logic
    document.getElementById('budget-autofill-btn').addEventListener('click', async () => {
        const monthText = monthSelect.value;
        if (!monthText) {
            showToast('Please select a target month first.', 'warning');
            return;
        }
        
        // Month Text pattern: "July 2026"
        // Let's translate this to a query helper
        // Standard Javascript Month names mapping
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const parts = monthText.split(' ');
        const mIndex = monthNames.indexOf(parts[0]);
        const year = parts[1];
        
        if (mIndex === -1 || !year) {
            showToast('Invalid month selected', 'danger');
            return;
        }
        
        const yearMonthStr = `${year}-${String(mIndex + 1).padStart(2, '0')}`; // e.g. "2026-07"
        
        try {
            const [incRes, expRes] = await Promise.all([
                fetch(`${API_URL}/income/?user_name=${encodeURIComponent(user.full_name)}`),
                fetch(`${API_URL}/expenses/?user_name=${encodeURIComponent(user.full_name)}`)
            ]);
            
            const incomes = incRes.ok ? await incRes.json() : [];
            const expenses = expRes.ok ? await expRes.json() : [];
            
            // Filter by selected year-month
            const filteredIncome = incomes.filter(i => i.received_date.startsWith(yearMonthStr));
            const filteredExpense = expenses.filter(e => e.expense_date.startsWith(yearMonthStr));
            
            const totalInc = filteredIncome.reduce((sum, item) => sum + item.amount, 0);
            const totalExp = filteredExpense.reduce((sum, item) => sum + item.amount, 0);
            
            incomeInput.value = totalInc;
            expenseInput.value = totalExp;
            updateComputedValues();
            
            showToast(`Auto-filled values for ${monthText}!`, 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to auto-compute ledger history', 'danger');
        }
    });
    
    async function refreshBudgets() {
        try {
            const res = await fetch(`${API_URL}/budgets/?user_name=${encodeURIComponent(user.full_name)}`);
            if (!res.ok) throw new Error();
            
            cachedBudgets = await res.json();
            
            if (cachedBudgets.length === 0) {
                listContainer.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No budgets stored yet.</td></tr>`;
            } else {
                listContainer.innerHTML = cachedBudgets.map(b => `
                    <tr>
                        <td>${b.budget_id}</td>
                        <td style="font-weight:600;">${b.month}</td>
                        <td>₹${b.total_income.toLocaleString('en-IN')}</td>
                        <td>₹${b.total_expense.toLocaleString('en-IN')}</td>
                        <td style="font-weight:600; color: ${b.savings >= 0 ? 'var(--success)' : 'var(--danger)'}">₹${b.savings.toLocaleString('en-IN')}</td>
                        <td><span class="badge ${b.budget_status === 'Under Budget' ? 'badge-success' : 'badge-danger'}">${b.budget_status}</span></td>
                        <td>
                            <button class="btn btn-secondary edit-bud-btn" data-id="${b.budget_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button>
                            <button class="btn btn-danger del-bud-btn" data-id="${b.budget_id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Delete</button>
                        </td>
                    </tr>
                `).join('');
                
                // Bind actions
                document.querySelectorAll('.edit-bud-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => startEditBudget(e.target.dataset.id));
                });
                
                document.querySelectorAll('.del-bud-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteBudget(e.target.dataset.id));
                });
            }
        } catch (err) {
            console.error(err);
            listContainer.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Failed to load budgets.</td></tr>`;
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = document.getElementById('budget-edit-id').value;
        const month = monthSelect.value;
        const total_income = parseFloat(incomeInput.value);
        const total_expense = parseFloat(expenseInput.value);
        const savings = parseFloat(savingsInput.value);
        const budget_status = statusSelect.value;
        const custom_id = document.getElementById('bud-id').value;
        
        const payload = {
            user_name: user.full_name,
            month,
            total_income,
            total_expense,
            savings,
            budget_status
        };
        
        try {
            let res;
            if (editId) {
                res = await fetch(`${API_URL}/budgets/update/${editId}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                if (custom_id) {
                    payload.budget_id = parseInt(custom_id);
                }
                res = await fetch(`${API_URL}/budgets/add/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }
            
            const data = await res.json();
            if (res.ok) {
                showToast(editId ? 'Budget projection updated!' : 'New budget added!', 'success');
                resetBudgetForm();
                refreshBudgets();
            } else {
                showToast(data.error || 'Failed to submit budget', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Server sync error', 'danger');
        }
    });
    
    cancelBtn.addEventListener('click', resetBudgetForm);
    
    function startEditBudget(id) {
        const b = cachedBudgets.find(item => item.budget_id == id);
        if (!b) return;
        
        document.getElementById('budget-form-title').innerText = 'Edit Budget';
        document.getElementById('budget-form-desc').innerText = `Modifying projection ID: ${id}`;
        document.getElementById('budget-edit-id').value = id;
        monthSelect.value = b.month;
        incomeInput.value = b.total_income;
        expenseInput.value = b.total_expense;
        savingsInput.value = b.savings;
        statusSelect.value = b.budget_status;
        document.getElementById('bud-id').disabled = true;
        
        document.getElementById('budget-btn').innerText = 'Update Budget';
        cancelBtn.style.display = 'inline-flex';
    }
    
    function resetBudgetForm() {
        document.getElementById('budget-form-title').innerText = 'Add/Set Budget';
        document.getElementById('budget-form-desc').innerText = 'Define financial projections for a month';
        document.getElementById('budget-edit-id').value = '';
        form.reset();
        document.getElementById('bud-id').disabled = false;
        
        document.getElementById('budget-btn').innerText = 'Save Budget';
        cancelBtn.style.display = 'none';
    }
    
    async function deleteBudget(id) {
        if (!confirm('Are you sure you want to delete this budget log?')) return;
        try {
            const res = await fetch(`${API_URL}/budgets/delete/${id}/`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Budget details deleted', 'success');
                refreshBudgets();
            } else {
                showToast('Could not delete budget', 'danger');
            }
        } catch (err) {
            console.error(err);
            showToast('Network connection error', 'danger');
        }
    }
    
    refreshBudgets();
}
