from fastapi import APIRouter
from app.database import db

router = APIRouter()

sales_collection = db["sales"]
products_collection = db["products"]


@router.get("/")
def get_ai_suggestions():

    sales = list(sales_collection.find())
    products = list(products_collection.find())

    if not sales and not products:
        return []

    product_sales = {}

    for sale in sales:
        for item in sale.get("items", []):
            name = item.get("name")
            qty = item.get("quantity", 0)

            if not name:
                continue

            try:
                qty = float(qty)
            except (TypeError, ValueError):
                qty = 0.0

            product_sales[name] = product_sales.get(name, 0.0) + max(qty, 0.0)

    suggestions = []

    for product in products:
        name = product.get("name")
        if not name:
            continue

        stock = float(product.get("stock", 0) or 0)
        sold = float(product_sales.get(name, 0.0))

        if sold > 0:
            projected_demand = round(sold * 1.25, 2)
            if stock <= max(5.0, sold * 0.5):
                suggestions.append({
                    "type": "warning",
                    "title": "Restock Recommended",
                    "message":
                        f"{name} has sold {round(sold, 2)} units recently and is likely to sell around {projected_demand} units in the next few days. Stock is running low."
                })
            elif sold >= 15:
                suggestions.append({
                    "type": "success",
                    "title": "Demand Rising",
                    "message":
                        f"{name} has strong demand based on previous sales. It sold {round(sold, 2)} units recently and is expected to be purchased more in the coming days."
                })
            elif sold >= 5:
                suggestions.append({
                    "type": "info",
                    "title": "Steady Demand",
                    "message":
                        f"{name} is moving steadily with {round(sold, 2)} units sold recently. Demand is stable and likely to remain positive next week."
                })

        if stock < 5 and sold >= 0:
            suggestions.append({
                "type": "warning",
                "title": "Low Stock Alert",
                "message":
                    f"{name} stock is below 5 units, so it may run out before the next restock cycle."
            })

        if sold < 3 and stock > 20:
            suggestions.append({
                "type": "info",
                "title": "Slow Moving Product",
                "message":
                    f"{name} has low historical demand and may need promotional attention to improve sales velocity."
            })

    return suggestions[:10]