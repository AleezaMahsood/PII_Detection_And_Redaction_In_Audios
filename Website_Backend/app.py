from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import subprocess
from llama_cpp import Llama
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from pii_detector import PIIDetector
from flask import send_file
import uuid

app = Flask(__name__)
CORS(app)

# Initialize PII detector with your model
print("Loading models...")
#tokenizer = AutoTokenizer.from_pretrained("AI-Enthusiast11/pii-entity-extractor")
#model = AutoModelForTokenClassification.from_pretrained("AI-Enthusiast11/pii-entity-extractor")
#nlp_pipeline = pipeline(
#    "ner",
#    model=model,
#    tokenizer=tokenizer,
#    aggregation_strategy="simple"
#)

# Initialize detector with pre-loaded pipeline
#pii_detector = PIIDetector(nlp_pipeline=nlp_pipeline,whisper_model_size="medium",compute_type="int8",device="cpu")
 # Initialize models dictionary
models = {
    "deberta": None,
    "unsloth": None
}

def load_deberta_model():
    print("Loading DeBERTa model...")
    tokenizer = AutoTokenizer.from_pretrained("AI-Enthusiast11/pii-entity-extractor")
    model = AutoModelForTokenClassification.from_pretrained("AI-Enthusiast11/pii-entity-extractor")
    return pipeline(
        "ner",
        model=model,
        tokenizer=tokenizer,
        aggregation_strategy="simple"
    )

def load_unsloth_model():
    print("Loading Unsloth model...")
    return Llama.from_pretrained(
        repo_id="AI-Enthusiast11/mistral-7b-4bit-pii-entity-extractor",
        filename="unsloth.Q4_K_M.gguf",
    )

# Initialize PII detector
print("Initializing PII detector...")
pii_detector = PIIDetector(
    whisper_model_size="medium",
    compute_type="int8",
    device="cpu"
)

def get_model(model_name):
    """Get or load the requested model"""
    if model_name not in models:
        raise ValueError(f"Unknown model: {model_name}")
    
    if models[model_name] is None:
        if model_name == "deberta":
            models[model_name] = load_deberta_model()
        elif model_name == "unsloth":
            models[model_name] = load_unsloth_model()
    
    return models[model_name]  

def convert_audio_to_wav(audio_file):
    """Convert uploaded audio to WAV format using ffmpeg."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav, \
         tempfile.NamedTemporaryFile(delete=False) as temp_input:

        audio_file.save(temp_input.name)

        command = [
            "ffmpeg", "-y",
            "-i", temp_input.name,
            "-ar", "16000",
            "-ac", "1",
            temp_wav.name
        ]
        subprocess.run(command, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return temp_wav.name

@app.route('/api/detect-pii', methods=['POST'])
def detect_pii():
    try:
        model_name = request.form.get('model', 'deberta').lower()
        files = request.files.getlist('audio')
        if not files:
            return jsonify({'error': 'No audio files provided'}), 400

        results = []

        for audio_file in files:
            if not audio_file.filename:
                continue
            # Load the requested model
            model = get_model(model_name)
            pii_detector.set_model(model_name)  # Update detector with current model
    
            print(f"Processing audio file: {audio_file.filename}")
            wav_path = convert_audio_to_wav(audio_file)
            print("Audio converted to WAV format")

            # Use the PIIDetector's transcription and detection methods
            result = pii_detector.detect_and_redact_audio(wav_path)
            os.unlink(wav_path)

            # Generate download URL for the redacted audio
            redacted_filename = f"redacted_{uuid.uuid4().hex}.wav"
            redacted_path = os.path.join(tempfile.gettempdir(), redacted_filename)
            os.rename(result['redacted_audio_path'], redacted_path)

            results.append({
                'filename': audio_file.filename,
                'transcript': result['transcription'],
                'redacted_transcript': pii_detector.redact_text(
                    result['transcription'],
                    result['pii_entities']
                ),
                'entities': result['pii_entities'],
                'redacted_audio_url': f"/api/download/{redacted_filename}"
            })

        return jsonify({'results': results})

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        if not audio_file.filename:
            return jsonify({'error': 'No selected file'}), 400

        print(f"Processing audio file: {audio_file.filename}")
        wav_path = convert_audio_to_wav(audio_file)
        print("Audio converted to WAV format")

        try:
            # Use the PIIDetector's transcription method
            transcription = pii_detector.transcribe_audio(wav_path)
            transcript = " ".join([w['text'] for w in transcription])
            
            os.unlink(wav_path)
            return jsonify({'transcript': transcript})

        except Exception as e:
            if os.path.exists(wav_path):
                os.unlink(wav_path)
            raise e

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/redact', methods=['POST'])
def redact_text():
    try:
        data = request.get_json()
        if not data or 'text' not in data or 'entities' not in data:
            return jsonify({'error': 'Missing text or entities in request'}), 400

        text = data['text']
        entities = data['entities']
        redacted_text = pii_detector.redact_text(text, entities)

        return jsonify({
            'redacted_text': redacted_text
        })

    except Exception as e:
        print(f"Error processing redaction request: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/redact-audio', methods=['POST'])
def redact_audio_endpoint():
    try:
        files = request.files.getlist('audio')
        if not files:
            return jsonify({'error': 'No audio files provided'}), 400

        results = []

        for audio_file in files:
            if not audio_file.filename:
                continue

            print(f"Processing audio file: {audio_file.filename}")
            wav_path = convert_audio_to_wav(audio_file)

            # Use the PIIDetector's complete audio redaction pipeline
            result = pii_detector.detect_and_redact_audio(wav_path)
            os.unlink(wav_path)

            # Generate download URL for the redacted audio
            redacted_filename = f"redacted_{uuid.uuid4().hex}.wav"
            redacted_path = os.path.join(tempfile.gettempdir(), redacted_filename)
            os.rename(result['redacted_audio_path'], redacted_path)

            results.append({
                'original_filename': audio_file.filename,
                'transcript': " ".join([w['text'] for w in result['transcription']]),
                'entities': result['pii_entities'],
                'redacted_audio_url': f"/api/download/{redacted_filename}"
            })

        return jsonify({'results': results})

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<filename>', methods=['GET'])
def download_file(filename):
    filepath = os.path.join(tempfile.gettempdir(), filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, as_attachment=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'pii_detector_loaded': pii_detector is not None
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)