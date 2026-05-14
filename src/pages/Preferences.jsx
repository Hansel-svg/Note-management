import { Container, Card, Flex, Heading, Text, Box, Switch, Slider, Select, Button, Avatar } from "@radix-ui/themes";
import { ArrowLeftIcon, UploadIcon } from "@radix-ui/react-icons";
import { useLocation } from "wouter";
import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../providers/ThemeContext";
import { supabase } from "../lib/SupaBaseClient";

export default function Preferences({ session }) {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme, fontSize, updateFontSize, titleFontSize, updateTitleFontSize, noteColor, updateNoteColor } = useContext(ThemeContext);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, default_font_size, default_title_font_size, default_note_color')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
        if (data.default_font_size) updateFontSize(data.default_font_size);
        if (data.default_title_font_size) updateTitleFontSize(data.default_title_font_size);
        if (data.default_note_color) updateNoteColor(data.default_note_color);
      }
    }
    loadProfile();
  }, [session, updateFontSize, updateTitleFontSize, updateNoteColor]);

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container size="2" py="6" px="4">
      <Flex direction={{ initial: 'column', sm: 'row' }} align={{ initial: 'start', sm: 'center' }} gap="4" mb="6">
        <Button variant="outline" color="gray" onClick={() => setLocation("/")} style={{ cursor: "pointer", borderRadius: 0, fontWeight: 700, borderColor: 'var(--border)', color: 'var(--text-h)' }}>
          <ArrowLeftIcon />
          BACK
        </Button>
        <Heading size={{ initial: '7', sm: '8' }} as="h1" style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.04em', margin: 0 }}>
          USER PREFERENCES
        </Heading>
      </Flex>

      <Card size="4" variant="surface" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
        <Flex direction="column" gap="6">

          <Box>
            <Flex justify="between" align="center">
              <Box>
                <Text as="div" size="4" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-h)' }} mb="1">Profile Picture</Text>
                <Text as="div" size="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6, color: 'var(--text)' }}>Upload a custom avatar</Text>
              </Box>
              <Flex gap="4" align="center">
                <Avatar
                  size="5"
                  src={avatarUrl}
                  fallback={session?.user?.email?.charAt(0).toUpperCase() || "?"}
                  radius="none"
                  style={{ border: '1.5px solid var(--border)' }}
                />
                <Button 
                  variant="solid" 
                  color="gray" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  style={{ cursor: "pointer", borderRadius: 0, fontWeight: 800, textTransform: 'uppercase', backgroundColor: 'var(--text-h)', color: 'var(--bg)' }}
                >
                  <UploadIcon />
                  {uploading ? 'UPLOADING...' : 'UPLOAD'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </Flex>
            </Flex>
          </Box>

          <Box>
            <Flex justify="between" align="center">
              <Box>
                <Text as="div" size="4" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-h)' }} mb="1">Appearance</Text>
                <Text as="div" size="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6, color: 'var(--text)' }}>Toggle between light and dark mode</Text>
              </Box>
              <Switch 
                size="3" 
                checked={theme === "dark"} 
                onCheckedChange={toggleTheme} 
                style={{ cursor: "pointer", borderRadius: 0 }}
              />
            </Flex>
          </Box>

          <Box>
            <Flex justify="between" align="center" mb="3">
              <Box>
                <Text as="div" size="4" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-h)' }} mb="1">Note Font Size</Text>
                <Text as="div" size="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6, color: 'var(--text)' }}>Adjust the text size in your notes</Text>
              </Box>
              <Text size="3" style={{ fontWeight: 900, color: 'var(--text-h)' }}>{fontSize}PX</Text>
            </Flex>
            <Slider 
              value={[fontSize]} 
              onValueChange={(val) => updateFontSize(val[0])} 
              onValueCommit={async (val) => {
                if (session?.user?.id) {
                  await supabase.from('profiles').update({ default_font_size: val[0] }).eq('id', session.user.id);
                }
              }}
              min={12} 
              max={24} 
              step={1} 
              style={{ cursor: "pointer" }}
            />
          </Box>

          <Box>
            <Flex justify="between" align="center" mb="3">
              <Box>
                <Text as="div" size="4" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-h)' }} mb="1">Title Font Size</Text>
                <Text as="div" size="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6, color: 'var(--text)' }}>Adjust the text size for note titles</Text>
              </Box>
              <Text size="3" style={{ fontWeight: 900, color: 'var(--text-h)' }}>{titleFontSize}PX</Text>
            </Flex>
            <Slider 
              value={[titleFontSize]} 
              onValueChange={(val) => updateTitleFontSize(val[0])} 
              onValueCommit={async (val) => {
                if (session?.user?.id) {
                  await supabase.from('profiles').update({ default_title_font_size: val[0] }).eq('id', session.user.id);
                }
              }}
              min={16} 
              max={48} 
              step={1} 
              style={{ cursor: "pointer" }}
            />
          </Box>

          <Box>
            <Flex justify="between" align="center">
              <Box>
                <Text as="div" size="4" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: 'var(--text-h)' }} mb="1">Note Color</Text>
                <Text as="div" size="2" style={{ fontWeight: 600, textTransform: 'uppercase', opacity: 0.6, color: 'var(--text)' }}>Choose the background color for all notes</Text>
              </Box>
              <Select.Root value={noteColor} onValueChange={async (val) => {
                updateNoteColor(val);
                if (session?.user?.id) {
                  await supabase.from('profiles').update({ default_note_color: val }).eq('id', session.user.id);
                }
              }}>
                <Select.Trigger style={{ width: "120px", cursor: "pointer" }} />
                <Select.Content>
                  <Select.Group>
                    <Select.Item value="surface" style={{ cursor: "pointer" }}>DEFAULT</Select.Item>
                    <Select.Item value="yellow" style={{ cursor: "pointer" }}>YELLOW</Select.Item>
                    <Select.Item value="blue" style={{ cursor: "pointer" }}>BLUE</Select.Item>
                    <Select.Item value="green" style={{ cursor: "pointer" }}>GREEN</Select.Item>
                    <Select.Item value="pink" style={{ cursor: "pointer" }}>PINK</Select.Item>
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
