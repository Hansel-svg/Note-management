import { supabase } from "../lib/SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { useLocation, Link } from "wouter";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setErrorMsg("");

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Password updated successfully!");
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    }
    setIsLoading(false);
  };

  return (
    <Flex justify="center" align="center" style={{ minHeight: "100vh", backgroundColor: 'var(--bg)' }}>
      <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
        <Card size="4" variant="surface" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
          <form onSubmit={handleUpdate}>
            <Flex direction="column" gap="5">
              <Box style={{ textAlign: "center" }} mb="4">
                <Heading size={{ initial: '7', sm: '8' }} mb="2" style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                  NEW PASSWORD
                </Heading>
                <Text size="2" style={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>
                  Enter your new password below
                </Text>
              </Box>

              {errorMsg && (
                <Callout.Root color="gray" role="alert" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                  <Callout.Icon><InfoCircledIcon /></Callout.Icon>
                  <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>{errorMsg}</Callout.Text>
                </Callout.Root>
              )}

              {message && (
                <Callout.Root color="gray" role="status" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                  <Callout.Icon><CheckCircledIcon /></Callout.Icon>
                  <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>{message}</Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="1" mb="2" style={{ display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>
                    NEW PASSWORD
                  </Text>
                  <TextField.Root 
                    type="password" 
                    placeholder="ENTER NEW PASSWORD" 
                    required 
                    size="3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                  />
                </Box>
                
                <Box>
                  <Text as="label" size="1" mb="2" style={{ display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>
                    CONFIRM PASSWORD
                  </Text>
                  <TextField.Root 
                    type="password" 
                    placeholder="CONFIRM NEW PASSWORD" 
                    required 
                    size="3"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                  />
                </Box>

                <Button 
                  type="submit" 
                  size="3" 
                  mt="2" 
                  disabled={isLoading}
                  style={{ 
                    cursor: "pointer", 
                    borderRadius: 0, 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    backgroundColor: 'var(--text-h)', 
                    color: 'var(--bg)' 
                  }}
                >
                  {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                </Button>
              </Flex>
              
              <Text size="2" align="center" mt="4" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>
                Changed your mind? <Link href="/" style={{ color: 'var(--text-h)', textDecoration: 'underline', fontWeight: 800 }}>Back to dashboard</Link>
              </Text>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}
