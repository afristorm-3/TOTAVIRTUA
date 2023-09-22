import React, { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar;
import './App.css';

// Amplify
import { Amplify, API } from "aws-amplify";

import {
  Box,
  Button,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Switch,
  TextField,
  Typography
} from '@mui/material';

// Material ui icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MicIcon from '@mui/icons-material/Mic';
import MicRecorder from 'mic-recorder-to-mp3';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SendIcon from "@mui/icons-material/Send";
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

import { useTheme } from '@mui/material/styles';
import { keyframes, styled } from '@mui/system';

// Component for audio controls
const AudioControls = ({ isAudioResponse, filterMessageObjects, messages, setMessages, handleBackendResponse }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const [player, setPlayer] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // Function to start recording audio
  const startRecording = async () => {
    const newRecorder = new MicRecorder({ bitRate: 128 });

    try {
      await newRecorder.start();
      setIsRecording(true);
      setRecorder(newRecorder);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  // Function to stop recording audio
  const stopRecording = async () => {
    if (!recorder) return;

    try {
      const [buffer, blob] = await recorder.stop().getMp3();
      const audioFile = new File(buffer, "voice-message.mp3", {
        type: blob.type,
        lastModified: Date.now(),
      });
      setPlayer(new Audio(URL.createObjectURL(audioFile)));
      setIsRecording(false);
      setAudioFile(audioFile); // Add this line
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  // Function to play the recorded audio
  const playRecording = () => {
    if (player) {
      player.play();
    }
  };

  // Configure Amplify
  Amplify.configure({
    // OPTIONAL - if your API requires authentication 
    Auth: {
      mandatorySignIn: false,
    },
    API: {
      endpoints: [
        {
          name: "api",
          endpoint: "https://https://xxxxxxx.execute-api.sa-east-1.amazonaws.com/dev"
        }
      ]
    }
  });

  return (
    <Container>
      <Box sx={{ width: "100%", mt: 4 }}>
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={12} md>
            <IconButton
              color="primary"
              aria-label="start recording"
              onClick={startRecording}
              disabled={isRecording}
            >
              <MicIcon />
            </IconButton>
          </Grid>
          <Grid item xs={12} md>
            <IconButton
              color="secondary"
              aria-label="stop recording"
              onClick={stopRecording}
              disabled={!isRecording}
            >
              <FiberManualRecordIcon />
            </IconButton>
          </Grid>
          <Grid item xs="auto">
            <Button
              variant="contained"
              disableElevation
              color="primary"
              startIcon={<SendIcon />}
              onClick={() => {
                if (isAudioResponse) {
                  // Convert the recorded audio to base64 and send it to the backend
                  if (audioFile) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const audioData = reader.result.split(",")[1];
                      handleBackendResponse(audioData);
                    };
                    reader.readAsDataURL(audioFile);
                  } else {
                    alert("Please record an audio message before sending.");
                  }
                } else {
                  // Send a regular text message to the backend
                  handleBackendResponse("");
                }
              }}
            >
              Send
            </Button>
          </Grid>
          <Grid item xs="auto">
            <IconButton
              color="primary"
              aria-label="play recorded message"
              onClick={playRecording}
              disabled={!audioFile}
            >
              <VolumeUpIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

// Function to filter and process message objects
const filterMessageObjects = (messages) => {
  return messages
    .map((message) => {
      const { bot, message: content, audio } = message;

      // Check if the message contains an audio response
      const isAudioResponse = !!audio;

      // Extract relevant information from the message object
      return {
        bot,
        content,
        isAudioResponse,
      };
    });
};

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  // Function to handle the backend response
  const handleBackendResponse = async (audioData) => {
    try {
      // Make a POST request to the backend API
      const response = await API.post("api", "/chat", {
        body: {
          content: inputText,
          audio: audioData, // Add this line
        },
      });

      // Process the response and update the chat messages
      const filteredMessages = filterMessageObjects(response.messages);
      setMessages((prevMessages) => [...prevMessages, ...filteredMessages]);

      // Clear the input field
      setInputText("");
    } catch (error) {
      console.error(error);
      alert("Error occurred while sending message.");
    }
  };

  return (
    <div className="App">
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Chat App
      </Typography>
      <Paper elevation={3} className="chat-container">
        <List>
          <ChatMessages messages={messages} />
        </List>
      </Paper>
      <MessageInput
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleBackendResponse}
      />
      <AudioControls
        isAudioResponse={messages[messages.length - 1]?.isAudioResponse}
        filterMessageObjects={filterMessageObjects}
        messages={messages}
        setMessages={setMessages}
        handleBackendResponse={handleBackendResponse}
      />
    </div>
  );
};

// Component for rendering chat messages
const ChatMessages = ({ messages }) => {
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {messages.map((message, index) => (
        <ListItem
          key={index}
          sx={{
            display: "flex",
            justifyContent: message.bot ? "flex-start" : "flex-end",
          }}
        >
          <ListItemText
            sx={{
              borderRadius: "10px",
              maxWidth: "70%",
              padding: "8px 16px",
              backgroundColor: message.bot
                ? theme.palette.grey[300]
                : theme.palette.primary.main,
              color: message.bot ? theme.palette.text.primary : "white",
            }}
          >
            {message.content}
          </ListItemText>
        </ListItem>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

// Component for the user input field
const MessageInput = ({ inputText, setInputText, handleSendMessage }) => {
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage("");
    }
  };

  return (
    <TextField
      label="Type a message"
      variant="outlined"
      fullWidth
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      onKeyPress={handleKeyPress}
      sx={{ marginTop: "16px" }}
    />
  );
};

export default App;

