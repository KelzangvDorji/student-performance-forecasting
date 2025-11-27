import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

def preprocess_data(df, save=False):
    df = df.copy()

    # 1. Handle missing values
    df.fillna(df.mean(numeric_only=True), inplace=True)

    # 2. Encode categorical columns
    categorical_cols = df.select_dtypes(include=['object']).columns
    label_encoders = {}

    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le

    # 3. Define features + target
    X = df.drop(["predicted_CGPA", "Academic_Risk_Level"], axis=1)
    y1 = df["predicted_CGPA"]
    y2 = df["Academic_Risk_Level"]

    # 4. Split X & y1
    X_train, X_test, y1_train, y1_test = train_test_split(
        X, y1, test_size=0.2, random_state=42
    )

    # 5. Split y2 separately — using the SAME test size and random_state  
    _, _, y2_train, y2_test = train_test_split(
        X, y2, test_size=0.2, random_state=42
    )

    # 6. Save preprocessed dataset if required
    if save:
        df.to_csv("dataset/preprocessed_dataset.csv", index=False)
        print("Preprocessed dataset saved → dataset/preprocessed_dataset.csv")

    return (
        X_train, X_test,
        y1_train, y1_test,
        y2_train, y2_test,
        label_encoders
    )
