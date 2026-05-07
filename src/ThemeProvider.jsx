import React, { createContext, useState, useEffect } from 'react';
import { Theme } from '@radix-ui/themes';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
