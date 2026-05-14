import { supabase } from "../lib/SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { Link } from "wouter";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isOnline = useOnlineStatus();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Password reset instructions have been sent to your email!");
    }
    setIsLoading(false);
  };

  return (
    <Flex justify="center" align="center" style={{ minHeight: "100vh", backgroundColor: 'var(--bg)' }}>
      <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
        <Card size="4" variant="surface" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
          <form onSubmit={handleReset}>
            <Flex direction="column" gap="5">
              <Box style={{ textAlign: "center" }} mb="4">
                <Heading size={{ initial: '7', sm: '8' }} mb="2" style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                  RESET PASSWORD
                </Heading>
                <Text size="2" style={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>
                  Enter your email to receive a reset link
                </Text>
              </Box>

              {!isOnline && (
                <Callout.Root color="amber" role="alert" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                    YOU ARE CURRENTLY OFFLINE. PLEASE CONNECT TO THE INTERNET TO RESET YOUR PASSWORD.
                  </Callout.Text>
                </Callout.Root>
              )}

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
                    EMAIL
                  </Text>
                  <TextField.Root 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL" 
                    required 
                    size="3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                  />
                </Box>

                <Button 
                  type="submit" 
                  size="3" 
                  mt="2" 
                  disabled={isLoading || !isOnline}
                  style={{ 
                    cursor: (isLoading || !isOnline) ? "not-allowed" : "pointer", 
                    borderRadius: 0, 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    backgroundColor: (isLoading || !isOnline) ? 'var(--border)' : 'var(--text-h)', 
                    color: 'var(--bg)' 
                  }}
                >
                  {!isOnline ? "OFFLINE" : (isLoading ? "SENDING..." : "SEND RESET LINK")}
                </Button>
              </Flex>
              
              <Flex direction="column" gap="2" mt="4">
                <Text size="2" align="center" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>
                  Remembered your password? <Link href="/signin" style={{ color: 'var(--text-h)', textDecoration: 'underline', fontWeight: 800 }}>Sign in</Link>
                </Text>
                <Text size="2" align="center" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>
                  Or <Link href="/" style={{ color: 'var(--text-h)', textDecoration: 'underline', fontWeight: 800 }}>Back to dashboard</Link>
                </Text>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}
