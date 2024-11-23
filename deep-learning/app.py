from flask import Flask, request, jsonify
from flask_cors import CORS
from src.models.autoformer_model import AutoformerModel
from src.data_processing.dataset import TimeSeriesDataset
from src.data_processing.data_loader import CustomDataLoader
from src.utils.time_features import custom_collate_fn
from torch.utils.data import Dataset, DataLoader
import torch
import random

app = Flask(__name__)

data_file_path = 'data/Transactions - Sheet1.csv'
# load and clean dataset at this file path
# eventually this will be replaced with a call to the database
loader = CustomDataLoader(data_file_path)
transaction_DataFrame = loader.load_data()

dataset = TimeSeriesDataset(transaction_DataFrame,past_length=100,future_length=80)
train_size = int(len(dataset) * 0.8)
test_size = len(dataset) - train_size
train_dataset, test_dataset = torch.utils.data.random_split(dataset, [train_size, test_size])

train_loader = DataLoader(train_dataset,batch_size=32,shuffle=False,collate_fn=custom_collate_fn)
test_loader = DataLoader(test_dataset,batch_size=32,shuffle=False,collate_fn=custom_collate_fn)

# handles how the Flask server response to POST requests to these
# endpoints
@app.route('/train', methods=['POST'])
def train_model():
    """
    Endpoint to train the model
    When fully built this function should send a request to get
    transaction data for the user.
    """
    # initialize the model
    model = ModelName(model_name='ModelPlaceHolder',past_length=100,future_length=80,num_epochs=10)
    # train the model using the train dataloader
    model.trainLoop(train_loader=train_loader,test_loader=test_loader)
    # model save path
    model_path = 'src/models/fine_tuned_weights/weights.pth'
    torch.save(model.model.state_dict(), model_path)
    return jsonify({ 'message' : 'Training completed and model weights saved' })
    
@app.route('/predict', methods=['POST'])
def run_inference():
    """
    Endpoint to run inference on a batch of data 
    using fine-tuned model weights
    """
    income = request.json.get('income')
    # Initialize the model
    model = AutoformerModel(model_name='ModelPlaceHolder',past_length=100,future_length=80)
    model_path = 'src/models/fine_tuned_weights/weights.pth'
    try:
        model.model.load_state_dict(torch.load(model_path)) # Load fine tuned model
        print('Model weights successfully loaded.')
    except Exception as e:
        print('Inference loop failed with the following exception: ',e)
        return
    
    # randomly select sequence index from the test batch
    sequence_index = random.randint(0,train_loader.batch_size - 1)
    # build the test batch from the test dataset
    test_batch = next(iter(test_loader))
    # run inference on the selected sequence
    output = model.inference(test_batch=test_batch,sequence_index=sequence_index)
    # calculate cumulative transaction amounts and calculate savings potential
    savings_potential = model.predictionProcessing(income,output)
    
    return jsonify(
        {
        'savings_potential' : savings_potential
        })
    