from fastapi import APIRouter
from app.database import db

import pandas as pd
import numpy as np

from sklearn.linear_model import LinearRegression


router = APIRouter()

sales_collection = db["sales"]


@router.get("/")
def predict_sales():

    sales = list(sales_collection.find())

    if len(sales) < 2:
        return {"predictions": []}

    daily_sales = []

    for i, sale in enumerate(sales):
        try:
            total = float(sale.get("total", 0) or 0)
        except (TypeError, ValueError):
            total = 0.0

        if total < 0:
            total = 0.0

        daily_sales.append({
            "day": i + 1,
            "sales": total
        })

    df = pd.DataFrame(daily_sales)

    if df.empty or df["sales"].sum() <= 0:
        return {"predictions": []}

    X = df[["day"]]
    y = df["sales"]

    if y.nunique() <= 1:
        base_sales = float(y.iloc[-1])
        forecast_values = [max(base_sales, 0.0)] * 7
    else:
        model = LinearRegression()
        model.fit(X, y)

        future_days = np.array(
            range(len(df) + 1, len(df) + 8)
        ).reshape(-1, 1)

        model_predictions = model.predict(future_days)

        recent_sales = df["sales"].tail(3).tolist()
        recent_avg = float(np.mean(recent_sales)) if recent_sales else 0.0
        trend_delta = 0.0
        if len(recent_sales) > 1:
            trend_delta = (recent_sales[-1] - recent_sales[0]) / max(len(recent_sales) - 1, 1)

        smoothed_predictions = []
        for offset, prediction in enumerate(model_predictions, start=1):
            baseline = float(prediction)
            momentum_value = recent_avg + (trend_delta * offset)
            final_value = max(baseline, momentum_value, 0.0)
            smoothed_predictions.append(final_value)

        forecast_values = smoothed_predictions

    result = []

    for i, pred in enumerate(forecast_values):
        value = float(pred)
        result.append({
            "day": f"Day {len(df) + i + 1}",
            "predicted_sales": round(max(value, 0.0), 2)
        })

    return {"predictions": result}