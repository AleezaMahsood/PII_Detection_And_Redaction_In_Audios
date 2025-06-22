import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  styled,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import ShieldIcon from '@mui/icons-material/Shield';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

const StyledButton = styled(Button)({
  backgroundColor: '#FFFFFF',
  color: '#374151',
  textTransform: 'none',
  padding: '12px 16px',
  justifyContent: 'flex-start',
  width: '100%',
  borderRadius: 8,
  '&:hover': {
    backgroundColor: '#F3F4F6',
  },
});

const SettingBox = styled(Box)({
  padding: '16px',
  backgroundColor: '#F9FAFB',
  borderRadius: 8,
  marginBottom: '16px',
});

const Sidebar = ({
  onUploadClick,
  onSettingsClick,
  selectedModel,
  selectedCapabilities,
  isProcessing,
  onClose,
  open,
  onToggle,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sidebarContent = (
    <Box
      sx={{
        width: { xs: '100%', md: 320 },
        height: '100%',
        overflowY: 'auto',
        backgroundColor: '#FFFFFF',
        p: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#111827',
          }}
        >
          PII Detection & Redaction
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ mb: 4 }}>
        <StyledButton
          onClick={() => {
            onUploadClick();
            if (isMobile) onClose();
          }}
          startIcon={<CloudUploadIcon />}
          disabled={isProcessing}
        >
          Upload New Audio
        </StyledButton>
        <StyledButton
          onClick={() => {
            onSettingsClick();
            if (isMobile) onClose();
          }}
          startIcon={<SettingsIcon />}
          disabled={isProcessing}
          sx={{ mt: 1 }}
        >
          Change Settings
        </StyledButton>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="subtitle2"
        sx={{
          color: '#6B7280',
          mb: 2,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '0.75rem',
        }}
      >
        Current Settings
      </Typography>

      <SettingBox>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ModelTrainingIcon sx={{ color: '#3B82F6', mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 500 }}>
            Model
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          {selectedModel === 'deberta' ? 'DeBERTa' : 'Unsloth'}
        </Typography>
      </SettingBox>

      <SettingBox>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ShieldIcon sx={{ color: '#3B82F6', mr: 1, fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ color: '#374151', fontWeight: 500 }}>
            Processing Mode
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          {selectedCapabilities.includes('redaction') ? 'PII Redaction' : 'Entity Detection'}
        </Typography>
      </SettingBox>

      {isProcessing && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 4,
            p: 2,
            backgroundColor: '#EFF6FF',
            borderRadius: 2,
          }}
        >
          <CircularProgress size={24} sx={{ color: '#3B82F6' }} />
          <Typography sx={{ color: '#1E40AF', fontWeight: 500 }}>
            Processing Audio...
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={onToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            backgroundColor: 'white',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'white',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="left"
          open={open}
          onClose={onClose}
          sx={{
            '& .MuiDrawer-paper': {
              width: '100%',
              maxWidth: 320,
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </>
    );
  }

  return sidebarContent;
};

export default Sidebar;
