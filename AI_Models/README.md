#  PII Detection in Audio

## Overview
This project detects Personally Identifiable Information (PII) in audio recordings using machine learning. It uses OpenAI's Whisper to turn speech into text, and a BERT model to find PII in the text.

## Goals
- Detect PII in audio recordings.
- Build a dataset with audio that contains names, phone numbers, etc.
- Create a simple pipeline that:
  1. Transcribes audio to text
  2. Finds PII in the text

## Technologies Used
- Faster-Whisper (for audio transcription)
- DeBERT and unsloth (for Named Entity Recognition)
- Python, Jupyter Notebook
- CSV files for storing data

## Steps
1. **Collect Audio**: Gather or generate English audio samples with PII.
2. **Transcribe**: Use Whisper to convert audio to text.
3. **Label**: Mark PII in the text (like names, phone numbers, etc.).
4. **Train Model**: Use BERT to train a model that can detect PII.
5. **Test and Evaluate**: Check how well the model finds PII.

## PII Types We Detect
- Names  
- Phone Numbers  
- Addresses  
- Credit Card Numbers  
- Social Security Numbers  
- Bank Account Details
