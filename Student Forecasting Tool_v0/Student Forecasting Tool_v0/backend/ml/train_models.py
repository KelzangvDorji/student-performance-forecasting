import os
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeClassifier

from ml.load_data import load_dataset
from ml.preprocess import preprocess_data

def train_models():

    df = load_dataset()

    (
        X_train, X_test,
        y_reg_train, y_reg_test,
        y_clf_train, y_clf_test,
        encoders
    ) = preprocess_data(df)

    # Create models folder if not exists
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(model_dir, exist_ok=True)

    # -------------------------
    # 1️⃣ Train Regression Model
    # -------------------------
    reg_model = LinearRegression()
    reg_model.fit(X_train, y_reg_train)
    joblib.dump(reg_model, os.path.join(model_dir, "regression_model.pkl"))
    print("Regression model saved.")

    # -------------------------
    # 2️⃣ Train Classification Model
    # -------------------------
    clf_model = DecisionTreeClassifier()
    clf_model.fit(X_train, y_clf_train)
    joblib.dump(clf_model, os.path.join(model_dir, "classification_model.pkl"))
    print("Classification model saved.")

    # Save encoders
    joblib.dump(encoders, os.path.join(model_dir, "label_encoders.pkl"))
    print("Label encoders saved.")

    print("\n Training Completed Successfully!")

if __name__ == "__main__":
    train_models()

