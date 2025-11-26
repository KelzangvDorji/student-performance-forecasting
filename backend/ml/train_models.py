import os
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier

from .load_data import load_dataset
from .preprocess import preprocess_data

def train_models():

    df = load_dataset()

    (
        X_train, X_test,
        y_reg_train, y_reg_test,
        y_clf_train, y_clf_test,
        encoders
    ) = preprocess_data(df)

    # Choose the smaller feature set to match the API input
    reg_features = [
        "Previous_CGPA",
        "Attendance_Percentage",
        "Study_Hours_Per_Week",
        "Backlogs",
        "Part_Time_Work"
    ]
    clf_features = reg_features + ["Semester", "Department"]

    # Ensure columns exist (preprocess_data should have produced these)
    missing = [f for f in set(reg_features + clf_features) if f not in X_train.columns]
    if missing:
        raise RuntimeError(f"Missing features in preprocessed data: {missing}")

    # Subset feature matrices to the chosen features
    X_train_reg = X_train[reg_features].copy()
    X_test_reg = X_test[reg_features].copy()
    X_train_clf = X_train[clf_features].copy()
    X_test_clf = X_test[clf_features].copy()

    # Create models folder if not exists
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)

    # -------------------------
    # Train Regression Model
    # -------------------------
    reg_model = LinearRegression()
    reg_model.fit(X_train_reg, y_reg_train)
    print("Debug: reg_model type before save:", type(reg_model), "has predict:", hasattr(reg_model, "predict"))
    joblib.dump(reg_model, os.path.join(model_dir, "regression_model.pkl"), compress=3)
    print("Regression model saved.")

    # -------------------------
    # Train Classification Model
    # -------------------------
    clf_model = DecisionTreeClassifier()
    clf_model.fit(X_train_clf, y_clf_train)
    print("Debug: clf_model type before save:", type(clf_model), "has predict:", hasattr(clf_model, "predict"))
    joblib.dump(clf_model, os.path.join(model_dir, "classification_model.pkl"), compress=3)
    print("Classification model saved.")

    # Save encoders (keep any encoders created by preprocess)
    print("Debug: encoders type before save:", type(encoders))
    joblib.dump(encoders, os.path.join(model_dir, "label_encoders.pkl"))
    print("Label encoders saved.")

    print("\n Training Completed Successfully!")

if __name__ == "__main__":
    train_models()

