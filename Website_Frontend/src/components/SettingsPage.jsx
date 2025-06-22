import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  styled,
  Radio,
  RadioGroup,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ShieldIcon from '@mui/icons-material/Shield';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: '#FFFFFF',
  borderRadius: 16,
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const StyledRadio = styled(Radio)({
  '&.Mui-checked': {
    color: '#3B82F6',
  },
});

const NextButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#3B82F6',
  color: 'white',
  padding: '12px 32px',
  borderRadius: 12,
  fontSize: '1.1rem',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#2563EB',
  },
  [theme.breakpoints.down('sm')]: {
    padding: '10px 24px',
    fontSize: '1rem',
  },
}));

const SettingsPage = ({ onSubmit, initialModel = 'deberta', initialCapabilities = ['detection'] }) => {
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [selectedCapability, setSelectedCapability] = useState(
    initialCapabilities.includes('redaction') ? 'redaction' : 'detection'
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = () => {
    const capabilities = selectedCapability === 'redaction' 
      ? ['detection', 'redaction'] 
      : ['detection'];
    
    onSubmit(selectedModel, capabilities);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: isMobile ? 2 : 4,
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#111827',
          mb: 4,
          textAlign: 'center',
          fontSize: isMobile ? '1.5rem' : '2rem',
        }}
      >
        Configure Processing Settings
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 4,
          width: '100%',
          flexDirection: isMobile ? 'column' : 'row',
          mb: 4,
          justifyContent: 'center',
        }}
      >
        <StyledCard sx={{ 
          flex: 1,
          minWidth: isMobile ? '100%' : '400px',
          maxWidth: '500px'
        }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ModelTrainingIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Model Selection
            </Typography>
          </Box>

          <RadioGroup
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <FormControlLabel
              value="deberta"
              control={<StyledRadio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    DeBERTa
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    High accuracy model with advanced understanding of context
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              value="unsloth"
              control={<StyledRadio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Unsloth
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Optimized for faster processing while maintaining accuracy
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </StyledCard>

        <StyledCard sx={{ 
          flex: 1,
          minWidth: isMobile ? '100%' : '400px',
          maxWidth: '500px'
        }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldIcon sx={{ fontSize: 28, color: '#3B82F6' }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: '#111827',
              }}
            >
              Processing Mode
            </Typography>
          </Box>

          <RadioGroup
            value={selectedCapability}
            onChange={(e) => setSelectedCapability(e.target.value)}
          >
            <FormControlLabel
              value="detection"
              control={<StyledRadio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Entity Detection
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Identify and highlight PII entities in the audio
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              value="redaction"
              control={<StyledRadio />}
              label={
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    PII Redaction
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Detect and automatically redact sensitive information
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </StyledCard>
      </Box>

      <NextButton onClick={handleSubmit}>
        Process Audio
      </NextButton>
    </Box>
  );
};

export default SettingsPage;