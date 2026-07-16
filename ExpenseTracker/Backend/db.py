import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env variables from the project root's .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", ".....")

# Connect to MongoDB Atlas
# Using serverSelectionTimeoutMS to fail quickly if connection issues arise
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)

# Database Name (we can name it 'expense_tracker_db' or read from DB)
db = client["expense_tracker_db"]

# Collections mapping
users_col = db["users"]
income_col = db["income"]
expenses_col = db["expenses"]
categories_col = db["categories"]
budgets_col = db["budgets"]

def get_next_id(collection, id_field, start_val=100):
    """
    Scans the collection for the maximum numeric id_field and returns it + 1.
    If the collection is empty, returns start_val + 1.
    """
    last_doc = collection.find_one(sort=[(id_field, -1)])
    if last_doc and id_field in last_doc:
        try:
            return int(last_doc[id_field]) + 1
        except (ValueError, TypeError):
            pass
    return start_val + 1
