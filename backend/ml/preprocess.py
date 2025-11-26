import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split

# Columns to drop (not useful)
DROP_COLS = ["Student_Name", "Enrollment_No"]

# Categorical feature columns
CATEGORICAL_COLS = [
    "Department",
    "Gender",
    "Parent_Education_Level",
    "Part_Time_Work"
]

def preprocess_data(df: pd.DataFrame):
    """
    Clean preprocessing for:
    - predicted_CGPA (regression target)
    - Academic_Risk_Level (classification target)
    """

    df = df.copy()

    # Drop ID columns
    df.drop(columns=[c for c in DROP_COLS if c in df.columns], inplace=True)

    # Encode categorical columns
    encoders = {}

    for col in CATEGORICAL_COLS:
        if col in df.columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le

    # Encode Academic_Risk_Level (target)
    risk_encoder = LabelEncoder()
    df["Academic_Risk_Level"] = risk_encoder.fit_transform(df["Academic_Risk_Level"])
    encoders["Academic_Risk_Level"] = risk_encoder

    # Regression target
    y_reg = df["predicted_CGPA"]

    # Classification target
    y_clf = df["Academic_Risk_Level"]

    # Feature matrix
    X = df.drop(columns=["predicted_CGPA", "Academic_Risk_Level"])

    # Train-test split
    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf, test_size=0.2, random_state=42
    )

    return (
        X_train, X_test,
        y_reg_train, y_reg_test,
        y_clf_train, y_clf_test,
        encoders
    )

