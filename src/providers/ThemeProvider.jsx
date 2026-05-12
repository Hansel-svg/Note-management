import React, { createContext, useState, useEffect } from 'react';
import { Theme } from '@radix-ui/themes';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState(16);
  const [titleFontSize, setTitleFontSize] = useState(32);
  const [noteColor, setNoteColor] = useState('surface');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
      }
    }

    const savedFontSize = localStorage.getItem('app-font-size');
    if (savedFontSize) setFontSize(parseInt(savedFontSize, 10));

    const savedTitleFontSize = localStorage.getItem('app-title-font-size');
    if (savedTitleFontSize) setTitleFontSize(parseInt(savedTitleFontSize, 10));

    const savedNoteColor = localStorage.getItem('app-note-color');
    if (savedNoteColor) setNoteColor(savedNoteColor);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    localStorage.setItem('app-font-size', size.toString());
  };

  const updateTitleFontSize = (size) => {
    setTitleFontSize(size);
    localStorage.setItem('app-title-font-size', size.toString());
  };

  const updateNoteColor = (color) => {
    setNoteColor(color);
    localStorage.setItem('app-note-color', color);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, updateFontSize, titleFontSize, updateTitleFontSize, noteColor, updateNoteColor }}>
      <Theme 
        appearance={theme} 
        accentColor="cyan" 
        grayColor="slate" 
        radius="large"
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}
