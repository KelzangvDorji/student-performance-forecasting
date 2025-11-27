from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import pandas as pd
import os

# -------------------------------
# FastAPI App
# -------------------------------

app = FastAPI(title="Student Performance Prediction API")

# -------------------------------
# Load Models + Encoders
# -------------------------------

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

def _load_pickle(path: str):
    """Load a pickle file safely"""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Pickle file not found: {path}")
    with open(path, "rb") as f:
        return pickle.load(f)

# Load regression model
reg_model = _load_pickle(os.path.join(MODEL_DIR, "regression_model.pkl"))

# Load classification model
clf_model = _load_pickle(os.path.join(MODEL_DIR, "classification_model.pkl"))

# Load label encoders
label_encoders = _load_pickle(os.path.join(MODEL_DIR, "label_encoders.pkl"))

# -------------------------------
# Input Schema
# -------------------------------

class StudentInput(BaseModel):
    Semester: int
    Department: str
    Age: int
    Gender: str
    Attendance_Percentage: int
    Study_Hours_Per_Week: int
    Backlogs: int
    Part_Time_Work: str
    Previous_CGPA: float

# -------------------------------
# Helper: Preprocess input
# -------------------------------

def preprocess_input(data: dict) -> pd.DataFrame:
    df = pd.DataFrame([data])
    # Encode categorical columns using saved label encoders
    for col, le in label_encoders.items():
        if col in df.columns:
            try:
                df[col] = le.transform(df[col].astype(str))
            except Exception:
                # Fallback: leave the column unchanged
                df[col] = df[col]
    return df

# -------------------------------
# API Endpoint
# -------------------------------

@app.post("/predict")
def predict_student(input_data: StudentInput):
    # Convert input to dict
    data_dict = input_data.dict()

    # Preprocess input
    X = preprocess_input(data_dict)

    # -------------------
    # Feature Selection (must match training)
    # -------------------
    regression_features = [
        "Previous_CGPA",
        "Attendance_Percentage",
        "Study_Hours_Per_Week",
        "Backlogs",
        "Part_Time_Work"
    ]

    classification_features = [
        "Previous_CGPA",
        "Attendance_Percentage",
        "Study_Hours_Per_Week",
        "Backlogs",
        "Part_Time_Work",
        "Semester",
        "Department"
    ]

    try:
        X_reg = X[regression_features]
        X_clf = X[classification_features]
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing feature in input: {e}")

    # -------------------
    # Make Predictions
    # -------------------
    predicted_cgpa = reg_model.predict(X_reg)[0]
    academic_risk = clf_model.predict(X_clf)[0]

    # Map Academic Risk back to label
    risk_mapping = {0: "Low", 1: "High"}
    academic_risk_label = risk_mapping.get(int(academic_risk), "Unknown")

    return {
        "predicted_CGPA": round(float(predicted_cgpa), 2),
        "academic_risk_level": academic_risk_label
    }
