import os
from pathlib import Path
from faster_whisper import WhisperModel
import ffmpeg
from functools import lru_cache
from llama_cpp import Llama
from typing import Dict, List, Union
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification,AutoModelForCausalLM
import torch
import re
import json

class PIIDetector:
    def __init__(self, 
                 whisper_model_size: str = "base", 
                 compute_type: str = "int8", 
                 device: str = "cpu",
                 model_type: str = "deberta"):
                 
        """
        Initialize PII detector with configurable models.
        
        Args:
            whisper_model_size: Size of Whisper model (base, small, medium, etc.)
            compute_type: Computation type for Whisper (int8, float16, etc.)
            device: Device to use (cpu or cuda)
            model_type: Default model type (deberta or unsloth)
        """
        self.whisper_model_size = whisper_model_size
        self.compute_type = compute_type
        self.device = device
        self.model_type = model_type
        self.unsloth_llm = None  # For llama-cpp
        
        # Initialize models
        self._initialize_models()
        
        # For lazy loading Whisper
        self._whisper_model = None

    def _initialize_models(self):
        """Initialize both models with proper configuration."""
        print(f"Initializing {self.model_type} model...")
        
        # Initialize DeBERTa
        self.deberta_tokenizer = AutoTokenizer.from_pretrained("AI-Enthusiast11/pii-entity-extractor")
        self.deberta_model = AutoModelForTokenClassification.from_pretrained("AI-Enthusiast11/pii-entity-extractor")
        self.deberta_nlp = pipeline(
            "ner",
            model=self.deberta_model,
            tokenizer=self.deberta_tokenizer,
            aggregation_strategy="simple",
            device=self.device
        )
        
        # Initialize Unsloth (lazy loading)
        self.unsloth_model = None
        self.unsloth_initialized = False

    def load_unsloth_model(self):
        if not self.unsloth_llm:
            print("Loading Unsloth llama-cpp model...")
            self.unsloth_llm = Llama.from_pretrained(
                repo_id="AI-Enthusiast11/mistral-7b-4bit-pii-entity-extractor",
                filename="unsloth.Q4_K_M.gguf"
            )


    def set_model(self, model_type: str):
        """Switch between DeBERTa and Unsloth models."""
        if model_type not in ['deberta', 'unsloth']:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        if model_type == "unsloth":
            self.load_unsloth_model()
            
        self.model_type = model_type
        print(f"Switched to {model_type} model")

    def detect_entities(self, text: str) -> List[Dict]:
        """Detect PII entities using the currently active model."""
        if self.model_type == "deberta":
            return self._detect_with_deberta(text)
        else:
            return self._detect_with_unsloth(text)

    def _detect_with_deberta(self, text: str) -> List[Dict]:
        """DeBERTa specific entity detection."""
        raw_results = self.deberta_nlp(text)
        merged_entities = []
        
        if not raw_results:
            return merged_entities

        current = {
            "entity_type": raw_results[0]["entity_group"],
            "start": raw_results[0]["start"],
            "end": raw_results[0]["end"],
            "word": raw_results[0]["word"],
            "score_sum": raw_results[0]["score"],
            "count": 1
        }

        for r in raw_results[1:]:
            if r["entity_group"] == current["entity_type"] and 0 <= r["start"] - current["end"] <= 2:
                current["end"] = r["end"]
                current["word"] += r["word"].replace("##", "")
                current["score_sum"] += r["score"]
                current["count"] += 1
            else:
                merged_entities.append({
                    "entity_type": current["entity_type"],
                    "start": current["start"],
                    "end": current["end"],
                    "word": current["word"],
                    "score": float(current["score_sum"] / current["count"])
                })
                current = {
                    "entity_type": r["entity_group"],
                    "start": r["start"],
                    "end": r["end"],
                    "word": r["word"],
                    "score_sum": r["score"],
                    "count": 1
                }

        merged_entities.append({
            "entity_type": current["entity_type"],
            "start": current["start"],
            "end": current["end"],
            "word": current["word"],
            "score": float(current["score_sum"] / current["count"])
        })

        return merged_entities
    def redact_text(self, text, entities):
        if not entities:
            return text

        # If using Unsloth (no 'start'), do replacement by value
        if "start" not in entities[0]:
            redacted_text = text
            for entity in sorted(entities, key=lambda e: -len(e["word"])):
                pattern = re.escape(entity["word"])
                redacted_text = re.sub(pattern, f"[{entity['entity_type']}]", redacted_text, flags=re.IGNORECASE)
            return redacted_text

        # If using DeBERTa (has start/end)
        entities = sorted(entities, key=lambda x: x["start"], reverse=True)
        text_chars = list(text)
        for entity in entities:
            text_chars[entity["start"]:entity["end"]] = list(f"[{entity['entity_type']}]")
        return "".join(text_chars)
  

    def _detect_with_unsloth(self, text: str) -> List[Dict]:
        """Unsloth LLM detection with basic label: value output."""
        if not self.unsloth_initialized:
            self.load_unsloth_model()

        pii_prompt = """Extract the personally identifiable information (PII) from the following text. 
        Only return entities in this format: <LABEL>: <ENTITY>

        Example:
        Input: "hi, i am lucas clark. i recently made a payment of $1,500 on my loan, but the payment hasn't been reflected. my credit card number is 4111 1111 1111 1111."
        Response:
        NAME: lucas clark
        CREDIT-CARD-NO: 4111 1111 1111 1111
        ###

        Input:"{}"
        Response:
        """

        try:

            prompt = pii_prompt.format(text,"")  #
            output = self.unsloth_llm(
                prompt,
                max_tokens=2048,
                temperature=0.0,
                stop=["###"]
            )

            result_text = output["choices"][0]["text"].strip()
            entities = []

            for line in result_text.splitlines():
                if ": " in line:
                    label, word = line.split(": ", 1)
                    entities.append({
                        "entity_type": label.strip(),
                        "word": word.strip(),
                    })

            return entities

        except Exception as e:
            print("Error in Unsloth detection:", e)
            return []


    @lru_cache(maxsize=1)
    def _load_whisper_model(self):
        """Cache and return Whisper model instance."""
        return WhisperModel(
            self.whisper_model_size,
            device=self.device,
            compute_type=self.compute_type,
            download_root=os.path.join(os.getcwd(), "whisper_models")
        )

    def transcribe_audio(self, audio_path: str) -> List[Dict]:
        """Transcribe audio with word-level timestamps."""
        model = self._load_whisper_model()
        segments, _ = model.transcribe(
            audio_path,
            word_timestamps=True,
            vad_filter=True
        )

        transcription = []
        for segment in segments:
            for word_info in segment.words:
                transcription.append({
                    'text': word_info.word.strip(),
                    'start': word_info.start,
                    'end': word_info.end
                })
        return transcription

    @staticmethod
    def clean_transcription(text: str) -> str:
        """Clean transcription text."""
        text = text.replace(" -", "-")  # Remove space before hyphen
        text = text.replace("- ", "-")  # Remove space after hyphen
        return text

    def match_pii_to_segments(self, pii_entities: List[Dict], transcription: List[Dict]) -> List[Dict]:
        """Match PII entities to audio segments."""
        pii_words = [val.lower() for entity in pii_entities for val in [entity['word']]]
        redaction_segments = []

        for word_info in transcription:
            clean_text = word_info['text'].replace(",", "").replace(".", "").replace("-", "").lower()
            for pii_entity in pii_entities:
                pii_value = pii_entity['word'].replace("-", "").replace(" ", "").lower()
                if clean_text in pii_value:
                    redaction_segments.append({
                        "start": word_info['start'],
                        "end": word_info['end'],
                        "entity_type": pii_entity['entity_type']
                    })
        return redaction_segments

    def redact_audio(self, input_path: str, output_path: str, segments_to_mute: List[Dict], padding: float = 0.1):
        """Redact sensitive audio segments."""
        input_audio = ffmpeg.input(input_path)
        audio = input_audio.audio
        filtered_audio = audio

        for segment in segments_to_mute:
            start = max(segment['start'] - padding, 0)
            end = segment['end'] + padding
            filtered_audio = filtered_audio.filter_("volume", enable=f"between(t,{start},{end})", volume=0)

        out = ffmpeg.output(filtered_audio, output_path)
        ffmpeg.run(out, overwrite_output=True)

    def detect_and_redact_audio(self, audio_path: str, output_path: str = None) -> Dict:
        """Complete audio processing pipeline."""
        # 1. Transcribe audio
        transcription = self.transcribe_audio(audio_path)
        
        # 2. Join all words for detection
        full_text = " ".join([w["text"] for w in transcription])
        
        # 3. Clean transcription
        clean_text = self.clean_transcription(full_text)
        print(f"[DEBUG] Cleaned transcription: {clean_text}")
        
        # 4. Detect PII
        pii_entities = self.detect_entities(clean_text)
        
        # 5. Match PII to timestamps
        segments_to_mute = self.match_pii_to_segments(pii_entities, transcription)
        
        # 6. Redact audio
        if output_path is None:
            output_path = str(Path(audio_path).with_name(f"redacted_{Path(audio_path).name}"))
        
        self.redact_audio(audio_path, output_path, segments_to_mute)
        
        return {
            "redacted_audio_path": output_path,
            "transcription": clean_text,
            "pii_entities": pii_entities,
            "redacted_segments": segments_to_mute
        }

    def batch_redact_audio(self, input_folder: str, output_folder: str) -> List[Dict]:
        """Process multiple audio files."""
        os.makedirs(output_folder, exist_ok=True)
        audio_files = list(Path(input_folder).glob("*.wav"))

        results = []
        for audio_file in audio_files:
            print(f"Processing: {audio_file.name}")
            output_path = Path(output_folder) / audio_file.name
            result = self.detect_and_redact_audio(str(audio_file), str(output_path))
            results.append(result)
            print(f"Redacted file saved to: {output_path}\n")
        
        return results