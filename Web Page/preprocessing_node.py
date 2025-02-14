import os
import sys
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
import joblib

# Read arguments from Node.js
file_path = sys.argv[1]   # File path
label = sys.argv[2]       # Label column
selected_features = sys.argv[3].split(",")  # Selected features (comma-separated)
fill_null = sys.argv[4]   # Handle missing values ("mean" or "drop")
scale_data = sys.argv[5]  # Scale data ("true" or "false")
apply_pca = sys.argv[6]   # Apply PCA ("true" or "false")
n_components = sys.argv[7]  # Number of PCA components


# Check if file exists
if not os.path.exists(file_path):
    print(f"Error: File not found at {file_path}")
    sys.exit(1)

# Load dataset
try:
    df = pd.read_csv(file_path)
except Exception as e:
    print(f"Error loading file: {e}")
    sys.exit(1)

# Ensure the label column exists
if label not in df.columns:
    print(f"Error: Label column '{label}' not found in dataset.")
    sys.exit(1)

# Ensure selected features exist
missing_features = [col for col in selected_features if col not in df.columns]
if missing_features:
    print(f"Error: Features {missing_features} not found in dataset.")
    sys.exit(1)

# Keep only selected features + label
df = df[selected_features + [label]]

# Handle missing values (only in features, not label)
if fill_null:
    for col in selected_features:
        df[col].fillna(df[col].mean(), inplace=True)
else:
    df.dropna(subset=selected_features, inplace=True)

# Detect if label is already encoded (numeric)
if not np.issubdtype(df[label].dtype, np.number):
    # If label is not numeric, apply LabelEncoder
    le = LabelEncoder()
    df[label] = le.fit_transform(df[label])
    joblib.dump(le, "label_encoder.pkl")

# Scale numerical feature columns (excluding label)
if scale_data:
    scaler = StandardScaler()
    numeric_cols = [col for col in selected_features if df[col].dtype in ["float64", "int64"]]
    df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
    joblib.dump(scaler, "scaler.pkl")

# Encode categorical features (excluding label)
label_encoders = {}
for col in selected_features:
    if df[col].dtype == "object":
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
joblib.dump(label_encoders, "encoder.pkl")

# Apply PCA (only on numerical features, excluding label)
if apply_pca and n_components.isdigit():
    n_components = int(n_components)
    numeric_cols = [col for col in selected_features if df[col].dtype in ["float64", "int64"]]

    if n_components > 0 and len(numeric_cols) >= n_components:
        pca = PCA(n_components=n_components)
        pca_data = pca.fit_transform(df[numeric_cols])

        # Create PCA columns
        pca_columns = [f"PCA_{i+1}" for i in range(pca_data.shape[1])]
        pca_df = pd.DataFrame(pca_data, columns=pca_columns, index=df.index)

        # Drop original numeric features and replace with PCA components
        df.drop(columns=numeric_cols, inplace=True)
        df = pd.concat([df, pca_df], axis=1)
        joblib.dump(pca, "PCA.pkl")

# Save processed file
processed_file_path = file_path.replace("uploads", "processed_uploads")
os.makedirs(os.path.dirname(processed_file_path), exist_ok=True)
df.to_csv(processed_file_path, index=False)

# Print processed file path (Node.js reads this output)
print(processed_file_path)
