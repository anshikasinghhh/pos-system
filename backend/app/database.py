# # from pymongo import MongoClient

# # client = MongoClient("mongodb://localhost:27017/")
# # db = client["smartpos"]

# # users_collection = db["users"]
# from pymongo import MongoClient
# from dotenv import load_dotenv
# import os

# # Load environment variables

# load_dotenv()

# # Get MongoDB Atlas URI

# MONGO_URI = os.getenv("MONGO_URI")
# print("Loaded Mongo URI:", MONGO_URI)

# try:
#     client.admin.command("ping")
#     print("MongoDB Atlas Connected Successfully!")
# except Exception as e:
#     print("MongoDB Connection Error:", e)


# # Connect to MongoDB Atlas

# client = MongoClient(MONGO_URI)

# # Database

# db = client["smartpos"]

# # Collections

# users_collection = db["users"]
# products_collection = db["products"]
# sales_collection = db["sales"]
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables

load_dotenv()

# Read Mongo URI

configured_uri = os.getenv("MONGO_URI")
preferred_uris = []

if configured_uri:
    preferred_uris.append(configured_uri)

preferred_uris.extend([
    "mongodb://localhost:27017",
    "mongodb://127.0.0.1:27017"
])

# Prefer a reachable local MongoDB for development, then fall back to the configured URI.
MONGO_URI = None
last_error = None

for uri in preferred_uris:
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        client.admin.command("ping")
        MONGO_URI = uri
        print("MongoDB Connected Successfully to:", MONGO_URI)
        break
    except Exception as e:
        last_error = e
        continue

if MONGO_URI is None:
    print("MongoDB Connection Error (falling back to in-memory):", last_error)
    client = None
    USING_IN_MEMORY = True
else:
    USING_IN_MEMORY = False
    client = MongoClient(MONGO_URI)

if not USING_IN_MEMORY:
    # Database
    db = client["smartpos"]

    # Collections
    users_collection = db["users"]
    products_collection = db["products"]
    sales_collection = db["sales"]
else:
    # Simple in-memory collection fallback for development
    import uuid
    import copy

    class InMemoryCollection:
        def __init__(self):
            self._data = []

        def _match(self, doc, query):
            if not query:
                return True
            for k, v in query.items():
                if k not in doc or doc[k] != v:
                    return False
            return True

        def find_one(self, query=None, sort=None):
            for doc in self._data:
                if self._match(doc, query or {}):
                    return copy.deepcopy(doc)
            return None

        def find(self, query=None, projection=None):
            results = [copy.deepcopy(d) for d in self._data if self._match(d, query or {})]
            return results

        def insert_one(self, doc):
            new_doc = copy.deepcopy(doc)
            new_doc["_id"] = str(uuid.uuid4())
            self._data.append(new_doc)
            class Result: pass
            res = Result()
            res.inserted_id = new_doc["_id"]
            return res

        def insert_many(self, docs):
            ids = []
            for doc in docs:
                ids.append(self.insert_one(doc).inserted_id)
            class Result: pass
            res = Result()
            res.inserted_ids = ids
            return res

        def delete_many(self, query):
            before = len(self._data)
            self._data = [d for d in self._data if not self._match(d, query or {})]
            class Result: pass
            res = Result()
            res.deleted_count = before - len(self._data)
            return res

        def delete_one(self, query):
            for i, d in enumerate(self._data):
                if self._match(d, query or {}):
                    del self._data[i]
                    class Result: pass
                    res = Result()
                    res.deleted_count = 1
                    return res
            class Result: pass
            res = Result()
            res.deleted_count = 0
            return res

        def update_one(self, query, update, upsert=False):
            for i, d in enumerate(self._data):
                if self._match(d, query or {}):
                    # apply simple $set only
                    if "$set" in update:
                        for k, v in update["$set"].items():
                            d[k] = v
                    self._data[i] = d
                    class Result: pass
                    res = Result()
                    res.modified_count = 1
                    return res
            if upsert:
                to_insert = update.get("$set", {})
                self.insert_one(to_insert)
                class Result: pass
                res = Result()
                res.upserted_id = True
                return res
            class Result: pass
            res = Result()
            res.modified_count = 0
            return res

    users_collection = InMemoryCollection()
    products_collection = InMemoryCollection()
    sales_collection = InMemoryCollection()

    class InMemoryDb:
        def __getitem__(self, name):
            if name == "users":
                return users_collection
            elif name == "products":
                return products_collection
            elif name == "sales":
                return sales_collection
            return InMemoryCollection()
    db = InMemoryDb()

