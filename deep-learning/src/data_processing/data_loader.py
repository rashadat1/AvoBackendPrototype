import pandas as pd
import numpy as np
import torch

class CustomDataLoader:
    def __init__(self, file_path):
        self.file_path = file_path
        
    def load_data(self):
        df = pd.read_csv(self.file_path)
        df.sort_values(by='Transaction Date',inplace=True)
        df.reset_index(inplace=True,drop=True)
        
        df = df.dropna(subset=['Debit'])
        df.reset_index(inplace=True,drop=True)
        df['Transaction Date'] = pd.to_datetime(df['Transaction Date'], format='%Y-%m-%d')
        return df
    
    

    
    