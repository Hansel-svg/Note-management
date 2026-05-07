import { Container, Card, Flex, Heading, Text, Box, Switch, Slider, Select, Button } from "@radix-ui/themes";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useLocation } from "wouter";
import { useContext, useState } from "react";
import { ThemeContext } from "./ThemeProvider";

export default function Preferences() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Non-functional states for now
  const [fontSize, setFontSize] = useState([16]);
  const [noteColor, setNoteColor] = useState("yellow");

  return (
    <Container size="2" py="6" px="4">
      <Flex align="center" gap="4" mb="6">
        <Button variant="ghost" color="gray" onClick={() => setLocation("/")} style={{ cursor: "pointer" }}>
          <ArrowLeftIcon />
          Back
        </Button>
        <Heading size="8" as="h1" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          User Preferences
        </Heading>
      </Flex>

      <Card size="4" variant="surface">
        <Flex direction="column" gap="6">
          
          <Box>
            <Flex justify="between" align="center">
              <Box>
                <Text as="div" size="4" weight="bold" mb="1">Appearance</Text>
                <Text as="div" size="2" color="gray">Toggle between light and dark mode</Text>
              </Box>
              <Switch 
                size="3" 
                checked={theme === "dark"} 
                onCheckedChange={toggleTheme} 
                style={{ cursor: "pointer" }}
              />
            </Flex>
          </Box>

          <Box>
            <Flex justify="between" align="center" mb="3">
              <Box>
                <Text as="div" size="4" weight="bold" mb="1">Note Font Size</Text>
                <Text as="div" size="2" color="gray">Adjust the text size in your notes (Coming Soon)</Text>
              </Box>
              <Text size="3" weight="bold">{fontSize}px</Text>
            </Flex>
            <Slider 
              value={fontSize} 
              onValueChange={setFontSize} 
              min={12} 
              max={24} 
              step={1} 
              style={{ cursor: "pointer" }}
            />
          </Box>

          <Box>
            <Flex justify="between" align="center">
              <Box>
                <Text as="div" size="4" weight="bold" mb="1">Default Note Color</Text>
                <Text as="div" size="2" color="gray">Choose the default background color for new notes (Coming Soon)</Text>
              </Box>
              <Select.Root value={noteColor} onValueChange={setNoteColor}>
                <Select.Trigger style={{ width: "120px", cursor: "pointer" }} />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value="yellow" style={{ cursor: "pointer" }}>Yellow</Select.Item>
                    <Select.Item value="blue" style={{ cursor: "pointer" }}>Blue</Select.Item>
                    <Select.Item value="green" style={{ cursor: "pointer" }}>Green</Select.Item>
                    <Select.Item value="pink" style={{ cursor: "pointer" }}>Pink</Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Box>

        </Flex>
      </Card>
    </Container>
  );
}
