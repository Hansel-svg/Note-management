import { supabase } from "./SupaBaseClient";
import { Container, Flex, Heading, Button, Box, TextField, TextArea, Card, Grid, Text, IconButton, Callout, Avatar } from "@radix-ui/themes";
import { PlusIcon, TrashIcon, ExitIcon, InfoCircledIcon, LockClosedIcon, GearIcon, GridIcon, ListBulletIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const STATIC_NOTES = [
  { id: 1, title: 'Welcome Note', content: 'This is a scaffold for your home page using Radix UI. The sign out button works!', date: 'Today' },
  { id: 2, title: 'Meeting Notes', content: 'Discuss project roadmap and new features for Q3. Remember to bring the presentation slides.', date: 'Yesterday' },
  { id: 3, title: 'Ideas', content: '- Add dark mode support\n- Migrate to Radix UI Themes\n- Integrate Supabase DB', date: 'Oct 24' },
];

export default function Home({ session }) {
  const [isVerified, setIsVerified] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function checkVerification() {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified, avatar_url')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        setIsVerified(data.is_verified === true);
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    }
    
    checkVerification();
  }, [session]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Container size="3" py="6" px="4">
      {!isVerified && (
        <Box mb="6">
          <Callout.Root color="amber" variant="surface">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Your account is not verified. Please verify your email to complete the registration process.
            </Callout.Text>
          </Callout.Root>
        </Box>
      )}

      <Flex justify="between" align="center" mb="6">
        <Heading size="8" as="h1" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Notes
        </Heading>
        <Flex gap="3" align="center">
          <Avatar
            size="3"
            src={avatarUrl}
            fallback={session?.user?.email?.charAt(0).toUpperCase() || "?"}
            radius="full"
          />
          <Button variant="soft" color="gray" onClick={() => setLocation('/preferences')} style={{ cursor: "pointer" }}>
            <GearIcon />
            Preferences
          </Button>
          <Button variant="soft" color="cyan" onClick={() => setLocation('/forgot-password')} style={{ cursor: "pointer" }}>
            <LockClosedIcon />
            Reset Password
          </Button>
          <Button variant="surface" color="gray" onClick={handleSignOut} style={{ cursor: "pointer" }}>
            <ExitIcon />
            Sign Out
          </Button>
        </Flex>
      </Flex>

      <Box mb="8">
        <Card size="3" variant="surface">
          <Flex direction="column" gap="4">
            <TextField.Root placeholder="Note title" size="3" />
            <TextArea placeholder="Take a note..." size="3" resize="vertical" style={{ minHeight: '100px' }} />
            <Flex justify="end">
              <Button size="3" color="cyan" variant="solid" style={{ cursor: "pointer" }}>
                <PlusIcon />
                Add Note
              </Button>
            </Flex>
          </Flex>
        </Card>
      </Box>

      <Flex justify="between" align="center" mb="4">
        <Heading size="6">Recent Notes</Heading>
        <Flex gap="2">
          <IconButton 
            variant={viewMode === 'grid' ? 'solid' : 'soft'} 
            color="cyan" 
            onClick={() => setViewMode('grid')}
            style={{ cursor: 'pointer' }}
          >
            <GridIcon />
          </IconButton>
          <IconButton 
            variant={viewMode === 'list' ? 'solid' : 'soft'} 
            color="cyan" 
            onClick={() => setViewMode('list')}
            style={{ cursor: 'pointer' }}
          >
            <ListBulletIcon />
          </IconButton>
        </Flex>
      </Flex>

      {viewMode === 'grid' ? (
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {STATIC_NOTES.map(note => (
            <Card key={note.id} size="2" variant="surface" style={{ display: 'flex', flexDirection: 'column' }}>
              <Heading size="4" mb="2">{note.title}</Heading>
              <Text as="p" size="3" color="gray" mb="4" style={{ flexGrow: 1, whiteSpace: "pre-wrap" }}>
                {note.content}
              </Text>
              <Flex justify="between" align="center" mt="auto" pt="4">
                <Text size="2" color="gray">{note.date}</Text>
                <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
                  <TrashIcon />
                </IconButton>
              </Flex>
            </Card>
          ))}
        </Grid>
      ) : (
        <Flex direction="column" gap="4">
          {STATIC_NOTES.map(note => (
            <Card key={note.id} size="2" variant="surface">
              <Flex justify="between" align="start">
                <Box style={{ flexGrow: 1 }}>
                  <Heading size="4" mb="2">{note.title}</Heading>
                  <Text as="p" size="3" color="gray" mb="2" style={{ whiteSpace: "pre-wrap" }}>
                    {note.content}
                  </Text>
                  <Text size="2" color="gray">{note.date}</Text>
                </Box>
                <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
                  <TrashIcon />
                </IconButton>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Container>
  );
}
