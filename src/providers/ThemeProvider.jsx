import { useState, useMemo, useCallback } from 'react';
import { Theme } from '@radix-ui/themes';
import { ThemeContext } from './ThemeContext';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  });

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('app-font-size');
    return saved ? parseInt(saved, 10) : 16;
  });

  const [titleFontSize, setTitleFontSize] = useState(() => {
    const saved = localStorage.getItem('app-title-font-size');
    return saved ? parseInt(saved, 10) : 32;
  });

  const [noteColor, setNoteColor] = useState(() => {
    const saved = localStorage.getItem('app-note-color');
    return saved || 'surface';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('app-theme', newTheme);
      return newTheme;
    });
  }, []);

  const updateFontSize = useCallback((size) => {
    setFontSize(size);
    localStorage.setItem('app-font-size', size.toString());
  }, []);

  const updateTitleFontSize = useCallback((size) => {
    setTitleFontSize(size);
    localStorage.setItem('app-title-font-size', size.toString());
  }, []);

  const updateNoteColor = useCallback((color) => {
    setNoteColor(color);
    localStorage.setItem('app-note-color', color);
  }, []);

  const contextValue = useMemo(() => ({
    theme, 
    toggleTheme, 
    fontSize, 
    updateFontSize, 
    titleFontSize, 
    updateTitleFontSize, 
    noteColor, 
    updateNoteColor
  }), [theme, toggleTheme, fontSize, updateFontSize, titleFontSize, updateTitleFontSize, noteColor, updateNoteColor]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <Theme 
        appearance={theme} 
        accentColor="gray" 
        grayColor="slate" 
        radius="none"
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}
      >
        {children}
      </Theme>
    </ThemeContext.Provider>
  );
}

