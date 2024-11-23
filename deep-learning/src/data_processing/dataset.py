import pandas as pd
import torch
import numpy as np
from torch.utils.data import Dataset
from src.utils.time_features import generate_time_features

class TimeSeriesDataset(Dataset):
    def __init__(self,dataframe,past_length,future_length):
        self.dataframe = dataframe
        self.past_length = past_length
        self.future_length = future_length
    
    def __len__(self):
        return len(self.dataframe) - (self.past_length + self.future_length) + 1
    
    def __getitem__(self,idx):
        past_start = idx
        past_end = idx + self.past_length
        future_end = past_end + self.future_length
        
        past_seq = self.dataframe.iloc[past_start:past_end]
        fut_seq = self.dataframe.iloc[past_end:future_end]
        
        past_values = past_seq['Debit'].values
        future_values = fut_seq['Debit'].values
        
        past_observed_mask = ~np.isnan(past_values)
        static_categorical_features = np.ones((1,))
                
        past_time_features, dates_past = generate_time_features(past_seq['Transaction Date'])
        future_time_features, dates_future = generate_time_features(fut_seq['Transaction Date'])
        
        sample = {
            'past_values': torch.tensor(past_values, dtype=torch.float32, requires_grad=True),
            'past_time_features': torch.tensor(past_time_features, dtype=torch.float32, requires_grad=True),
            'past_observed_mask': torch.tensor(past_observed_mask, dtype=torch.bool),
            'static_categorical_features': torch.tensor(static_categorical_features, dtype=torch.long),
            'future_values': torch.tensor(future_values, dtype=torch.float32, requires_grad=True),
            'future_time_features': torch.tensor(future_time_features, dtype=torch.float32, requires_grad=True),
            'dates_past': dates_past,
            'dates_future': dates_future
        }
        
        return sample