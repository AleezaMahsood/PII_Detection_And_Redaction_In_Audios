import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  styled,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MicIcon from '@mui/icons-material/Mic';
import CloseIcon from '@mui/icons-material/Close';
import AudioRecorder from './AudioRecorder';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: 600,
  margin: '0 auto',
  textAlign: 'center',
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
}));

const UploadBox = styled(Box)(({ theme }) => ({
  border: '2px dashed #E5E7EB',
  borderRadius: 8,
  padding: theme.spacing(4),
  marginTop: theme.spacing(3),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#3B82F6',
    backgroundColor: '#F0F9FF',
  },
}));

const OptionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  color: '#374151',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  padding: theme.spacing(2),
  width: '100%',
  justifyContent: 'flex-start',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#F9FAFB',
    borderColor: '#3B82F6',
  },
}));

const StyledRadio = styled(Radio)({
  '&.Mui-checked': {
    color: '#3B82F6',
  },
});

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const SectionTitle = styled(Typography)({
  fontSize: '14px',
  fontWeight: 500,
  color: '#4B5563',
  marginBottom: '12px',
  textAlign: 'left',
});

const DetectionPage = ({ onFileSelect, onProceed, onSettingsChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deberta');
  const [selectedCapability, setSelectedCapability] = useState('entity_detection');
  const [selectedLanguage, setSelectedLanguage] = useState('auto');

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFilesSelected(files);
    }
  };

  const handleFilesSelected = (files) => {
    onFileSelect(files);
    onSettingsChange({
      model: selectedModel,
      capability: selectedCapability === 'redaction' ? ['entity_detection', 'redaction'] : ['entity_detection'],
      language: selectedLanguage
    });
    setIsModalOpen(false);
    setIsRecorderOpen(false);
    onProceed();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        p: 3,
      }}
    >
      <StyledPaper>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: '#111827',
            mb: 2,
          }}
        >
          Start PII Detection
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6B7280',
            mb: 4,
          }}
        >
          Upload or record your audio to start PII detection and redaction
        </Typography>

        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <SectionTitle>Model Selection</SectionTitle>
          <FormControl fullWidth>
            <RadioGroup
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <FormControlLabel
                value="deberta"
                control={<StyledRadio />}
                label="DeBERTa"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                value="unsloth"
                control={<StyledRadio />}
                label="Unsloth"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <SectionTitle>Language</SectionTitle>
          <FormControl fullWidth>
            <RadioGroup
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              <FormControlLabel
                value="auto"
                control={<StyledRadio />}
                label="Automatic Language Detection"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                value="en"
                control={<StyledRadio />}
                label="English"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box sx={{ mb: 4, textAlign: 'left' }}>
          <SectionTitle>Select Capability</SectionTitle>
          <FormControl fullWidth>
            <RadioGroup
              value={selectedCapability}
              onChange={(e) => setSelectedCapability(e.target.value)}
            >
              <FormControlLabel
                value="entity_detection"
                control={<StyledRadio />}
                label="Entity Detection"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                value="redaction"
                control={<StyledRadio />}
                label="PII Redaction"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <UploadBox onClick={handleUploadClick}>
          <CloudUploadIcon sx={{ fontSize: 48, color: '#3B82F6', mb: 2 }} />
          <Typography
            variant="body1"
            sx={{
              color: '#374151',
              fontWeight: 500,
              mb: 1,
            }}
          >
            Upload or Record Audio
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6B7280',
            }}
          >
            Click to choose between uploading from your device or recording audio
          </Typography>
        </UploadBox>
      </StyledPaper>

      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Choose an option
            </Typography>
            <IconButton onClick={handleModalClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
            <OptionButton
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Choose from Device
              <VisuallyHiddenInput
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                multiple
              />
              
            </OptionButton>
            <OptionButton
              startIcon={<MicIcon />}
              onClick={() => {
                setIsModalOpen(false);
                setIsRecorderOpen(true);
              }}
            >
              Record Audio
            </OptionButton>
          </Box>
        </DialogContent>
      </Dialog>

      <AudioRecorder
        open={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSave={handleFilesSelected}
      />
    </Box>
  );
};

export default DetectionPage; 