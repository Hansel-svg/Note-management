import { supabase } from "../lib/SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { Link } from "wouter";

function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function signUp(e) {
    e.preventDefault();
    setSignUpError("");
    setSignUpSuccess(false);

    if (password !== confirmPassword) {
      setSignUpError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: name
        }
      }
    });

    if (error) {
      setSignUpError(error.message);
    } else {
      setSignUpError("Account created successfully!");
      setSignUpSuccess(true);
    }
    setIsLoading(false);
  }

  return (
    <Flex justify="center" align="center" style={{ minHeight: "100vh", backgroundColor: 'var(--bg)' }}>
      <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
        <Card size="4" variant="surface" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
          <form onSubmit={signUp}>
            <Flex direction="column" gap="5">
              <Box style={{ textAlign: "center" }} mb="4">
                <Heading size={{ initial: '7', sm: '8' }} mb="2" style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                  CREATE ACCOUNT
                </Heading>
                <Text size="2" style={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>
                  Sign up to get started
                </Text>
              </Box>

              {signUpError && !signUpSuccess && (
                <Callout.Root color="gray" role="alert" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                    {signUpError}
                  </Callout.Text>
                </Callout.Root>
              )}

              {signUpSuccess && (
                <Callout.Root color="gray" role="status" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                  <Callout.Icon>
                    <CheckCircledIcon />
                  </Callout.Icon>
                  <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                    {signUpError}
                  </Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="1" mb="2" style={{ display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>
                    NAME
                  </Text>
                  <TextField.Root
                    type="text"
                    placeholder="ENTER YOUR NAME"
                    required
                    size="3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                  />
                </Box>

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

                <Box>
                  <Text as="label" size="1" mb="2" style={{ display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>
                    PASSWORD
                  </Text>
                  <TextField.Root
                    type="password"
                    placeholder="CREATE A PASSWORD"
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
                    placeholder="CONFIRM YOUR PASSWORD"
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
                  {isLoading ? "SIGNING UP..." : "SIGN UP"}
                </Button>
              </Flex>

              <Text size="2" align="center" mt="4" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>
                Already have an account? <Link href="/signin" style={{ color: 'var(--text-h)', textDecoration: 'underline', fontWeight: 800 }}>Sign in</Link>
              </Text>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}

export default SignUp;