
# 🔒 PII Detection and Redaction in Audio

## 📝 Overview
This project provides a complete end-to-end system to **detect and redact Personally Identifiable Information (PII)** from audio recordings. It integrates **speech-to-text transcription**, **NER-based PII detection**, and **audio/text redaction**, all through an interactive web interface.

Users can upload audio files to the website, select between two AI models for PII detection (DeBERTa or Unsloth), and receive both redacted text and audio output.


## 🎯 Goals

- Detect and redact PII in **English audio recordings**
- Build a usable **web platform** for real-time PII detection
- Enable selection between two NLP models (DeBERTa and Unsloth)
- Provide both **transcribed and redacted text**, and **muted/redacted audio**
- Ensure a clean, responsive frontend and optimized backend API

## ⚙️ Technologies Used

### 🔊 Audio Processing
- **[Faster-Whisper](https://github.com/guillaumekln/faster-whisper)**: Fast, word-level ASR transcription with timestamps
- **FFmpeg**: For audio conversion and segment-based redaction

### 🤖 PII Detection Models
- **DeBERTa (via HuggingFace Transformers)**: For character-span-based entity recognition
- **Unsloth (LLaMA-based using llama.cpp)**: Prompt-based LLM for label:value detection

### 🌐 Full-Stack Web App
- **Frontend**:
  - [Vite](https://vitejs.dev/): Lightning-fast frontend tooling
  - **React**: Component-based UI
  - **Material UI (MUI)**: Pre-styled UI components
  - **Axios**: For REST API communication

- **Backend**:
  - **Flask** (Python): Lightweight web framework
  - **Tempfile + Subprocess**: File handling and audio conversion
  - **PIIDetector Class**: Core logic for transcription, entity recognition, redaction, and audio editing

### 🧪 Development & Data Tools
- **Python** & **Jupyter Notebooks**: For prototyping and testing
- **CSV / JSON**: For storing transcripts, labels, and results


## 📦 System Features

### 1. Audio Upload
- Supports common formats (e.g., `.wav`, `.mp3`)
- Frontend allows multiple uploads
- Files are converted to standard format automatically

### 2. Model Selection
- Users can select:
  - **DeBERTa** (precise span-based detection)
  - **Unsloth** (flexible prompt-based output)

### 3. Transcription
- Whisper transcribes speech into word-timestamped text
- Cleaned and preprocessed for consistent model input

### 4. PII Detection
- **DeBERTa**: Detects PII spans with confidence scores
- **Unsloth**: Extracts PII in "LABEL: VALUE" format via prompting

### 5. Redaction
- **Text Redaction**: Replaces detected PII with `[ENTITY_TYPE]`
- **Audio Redaction**: Mutes exact segments where PII is spoken

### 6. Result Display
- Original transcript
- Detected entities (with labels)
- Redacted transcript
- Redacted audio preview and download link


## 🔍 PII Types Detected

- **Names**
- **Phone Numbers**
- **Addresses**
- **Credit Card Numbers**
- **Social Security Numbers (SSNs)**
- **Bank Account Numbers**
- **Routing Numbers**


## 🧪 Project Pipeline

1. **Collect Audio**  
   Gather or generate English audio with embedded PII entities.

2. **Transcribe Audio**  
   Use Whisper (via FasterWhisper) to transcribe audio into text with word-level timestamps.

3. **Detect PII**  
   Apply selected model (DeBERTa or Unsloth) to find PII in the transcription.

4. **Redact PII**  
   - In text: Replace with `[ENTITY_TYPE]` placeholders  
   - In audio: Mute time-aligned segments containing PII

5. **Return Results**  
   Display all outputs in the browser with clear UI and redacted file downloads.


## 💻 Website Preview (Frontend)

- Upload interface with file input and model selection
- Real-time feedback for processing stages
- Display of:
  - Transcription
  - Redacted text
  - Entity list
  - Redacted audio with download option


## 🔐 Security and Ethics

- All files processed temporarily and deleted after serving results
- No personal data is stored
- Redacted audio/text ensures data privacy even if files are shared
