import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Button,
  useTheme,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MicIcon from "@mui/icons-material/Mic";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const MainWindow = ({
  audioFiles,
  transcriptionResults,
  isProcessing,
  selectedCapabilities,
  currentFileIndex,
  onNext,
  onPrev,
}) => {
  const theme = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRedactedPlaying, setIsRedactedPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [redactedCurrentTime, setRedactedCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [redactedDuration, setRedactedDuration] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isRedactedLoading, setIsRedactedLoading] = useState(false);
  const [redactedError, setRedactedError] = useState(null);
  const audioRef = useRef(null);
  const redactedAudioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const redactedAudioUrlRef = useRef(null);
  const progressBarRef = useRef(null);
  const redactedProgressBarRef = useRef(null);

  const currentResult = transcriptionResults?.[currentFileIndex];
  const currentAudioFile = audioFiles?.[currentFileIndex];

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    audioRef.current.addEventListener("error", handleError);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioRef.current.removeEventListener("ended", () =>
          setIsPlaying(false)
        );
        audioRef.current.removeEventListener("error", handleError);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
        }
      }
    };
  }, []);

  // Handle audio source changes
  useEffect(() => {
    if (currentAudioFile && audioRef.current) {
      const url = URL.createObjectURL(currentAudioFile);
      audioRef.current.src = url;
      audioRef.current.load();

      const handleLoad = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      };

      audioRef.current.addEventListener("loadedmetadata", handleLoad);
      audioRef.current.addEventListener("durationchange", handleLoad);

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
          setIsPlaying(false);
          audioRef.current.removeEventListener("loadedmetadata", handleLoad);
          audioRef.current.removeEventListener("durationchange", handleLoad);
        }
        URL.revokeObjectURL(url);
      };
    }
  }, [currentAudioFile]);

  // Update progress bar container width
  useEffect(() => {
    if (progressBarRef.current) {
      setContainerWidth(progressBarRef.current.offsetWidth);
    }
  }, [currentAudioFile]);

  const handleError = (error) => {
    console.error("Audio error:", error);
    setIsPlaying(false);
  };

  const handlePlayPause = async () => {
    try {
      if (!audioRef.current) return;

      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        // Reset the audio if it's ended
        if (audioRef.current.ended) {
          audioRef.current.currentTime = 0;
        }
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error playing/pausing audio:", error);
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressBarClick = (e) => {
    if (!audioRef.current) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = async () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error("Error restarting audio:", error);
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const formatEntityType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatEntityValue = (entity) => {
    if (entity.entity_type === "PHONE-NO") {
      const phone = entity.word.replace(/[^0-9]/g, "");
      if (phone.length === 10) {
        return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
      }
    }
    return entity.word;
  };

  const calculateProgressWidth = () => {
    if (!duration || isNaN(duration) || duration <= 0) return 0;
    const percentage = (currentTime / duration) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0 and 100
  };

  // Initialize redacted audio element
  useEffect(() => {
    redactedAudioRef.current = new Audio();
    redactedAudioRef.current.addEventListener(
      "timeupdate",
      handleRedactedTimeUpdate
    );
    redactedAudioRef.current.addEventListener(
      "loadedmetadata",
      handleRedactedLoadedMetadata
    );
    redactedAudioRef.current.addEventListener("ended", () =>
      setIsRedactedPlaying(false)
    );
    redactedAudioRef.current.addEventListener("error", handleRedactedError);

    return () => {
      if (redactedAudioRef.current) {
        redactedAudioRef.current.pause();
        redactedAudioRef.current.removeEventListener(
          "timeupdate",
          handleRedactedTimeUpdate
        );
        redactedAudioRef.current.removeEventListener(
          "loadedmetadata",
          handleRedactedLoadedMetadata
        );
        redactedAudioRef.current.removeEventListener("ended", () =>
          setIsRedactedPlaying(false)
        );
        redactedAudioRef.current.removeEventListener(
          "error",
          handleRedactedError
        );
        if (redactedAudioUrlRef.current) {
          URL.revokeObjectURL(redactedAudioUrlRef.current);
        }
      }
    };
  }, []);

  // Handle redacted audio source changes
  useEffect(() => {
    const fetchRedactedAudio = async () => {
      if (currentResult?.redacted_audio_url && redactedAudioRef.current) {
        setIsRedactedLoading(true);
        setRedactedError(null);
        try {
          // Fetch the audio file from the API endpoint
          const response = await fetch(
            `http://127.0.0.1:5000${currentResult.redacted_audio_url}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch redacted audio");
          }

          // Convert the response to a blob
          const audioBlob = await response.blob();

          // Create a URL for the blob
          const audioUrl = URL.createObjectURL(audioBlob);

          // Store the URL reference for cleanup
          redactedAudioUrlRef.current = audioUrl;

          // Set the audio source
          redactedAudioRef.current.src = audioUrl;
          redactedAudioRef.current.load();

          const handleLoad = () => {
            if (
              redactedAudioRef.current &&
              !isNaN(redactedAudioRef.current.duration)
            ) {
              setRedactedDuration(redactedAudioRef.current.duration);
            }
          };

          redactedAudioRef.current.addEventListener(
            "loadedmetadata",
            handleLoad
          );
          redactedAudioRef.current.addEventListener(
            "durationchange",
            handleLoad
          );

          setIsRedactedLoading(false);

          return () => {
            if (redactedAudioRef.current) {
              redactedAudioRef.current.pause();
              redactedAudioRef.current.src = "";
              setIsRedactedPlaying(false);
              redactedAudioRef.current.removeEventListener(
                "loadedmetadata",
                handleLoad
              );
              redactedAudioRef.current.removeEventListener(
                "durationchange",
                handleLoad
              );
            }
            // Clean up the blob URL
            if (redactedAudioUrlRef.current) {
              URL.revokeObjectURL(redactedAudioUrlRef.current);
            }
          };
        } catch (error) {
          console.error("Error fetching redacted audio:", error);
          setRedactedError(error.message);
          setIsRedactedLoading(false);
        }
      }
    };

    fetchRedactedAudio();
  }, [currentResult?.redacted_audio_url]);

  const handleRedactedError = (error) => {
    console.error("Redacted audio error:", error);
    setIsRedactedPlaying(false);
  };

  const handleRedactedPlayPause = async () => {
    try {
      if (!redactedAudioRef.current) return;

      if (isRedactedPlaying) {
        await redactedAudioRef.current.pause();
      } else {
        if (redactedAudioRef.current.ended) {
          redactedAudioRef.current.currentTime = 0;
        }
        await redactedAudioRef.current.play();
      }
      setIsRedactedPlaying(!isRedactedPlaying);
    } catch (error) {
      console.error("Error playing/pausing redacted audio:", error);
      setIsRedactedPlaying(false);
    }
  };

  const handleRedactedTimeUpdate = () => {
    if (redactedAudioRef.current) {
      setRedactedCurrentTime(redactedAudioRef.current.currentTime);
    }
  };

  const handleRedactedLoadedMetadata = () => {
    if (redactedAudioRef.current) {
      setRedactedDuration(redactedAudioRef.current.duration);
    }
  };

  const handleRedactedProgressBarClick = (e) => {
    if (!redactedAudioRef.current) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    const newTime = percentage * redactedDuration;
    redactedAudioRef.current.currentTime = newTime;
    setRedactedCurrentTime(newTime);
  };

  const handleRedactedRestart = async () => {
    if (!redactedAudioRef.current) return;

    redactedAudioRef.current.currentTime = 0;
    setRedactedCurrentTime(0);
    if (isRedactedPlaying) {
      try {
        await redactedAudioRef.current.play();
      } catch (error) {
        console.error("Error restarting redacted audio:", error);
        setIsRedactedPlaying(false);
      }
    }
  };

  const calculateRedactedProgressWidth = () => {
    if (!redactedDuration || isNaN(redactedDuration) || redactedDuration <= 0)
      return 0;
    const percentage = (redactedCurrentTime / redactedDuration) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const EmptyState = () => (
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        maxWidth: 600,
        textAlign: "center",
        px: 2,
      }}
    >
      <MicIcon
        sx={{ fontSize: 64, color: "primary.main", opacity: 0.8, mb: 2 }}
      />
      <Typography
        variant="h5"
        sx={{ mb: 1, color: "text.primary", fontWeight: 600 }}
      >
        Ready to Process Audio
      </Typography>
      <Typography
        variant="body1"
        sx={{ maxWidth: 500, color: "text.secondary", mx: "auto", mb: 4 }}
      >
        Upload audio files to start transcribing and detecting sensitive
        information. We'll help you identify and protect personal data.
      </Typography>
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          border: "2px dashed",
          borderColor: "primary.main",
          borderRadius: 2,
          backgroundColor: "primary.main",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100%",
          maxWidth: 320,
          mx: "auto",
        }}
      >
        <CloudUploadIcon sx={{ color: "primary.main" }} />
        <Typography sx={{ color: "primary.main", fontWeight: 500 }}>
          Drag & drop or click to upload
        </Typography>
      </Box>
    </Box>
  );

  const groupedEntities =
    currentResult?.entities?.reduce((acc, entity) => {
      const type = entity.entity_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(entity);
      return acc;
    }, {}) || {};

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3, md: 4 },
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        overflowY: "auto",
      }}
    >
      {!transcriptionResults ? (
        <EmptyState />
      ) : (
        <>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 500, color: "primary.main" }}
            >
              File {currentFileIndex + 1} of {audioFiles.length}:{" "}
              {currentResult?.filename || currentAudioFile?.name}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBeforeIcon />}
                onClick={onPrev}
                disabled={currentFileIndex === 0}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: theme.palette.grey[300],
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                endIcon={<NavigateNextIcon />}
                onClick={onNext}
                disabled={currentFileIndex === audioFiles.length - 1}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  borderColor: theme.palette.grey[300],
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>

          {currentAudioFile && (
            <Box
              sx={{
                mb: 4,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 2,
                p: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  onClick={handlePlayPause}
                  disabled={!currentAudioFile}
                >
                  {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton
                  onClick={handleRestart}
                  disabled={!currentAudioFile}
                >
                  <RestartAltIcon />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 45 }}>
                  {formatTime(currentTime)}
                </Typography>
                <Box
                  ref={progressBarRef}
                  onClick={handleProgressBarClick}
                  sx={{
                    flexGrow: 1,
                    height: "4px",
                    backgroundColor: theme.palette.grey[200],
                    cursor: "pointer",
                    position: "relative",
                    borderRadius: 2,
                    width: "100%", // Ensure container takes full width
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: `${calculateProgressWidth()}%`,
                      backgroundColor: "primary.main",
                      borderRadius: 2,
                      transition: "width 0.1s linear",
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 45 }}>
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>
          )}

          {isProcessing ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                py: 8,
              }}
            >
              <CircularProgress size={48} />
              <Typography variant="h6" sx={{ color: "text.secondary" }}>
                Processing your audio...
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
                >
                  Transcript
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    backgroundColor: theme.palette.grey[50],
                    p: 3,
                    borderRadius: 2,
                    lineHeight: 1.7,
                  }}
                >
                  {currentResult?.transcript}
                </Typography>
              </Box>

              {Object.keys(groupedEntities).length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
                  >
                    Identified Entities
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: 3,
                      backgroundColor: theme.palette.grey[50],
                      p: 3,
                      borderRadius: 2,
                    }}
                  >
                    {Object.entries(groupedEntities).map(([type, entities]) => (
                      <Box key={type}>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "primary.main", mb: 2, fontWeight: 500 }}
                        >
                          {formatEntityType(type)}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {entities.map((entity, index) => (
                            <Typography
                              key={index}
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                backgroundColor: "background.paper",
                                p: 1,
                                px: 2,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              {formatEntityValue(entity)}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {selectedCapabilities?.includes("redaction") &&
                currentResult?.redacted_transcript && (
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
                    >
                      Redacted Content
                    </Typography>

                    {/* Redacted Audio Player */}
                    <Box
                      sx={{
                        mb: 4,
                        backgroundColor: theme.palette.grey[50],
                        borderRadius: 2,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 2, color: "text.secondary" }}
                      >
                        Redacted Audio
                      </Typography>
                      {isRedactedLoading ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <CircularProgress size={20} />
                          <Typography variant="body2" color="text.secondary">
                            Loading redacted audio...
                          </Typography>
                        </Box>
                      ) : redactedError ? (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ mb: 2 }}
                        >
                          Error loading redacted audio: {redactedError}
                        </Typography>
                      ) : (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IconButton
                            onClick={handleRedactedPlayPause}
                            disabled={
                              !currentResult?.redacted_audio_url ||
                              isRedactedLoading
                            }
                          >
                            {isRedactedPlaying ? (
                              <PauseIcon />
                            ) : (
                              <PlayArrowIcon />
                            )}
                          </IconButton>
                          <IconButton
                            onClick={handleRedactedRestart}
                            disabled={
                              !currentResult?.redacted_audio_url ||
                              isRedactedLoading
                            }
                          >
                            <RestartAltIcon />
                          </IconButton>
                          <Typography variant="body2" sx={{ minWidth: 45 }}>
                            {formatTime(redactedCurrentTime)}
                          </Typography>
                          <Box
                            ref={redactedProgressBarRef}
                            onClick={handleRedactedProgressBarClick}
                            sx={{
                              flexGrow: 1,
                              height: "4px",
                              backgroundColor: theme.palette.grey[200],
                              cursor: isRedactedLoading ? "default" : "pointer",
                              position: "relative",
                              borderRadius: 2,
                              width: "100%",
                              opacity: isRedactedLoading ? 0.5 : 1,
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                height: "100%",
                                width: `${calculateRedactedProgressWidth()}%`,
                                backgroundColor: "primary.main",
                                borderRadius: 2,
                                transition: "width 0.1s linear",
                              }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 45 }}>
                            {formatTime(redactedDuration)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Redacted Transcript */}
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        backgroundColor: theme.palette.grey[50],
                        p: 3,
                        borderRadius: 2,
                        lineHeight: 1.7,
                      }}
                    >
                      {currentResult.redacted_transcript}
                    </Typography>
                  </Box>
                )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MainWindow;
