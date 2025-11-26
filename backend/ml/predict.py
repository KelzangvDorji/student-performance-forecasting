from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import pandas as pd
import os
import joblib

router = APIRouter()

# Load models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

reg_model = joblib.load(os.path.join(MODEL_DIR, "regression_model.pkl"))
clf_model = joblib.load(os.path.join(MODEL_DIR, "classification_model.pkl"))
encoders = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))  # ✅ correct


# Define input format
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


@router.post("/predict")
def predict(input_data: StudentInput):
    try:
        data_dict = input_data.dict()
        df = pd.DataFrame([data_dict])

        for col in ["Department", "Gender", "Part_Time_Work"]:
            if col in df:
                df[col] = encoders[col].transform(df[col])

        predicted_cgpa = float(reg_model.predict(df)[0])
        academic_risk = str(clf_model.predict(df)[0])

        return {
            "predicted_CGPA": round(predicted_cgpa, 2),
            "academic_risk_level": academic_risk
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")
