import numpy as np
import pandas as pd
import torch

days_in_months = np.array([0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])

def generate_day_of_month_features(dates: pd.Series):
    
    day_cos = np.cos(2 * np.pi * dates.dt.day / days_in_months[dates.dt.month])
    day_sin = np.sin(2 * np.pi * dates.dt.day / days_in_months[dates.dt.month])
    
    date_strings = dates.dt.date.apply(lambda x: x.strftime('%Y-%m-%d'))
    return np.vstack([day_cos, day_sin]).T, np.vstack([date_strings])

def generate_age_features(length: int):
    
    age_features = np.arange(length) / length
    return age_features.reshape(-1,1)

def generate_time_features(dates: pd.Series):
    
    day_features, date_data = generate_day_of_month_features(dates)
    age_features = generate_age_features(len(dates))
    #return np.hstack([day_features, age_features])
    return day_features, date_data

def custom_collate_fn(batch):
    # Separate out the 'dates_past' and 'dates_future' which are lists of np.datetime64
    dates_past = [item['dates_past'] for item in batch]
    dates_future = [item['dates_future'] for item in batch]
    
    dates_past = np.array(dates_past).reshape(len(batch), -1)
    dates_future = np.array(dates_future).reshape(len(batch), -1)
    # Handle the rest of the data normally (convert to tensors)
    batch_no_dates = [{k: v for k, v in item.items() if k not in ['dates_past', 'dates_future']} for item in batch]
    
    # Use the default collate function for the rest
    collated_batch = torch.utils.data.default_collate(batch_no_dates)
    
    # Add back the dates
    collated_batch['dates_past'] = dates_past
    collated_batch['dates_future'] = dates_future
    
    
    return collated_batch