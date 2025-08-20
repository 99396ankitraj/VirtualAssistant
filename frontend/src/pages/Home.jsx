import React, { useContext, useEffect, useRef, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from "../assets/ai.gif";
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import { FiClock } from "react-icons/fi";
import { BsChatSquareText } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const [ham, setHam] = useState(false);
  const isRecognizingRef = useRef(false);
  const synth = window.speechSynthesis;

  const handleDeleteSingle = async (item) => {
    try {
      await axios.delete(`${serverUrl}/api/user/history/${encodeURIComponent(item)}`, { withCredentials: true });
      setUserData((prev) => ({
        ...prev,
        history: prev.history.filter((h) => h !== item),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await axios.delete(`${serverUrl}/api/user/history`, { withCredentials: true });
      setUserData((prev) => ({
        ...prev,
        history: [],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {
    if (!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    }
  };

  const speak = (text) => {
    const utterence = new SpeechSynthesisUtterance(text);
    utterence.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }
    isSpeakingRef.current = true;
    utterence.onend = () => {
      setAiText("");
      isSpeakingRef.current = false;
      setTimeout(() => {
        startRecognition();
      }, 800);
    };
    synth.cancel();
    synth.speak(utterence);
  };

  const handleCommand = (data) => {
    const { type, userInput, response } = data;
    speak(response);
    if (type === 'google-search') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
    if (type === 'calculator-open') {
      window.open(`https://www.google.com/search?q=calculator`, '_blank');
    }
    if (type === "instagram-open") {
      window.open(`https://www.instagram.com/`, '_blank');
    }
    if (type === "facebook-open") {
      window.open(`https://www.facebook.com/`, '_blank');
    }
    if (type === "weather-show") {
      window.open(`https://www.google.com/search?q=weather`, '_blank');
    }
    if (type === 'youtube-search' || type === 'youtube-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    }
    if (type === "youtube-open") {
      window.open(`https://www.youtube.com/`, '_blank');
    }
    if (type === "watsapp-open") {
      window.open(`https://web.whatsapp.com/`, '_blank');
    }
    if (type === "cricbuzz-open") {
      window.open(`https://www.cricbuzz.com/`, '_blank');
    }
    if (type === "Netflix-open") {
      window.open(`https://www.netflix.com/`, '_blank');
    }
    if (type === 'Netflix-search' || type === 'Netflix-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.netflix.com/search?q=${query}`, '_blank');
    }
    if (type === "Hotstar-open") {
      window.open(`https://www.hotstar.com/`, '_blank');
    }
    if (type === 'Hotstar-search' || type === 'Hotstar-play') {
      const query = encodeURIComponent(userInput);
      window.open(`https://www.hotstar.com/in/search?q=${query}`, '_blank');
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    let isMounted = true;
    const startTimeout = setTimeout(() => {
      if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
        try {
          recognition.start();
        } catch (e) {
          if (e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);
    recognition.onstart = () => {
      isRecognizingRef.current = true;
      setListening(true);
    };
    recognition.onend = () => {
      isRecognizingRef.current = false;
      setListening(false);
      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };
    recognition.onerror = (event) => {
      isRecognizingRef.current = false;
      setListening(false);
      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if (isMounted) {
            try {
              recognition.start();
            } catch (e) {
              if (e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };
    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);
        const data = await getGeminiResponse(transcript);
        handleCommand(data);
        setAiText(data.response);
        setUserText("");
      }
    };
    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
    window.speechSynthesis.speak(greeting);
    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
    };
  }, []);

  const bubbleBtnClass =
    "min-w-[150px] h-[60px] font-semibold text-white rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 animate-bubble";

  return (
    <>
      <style>
        {`
          @keyframes bubble {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-6px) scale(1.02); }
          }
          .animate-bubble {
            animation: bubble 3s ease-in-out infinite;
          }
        `}
      </style>
      <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
        <CgMenuRight
          className='text-white absolute top-[20px] right-[20px] w-[42px] h-[42px] cursor-pointer hover:scale-110 transition-transform duration-300'
          onClick={() => setHam(true)}
        />
        <div
          className={`absolute top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform`}
        >
          <RxCross1
            className=' text-white absolute top-[20px] right-[20px] w-[28px] h-[28px] cursor-pointer hover:text-red-400 transition-colors'
            onClick={() => setHam(false)}
          />
          <button className={bubbleBtnClass} onClick={handleLogOut}>Log Out</button>
          <button className={bubbleBtnClass} onClick={() => navigate("/customize")}>Customize your Assistant</button>
          <div className='w-full h-[2px] bg-gray-400'></div>
          <h1 className='text-white font-semibold text-[19px] flex items-center gap-2'>
            <FiClock className='text-sky-400' /> History
          </h1>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 text-sm font-medium mb-3"
          >
            Delete All
          </button>
          <div className='w-full max-h-[400px] gap-[12px] overflow-y-auto flex flex-col pr-1 custom-scroll'>
            {userData.history?.length === 0 && (
              <span className="text-gray-400 text-sm">No history yet.</span>
            )}
            {userData.history?.map((his, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between gap-3 p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer border border-white/10'
              >
                <div className="flex items-center gap-3">
                  <BsChatSquareText className='text-sky-300' size={18} />
                  <span className='text-gray-200 text-[16px] truncate'>{his}</span>
                </div>
                <FiTrash2
                  size={18}
                  className='text-red-400 hover:text-red-300 cursor-pointer transition-colors'
                  onClick={() => handleDeleteSingle(his)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
          <img src={userData?.assistantImage} alt="" className='h-full object-cover' />
        </div>
        <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
        {!aiText && <img src={userImg} alt="" className='w-[200px]' />}
        {aiText && <img src={aiImg} alt="" className='w-[200px]' />}
        <h1 className='text-white text-[18px] font-semibold text-wrap'>
          {userText ? userText : aiText ? aiText : null}
        </h1>
      </div>
    </>
  );
}

export default Home;
