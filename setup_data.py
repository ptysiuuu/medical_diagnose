import kagglehub
import shutil
import os

def setup_data():
    print("Downloading datasets...")
    # Download dataset
    path = kagglehub.dataset_download("choongqianzheng/disease-and-symptoms-dataset")
    print(f"Dataset downloaded to: {path}")

    target_dir = "app/backend/data"
    os.makedirs(target_dir, exist_ok=True)

    # Copy files
    for file in ["DiseaseAndSymptoms.csv", "Disease precaution.csv"]:
        src = os.path.join(path, file)
        dst = os.path.join(target_dir, file)
        if os.path.exists(src):
            shutil.copy2(src, dst)
            print(f"Copied {file} to {dst}")
        else:
            print(f"Warning: {file} not found in {path}")

if __name__ == "__main__":
    setup_data()
