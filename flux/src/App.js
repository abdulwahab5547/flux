import './App.css';
import React, { useState, useEffect } from 'react';
import Home from './Components/Home.js'
import Login from './Components/Login.js'
import Register from './Components/Register.js'
import Start from './Components/Start.js'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState(true);

  

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };


  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  // useEffect(() => {
  //   // Check if token exists in localStorage to set logged-in state
  //   const token = localStorage.getItem('authToken');
  //   if (token) {
  //     setIsLoggedIn(true);
  //   } else {
  //     setIsLoggedIn(false);
  //   }
  // }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
}, [isDarkMode]);

  const lightModeColors = {
    mainBackground: '#ffffff', // Light background for main content
    mainText: '#333333',       // Dark text for main content
    sidebarBackground: '#FCFAF8', // Light background for sidebar
    sidebarText: '#333333',    // Dark text for sidebar
    iconHover: '#FEEFE5',
  };

  const darkModeColors = {
    mainBackground: '#333333', // Dark background for main content
    mainText: '#ffffff',       // Light text for main content
    sidebarBackground: '#1a1a1a', // Darker background for sidebar
    sidebarText: '#ffffff',    // Light text for sidebar
    iconHover: '#555555', 
  };

  const currentColors = isDarkMode ? darkModeColors : lightModeColors;

  return (
    <Router>
      <div style={{color: currentColors.mainText, backgroundColor: currentColors.mainBackground}} className='app'>
        <Routes>
          <Route path="/" element={<Navigate to="/start" />} />
          <Route path="/home/*" element={<Home changeTheme={toggleTheme} colors={currentColors} isDarkMode={isDarkMode}/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/start" element={<Start />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
