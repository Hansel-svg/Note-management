import { supabase } from "./SupaBaseClient";
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
    <Flex justify="center" align="center" style={{ minHeight: "100vh" }}  >
      <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
        <Card size="4" variant="surface">
          <form onSubmit={signUp}>
            <Flex direction="column" gap="5">
              <Box style={{ textAlign: "center" }} mb="4">
                <Heading size="7" mb="2" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Create Account
                </Heading>
                <Text size="3" color="gray">
                  Sign up to get started
                </Text>
              </Box>

              {signUpError && !signUpSuccess && (
                <Callout.Root color="red" role="alert">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {signUpError}
                  </Callout.Text>
                </Callout.Root>
              )}

              {signUpSuccess && (
                <Callout.Root color="green" role="status">
                  <Callout.Icon>
                    <CheckCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {signUpError}
                  </Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                    Name
                  </Text>
                  <TextField.Root
                    type="text"
                    placeholder="Enter your name"
                    required
                    size="3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                    Email
                  </Text>
                  <TextField.Root
                    type="email"
                    placeholder="Enter your email"
                    required
                    size="3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                    Password
                  </Text>
                  <TextField.Root
                    type="password"
                    placeholder="Create a password"
                    required
                    size="3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="bold" mb="2" style={{ display: 'block' }}>
                    Confirm Password
                  </Text>
                  <TextField.Root
                    type="password"
                    placeholder="Confirm your password"
                    required
                    size="3"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Box>

                <Button type="submit" size="3" mt="2" style={{ cursor: "pointer" }} disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </Flex>

              <Text size="2" align="center" mt="4">
                Already have an account? <Link href="/signin" style={{ color: 'var(--cyan-10)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</Link>
              </Text>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}

export default SignUp;