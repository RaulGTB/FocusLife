'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('green');

  useEffect(() => {
    const savedTheme = localStorage.getItem('focuslife-theme') || 'dark';
    const savedAccent = localStorage.getItem('focuslife-accent') || 'green';
    setTheme(savedTheme);
    setAccent(savedAccent);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedAccent !== 'green') {
      document.documentElement.setAttribute('data-accent', savedAccent);
    }
  }, []);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('focuslife-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const changeAccent = (newAccent) => {
    setAccent(newAccent);
    localStorage.setItem('focuslife-accent', newAccent);
    if (newAccent === 'green') {
      document.documentElement.removeAttribute('data-accent');
    } else {
      document.documentElement.setAttribute('data-accent', newAccent);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, changeAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}
