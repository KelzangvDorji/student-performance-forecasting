import pandas as pd
import os

def load_dataset(filename="StudentData.csv"):
    """
    Loads the dataset from backend/dataset/ folder.
    Returns a pandas DataFrame.
    """

    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, "..", "dataset", filename)

    try:
        df = pd.read_csv(dataset_path)
        print(f"Dataset loaded successfully! Shape: {df.shape}")
        return df

    except FileNotFoundError:
        print(f"ERROR: File '{filename}' not found inside /dataset folder.")

    except Exception as e:
        print(f"ERROR: Unexpected error occurred: {e}")
