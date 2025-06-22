import React, { useState } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MicIcon from "@mui/icons-material/Mic";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import AudioRecorder from "./AudioRecorder";
import logo from "../assets/Logos (Light Mode).svg";

/*const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: '1200px',
  boxShadow:"none",
  alignItems:"center",
  margin: '20rem',       // This handles horizontal centering for the max-width container
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1),
  },
}));
*/
const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: "1200px",
  boxShadow: "none",
  alignItems: "center",
  margin: "auto", // Center horizontally and remove fixed spacing
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    margin: theme.spacing(1),
  },
}));

const UploadButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#3B82F6",
  color: "white",
  padding: "12px 24px",
  borderRadius: 12,
  fontSize: "1rem",
  fontWeight: 500,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#2563EB",
    boxShadow: "0 4px 8px rgba(59, 130, 246, 0.3)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: "10px 20px",
    fontSize: "0.9rem",
  },
}));

const OptionButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FFFFFF",
  color: "#374151",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: theme.spacing(2),
  width: "100%",
  justifyContent: "flex-start",
  textTransform: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "#F9FAFB",
    borderColor: "#3B82F6",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
  },
}));

const VisuallyHiddenInput = styled("input")`
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

const LandingPage = ({ onFileSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleUploadClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log(
        "Files selected:",
        Array.from(files).map((f) => f.name)
      );
      onFileSelect(files);
      setIsModalOpen(false);
    } else {
      console.error("No files selected in file input");
    }
  };

  const handleRecordingSave = (files) => {
    if (files && files.length > 0) {
      console.log(
        "Recording saved:",
        Array.from(files).map((f) => f.name)
      );
      onFileSelect(files);
      setIsRecorderOpen(false);
    } else {
      console.error("No files received from recorder");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: isMobile ? 2 : 4,
      }}
    >
      <StyledCard>
        <Box
          sx={{
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto", // This handles horizontal centering for the max-width container
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              width: { xs: 200, md: 120 }, // responsive sizes
              height: "auto",
              fontSize:"large", 
            }}
          />
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#111827",
            mb: 3,
            textAlign: "center",
            fontSize: isMobile ? "1.8rem" : "2.5rem",
            lineHeight: 1.2,
          }}
        >
          PII Detection & Redaction
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "#6B7280",
            mb: 6,
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.6,
            fontWeight: "normal",
            fontSize: isMobile ? "1rem" : "1.25rem",
          }}
        >
          Protect sensitive information in your audio files with our advanced
          AI-powered PII detection and redaction system. Upload or record your
          audio to get started.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <UploadButton
            onClick={handleUploadClick}
            startIcon={
              <CloudUploadIcon sx={{ fontSize: isMobile ? 20 : 24 }} />
            }
          >
            Upload or Record Audio
          </UploadButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 3,
            mt: 6,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              title: "Advanced AI Models",
              description:
                "Powered by state-of-the-art language models for accurate detection",
            },
            {
              title: "Privacy First",
              description:
                "Secure processing with data privacy as our top priority",
            },
          ].map((feature) => (
            <Paper
              key={feature.title}
              sx={{
                p: 3,
                borderRadius: 2,
                flex: "1 1 250px",
                minWidth: "250px",
                maxWidth: "350px",
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "#1F2937",
                  mb: 1.5,
                  fontSize: isMobile ? "1rem" : "1.1rem",
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#6B7280",
                  fontSize: isMobile ? "0.875rem" : "0.9375rem",
                }}
              >
                {feature.description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </StyledCard>

      <Dialog
        open={isModalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: isMobile ? "95%" : "500px",
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Choose an option
            </Typography>
            <IconButton onClick={handleModalClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2 }}>
            <OptionButton component="label" startIcon={<CloudUploadIcon />}>
              Upload from Device
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
        onSave={handleRecordingSave}
      />
    </Box>
  );
};

export default LandingPage;
