import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  styled,
  CircularProgress,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3B82F6',
  color: 'white',
  '&:hover': {
    backgroundColor: '#2563EB',
  },
  '&.Mui-disabled': {
    backgroundColor: '#93C5FD',
    color: 'white',
  },
}));

const AudioRecorder = ({ open, onClose, onSave }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);

      streamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();
      setRecordingDuration(0);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await new Promise((resolve) => setTimeout(resolve, 200)); // ensure flush
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);

        const audioUrl = URL.createObjectURL(audioBlob);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
        audioRef.current = new Audio(audioUrl);

        const finalDuration = (Date.now() - startTimeRef.current) / 1000;
        setDuration(finalDuration);
        setRecordingDuration(finalDuration);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        const currentDuration = (Date.now() - startTimeRef.current) / 1000;
        setRecordingDuration(currentDuration);
      }, 100);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSave = () => {
    if (recordedBlob) {
      const file = new File([recordedBlob], 'recording.webm', { type: 'audio/webm' });
      onSave([file]);
      onClose();
    }
  };

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setRecordingDuration(0);
      setDuration(0);
      setCurrentTime(0);
    };
  }, [isRecording]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current?.currentTime || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [recordedBlob]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, p: 1 } }}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Record Audio
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 4 }}>
          {isRecording ? (
            <CircularProgress size={64} sx={{ color: '#3B82F6' }} />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: recordedBlob ? '#E5E7EB' : '#3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MicIcon sx={{ fontSize: 32, color: recordedBlob ? '#6B7280' : 'white' }} />
            </Box>
          )}

          <Typography variant="h6" sx={{ color: '#374151' }}>
            {isRecording ? 'Recording...' : recordedBlob ? 'Recording Complete' : 'Ready to Record'}
          </Typography>

          <Typography variant="body1" sx={{ color: '#6B7280' }}>
            {formatTime(isRecording ? recordingDuration : duration)}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {!recordedBlob ? (
              <StyledButton
                variant="contained"
                onClick={isRecording ? stopRecording : startRecording}
                startIcon={isRecording ? <StopIcon /> : <MicIcon />}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </StyledButton>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={handlePlayPause}
                  startIcon={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setRecordedBlob(null);
                    setDuration(0);
                    setCurrentTime(0);
                    setRecordingDuration(0);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current.src = '';
                    }
                  }}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
                <StyledButton variant="contained" onClick={handleSave}>
                  Save
                </StyledButton>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AudioRecorder;
