import pandas as pd
import os

def load_dataset(filename="StudentData.csv"):
    """
    Loads the dataset from backend/dataset/ folder.
    Returns a pandas DataFrame.
    """

    base_path = os.path.dirname(os.path.abspath(__file__))   # path to ml folder
    dataset_path = os.path.join(base_path, "..", "dataset", filename)

    try:
        df = pd.read_csv(dataset_path)
        print(f"Dataset loaded successfully! Shape: {df.shape}")
        return df
    except FileNotFoundError:
        print(" ERROR: CSV file not found. Check dataset path or filename.")
    except Exception as e:
        print(f" ERROR: Unexpected error occurred: {e}")