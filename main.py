from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://loan-approval-prediction-fe.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("model.pkl")


class InputData(BaseModel):
    bank_asset_value: float = Field(ge=0)
    commercial_assets_value: float = Field(ge=0)
    residential_assets_value: float = Field(ge=0)
    no_of_dependents: int = Field(ge=0, le=20)
    income_annum: float = Field(gt=0)
    loan_term: int = Field(gt=0)
    cibil_score: int = Field(ge=300, le=900)
    luxury_assets_value: float = Field(ge=0)
    loan_amount: float = Field(gt=0)
    self_employed: Literal["Yes", "No"]
    education: Literal["Graduate", "Not Graduate"]


@app.post("/predict")
def predict(data: InputData):
    input_row = pd.DataFrame(
        [
            {
                "bank_asset_value": data.bank_asset_value,
                "commercial_assets_value": data.commercial_assets_value,
                "residential_assets_value": data.residential_assets_value,
                "no_of_dependents": data.no_of_dependents,
                "income_annum": data.income_annum,
                "loan_term": data.loan_term,
                "cibil_score": data.cibil_score,
                "luxury_assets_value": data.luxury_assets_value,
                "loan_amount": data.loan_amount,
                "self_employed": data.self_employed,
                "education": data.education,
            }
        ]
    )

    prediction = model.predict(input_row)[0]
    if str(prediction) == "1":
        return "Congratulations! Your loan has been approved."
    else:
        return "Sorry, your loan application has been rejected."
