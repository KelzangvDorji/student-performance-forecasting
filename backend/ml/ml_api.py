import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ml.predict import router as predict_router

from database import Base, engine
from db_session import get_db
from models import StudentPrediction

# -------------------------------
# FastAPI App
# -------------------------------
app = FastAPI(title="Student Performance Prediction API")

app.include_router(predict_router)  # Register /predict endpoint

# Create tables if not exists
Base.metadata.create_all(bind=engine)

# -------------------------------
# Load Models + Encoders
# -------------------------------
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

try:
    # load models and encoders using joblib (matches joblib.dump used in training)
    reg_model = joblib.load(os.path.join(MODEL_DIR, "regression_model.pkl"))
    clf_model = joblib.load(os.path.join(MODEL_DIR, "classification_model.pkl"))
    label_encoders = joblib.load(os.path.join(MODEL_DIR, "label_encoders.pkl"))

    # Sanity checks: ensure loaded objects support .predict
    def _assert_predictable(obj, name):
        if not hasattr(obj, "predict") or not callable(getattr(obj, "predict")):
            raise RuntimeError(
                f"Loaded '{name}' does not appear to be a model with predict(). "
                f"Got type: {type(obj)}. If this was saved incorrectly, re-save the estimator object "
                f"using joblib.dump(model, '{name}.pkl')."
            )

    _assert_predictable(reg_model, "regression_model")
    _assert_predictable(clf_model, "classification_model")

    # Determine expected features from models (if available)
    expected_reg_features = list(getattr(reg_model, "feature_names_in_", []))
    expected_clf_features = list(getattr(clf_model, "feature_names_in_", []))

    # fallback to previous hardcoded lists if the attribute is not present
    if not expected_reg_features:
        expected_reg_features = [
            "Previous_CGPA",
            "Attendance_Percentage",
            "Study_Hours_Per_Week",
            "Backlogs",
            "Part_Time_Work"
        ]
    if not expected_clf_features:
        expected_clf_features = [
            "Previous_CGPA",
            "Attendance_Percentage",
            "Study_Hours_Per_Week",
            "Backlogs",
            "Part_Time_Work",
            "Semester",
            "Department"
        ]

    print("✓ Models and encoders loaded and validated successfully")
except Exception as e:
    print(f"✗ Error loading/validating models: {str(e)}")
    raise

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
    """Preprocess input data and encode categorical features"""
    df = pd.DataFrame([data])

    for col, le in label_encoders.items():
        if col in df.columns:
            try:
                df[col] = le.transform(df[col].astype(str))
            except ValueError as e:
                raise ValueError(
                    f"Unknown value for '{col}': '{df[col].values[0]}'. "
                    f"Expected one of: {list(le.classes_)}"
                )

    return df

# -------------------------------
# API Endpoints
# -------------------------------
@app.get("/")
def root():
    return {"message": "API is running", "expected_reg_features": expected_reg_features, "expected_clf_features": expected_clf_features}

@app.post("/predict")
def predict_student(
    input_data: StudentInput,
    db: Session = Depends(get_db)
):
    """Predict student CGPA and academic risk level"""
    try:
        # Convert input to dict
        data_dict = input_data.dict()
        print(f"Input data received: {data_dict}")

        # Preprocess input
        try:
            X = preprocess_input(data_dict)
            print("✓ Input preprocessed successfully")
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))

        # Validate features exist and are in the same order as training
        missing_reg = [f for f in expected_reg_features if f not in X.columns]
        missing_clf = [f for f in expected_clf_features if f not in X.columns]

        if missing_reg or missing_clf:
            # return 400 with clear info so caller can adapt request or you can retrain
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Input is missing features required by the trained models.",
                    "missing_reg_features": missing_reg,
                    "missing_clf_features": missing_clf,
                    "expected_reg_features": expected_reg_features,
                    "expected_clf_features": expected_clf_features
                },
            )

        X_reg = X[expected_reg_features]
        X_clf = X[expected_clf_features]
        print("✓ Features selected successfully")

        # Make predictions
        try:
            predicted_cgpa = reg_model.predict(X_reg)[0]
            academic_risk = clf_model.predict(X_clf)[0]
            print(f"✓ Predictions made: CGPA={predicted_cgpa}, Risk={academic_risk}")
        except Exception as pred_error:
            raise HTTPException(
                status_code=500,
                detail=f"Model prediction failed: {str(pred_error)}"
            )

        # Map risk to label
        risk_mapping = {0: "Low", 1: "High"}
        academic_risk_label = risk_mapping.get(int(academic_risk), "Unknown")

        # Save to database
        try:
            db_entry = StudentPrediction(
                semester=data_dict.get("Semester"),
                department=data_dict.get("Department"),
                age=data_dict.get("Age"),
                gender=data_dict.get("Gender"),
                attendance_percentage=data_dict.get("Attendance_Percentage"),
                study_hours_per_week=data_dict.get("Study_Hours_Per_Week"),
                backlogs=data_dict.get("Backlogs"),
                part_time_work=data_dict.get("Part_Time_Work"),
                previous_cgpa=data_dict.get("Previous_CGPA"),
                predicted_cgpa=float(predicted_cgpa),
                academic_risk_level=academic_risk_label
            )

            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)
            print(f"✓ Prediction saved to database with ID: {db_entry.id}")

        except Exception as db_error:
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Database save failed: {str(db_error)}"
            )

        # Return response
        return {
            "predicted_CGPA": round(float(predicted_cgpa), 2),
            "academic_risk_level": academic_risk_label
        }

    except HTTPException:
        raise
    except Exception as general_error:
        print(f"✗ Unexpected error in /predict: {str(general_error)}")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected server error: {str(general_error)}"
        )