import React, { useState } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme, useTheme, useMediaQuery } from '@mui/material';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import MainWindow from './components/MainWindow';
import LandingPage from './components/LandingPage';
import SettingsPage from './components/SettingsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    background: {
      default: '#F9FAFB',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          overflowX: 'hidden',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

const API_URL = 'http://localhost:5000';

const App = () => {
  const [currentStep, setCurrentStep] = useState('landing');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState('deberta');
  const [selectedCapabilities, setSelectedCapabilities] = useState(['detection']);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleFileSelect = (files) => {
    setSelectedFiles(Array.from(files));
    setCurrentStep('settings');
    setCurrentFileIndex(0);
  };

  const handleSettingsSubmit = async (model, capabilities) => {
    setSelectedModel(model);
    setSelectedCapabilities(capabilities);
    setIsProcessing(true);
    setCurrentStep('main');
    setCurrentFileIndex(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('audio', file);
      });
      formData.append('model', model);
      formData.append('capabilities', capabilities.join(','));

      const response = await axios.post(`${API_URL}/api/detect-pii`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const processedResults = response.data.results.map((result, index) => ({
        ...result,
        file: selectedFiles[index],
      }));

      setResults(processedResults);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Failed to process audio files. Please check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextFile = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    }
  };

  const handlePrevFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    }
  };

  const handleUploadClick = () => {
    setCurrentStep('landing');
    setSelectedFiles([]);
    setResults(null);
  };

  const handleSettingsClick = () => {
    if (selectedFiles.length > 0) {
      setCurrentStep('settings');
    }
  };

  const handleSettingsClose = () => {
    if (isMobile) {
      setCurrentStep('main');
    }
  };

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'landing':
        return (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 4 },
              height: '100%',
              width: '100%',
            }}
          >
            <LandingPage onFileSelect={handleFileSelect} />
          </Box>
        );

      case 'settings':
        return (
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 4 },
              height: '100%',
              width: '100%',
              overflowY: 'auto',
            }}
          >
            <SettingsPage
              onSubmit={handleSettingsSubmit}
              initialModel={selectedModel}
              initialCapabilities={selectedCapabilities}
              onClose={handleSettingsClose}
            />
          </Box>
        );

      case 'main':
        return (
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              height: '100%',
              width: '100%',
              overflow: 'auto',
            }}
          >
            <Sidebar
              onUploadClick={handleUploadClick}
              onSettingsClick={handleSettingsClick}
              selectedModel={selectedModel}
              selectedCapabilities={selectedCapabilities}
              isProcessing={isProcessing}
              open={isSidebarOpen}
              onToggle={handleSidebarToggle}
              onClose={handleSidebarClose}
              sx={{ maxHeight: { xs: '50vh', md: '100%' }, flexShrink: 0 }}
            />
            <Box
              sx={{
                flexGrow: 1,
                width: '100%',
                overflowY: 'auto',
                p: { xs: 1, sm: 2 },
                mt: { xs: isSidebarOpen ? 8 : 0, md: 0 },
              }}
            >
              <MainWindow
                audioFiles={selectedFiles}
                transcriptionResults={results}
                isProcessing={isProcessing}
                selectedCapabilities={selectedCapabilities}
                currentFileIndex={currentFileIndex}
                onNext={handleNextFile}
                onPrev={handlePrevFile}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
        {renderContent()}
      </Box>
    </ThemeProvider>
  );
};

export default App;
