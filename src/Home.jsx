import { supabase } from "./SupaBaseClient";
import { Container, Flex, Heading, Button, Box, TextField, TextArea, Card, Grid, Text, IconButton, Callout } from "@radix-ui/themes";
import { PlusIcon, TrashIcon, ExitIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";

export default function Home({ session }) {
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    async function checkVerification() {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', session.user.id)
        .single();
        
      if (!error && data) {
        // Fallback to false if not strictly true, just in case
        setIsVerified(data.is_verified === true);
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
        <Button variant="surface" color="gray" onClick={handleSignOut} style={{ cursor: "pointer" }}>
          <ExitIcon />
          Sign Out
        </Button>
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

      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
        <Card size="2" variant="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <Heading size="4" mb="2">Welcome Note</Heading>
          <Text as="p" size="3" color="gray" mb="4" style={{ flexGrow: 1 }}>
            This is a scaffold for your home page using Radix UI. The sign out button works!
          </Text>
          <Flex justify="between" align="center" mt="auto" pt="4">
            <Text size="2" color="gray">Today</Text>
            <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
              <TrashIcon />
            </IconButton>
          </Flex>
        </Card>

        <Card size="2" variant="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <Heading size="4" mb="2">Meeting Notes</Heading>
          <Text as="p" size="3" color="gray" mb="4" style={{ flexGrow: 1 }}>
            Discuss project roadmap and new features for Q3. Remember to bring the presentation slides.
          </Text>
          <Flex justify="between" align="center" mt="auto" pt="4">
            <Text size="2" color="gray">Yesterday</Text>
            <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
              <TrashIcon />
            </IconButton>
          </Flex>
        </Card>

        <Card size="2" variant="surface" style={{ display: 'flex', flexDirection: 'column' }}>
          <Heading size="4" mb="2">Ideas</Heading>
          <Text as="p" size="3" color="gray" mb="4" style={{ flexGrow: 1, whiteSpace: "pre-wrap" }}>
            - Add dark mode support{"\n"}- Migrate to Radix UI Themes{"\n"}- Integrate Supabase DB
          </Text>
          <Flex justify="between" align="center" mt="auto" pt="4">
            <Text size="2" color="gray">Oct 24</Text>
            <IconButton color="red" variant="soft" size="2" style={{ cursor: "pointer" }}>
              <TrashIcon />
            </IconButton>
          </Flex>
        </Card>
      </Grid>
    </Container>
  );
}
