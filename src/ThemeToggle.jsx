import { IconButton } from "@radix-ui/themes";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useContext } from "react";
import { ThemeContext } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <IconButton 
      variant="soft" 
      color="gray" 
      onClick={toggleTheme} 
      style={{ cursor: "pointer" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
