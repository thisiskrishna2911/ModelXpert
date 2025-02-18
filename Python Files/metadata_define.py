import pandas as pd

def get_column_metadata(df):
    metadata = []
    
    for col in df.columns:
        col_data = {}
        
        # Determine the type of the column
        if pd.api.types.is_numeric_dtype(df[col]):
            col_data['Type'] = 2  # Numeric
        elif pd.api.types.is_string_dtype(df[col]):
            col_data['Type'] = 3  # String
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            col_data['Type'] = 0  # Date
        else:
            col_data['Type'] = 1  # Nominal (categorical)
        
        # Count distinct values
        col_data['Distinct Values'] = df[col].nunique()
        
        # Count missing values
        col_data['Missing Values'] = df[col].isnull().sum()
        
        # Append the data for this column
        metadata.append(col_data)
    
    # Create a DataFrame from the metadata list
    metadata_df = pd.DataFrame(metadata, index=df.columns)
    
    return metadata_df

# Example usage
# Assuming you have loaded your dataset into a pandas DataFrame (df)
# df = pd.read_csv('your_dataset.csv')

# metadata_df = get_column_metadata(dfdf)
# print(metadata_df)
