import { supabase } from "../lib/SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { Link } from "wouter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
      <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
        <Card size="4" variant="surface">
          <form onSubmit={handleReset}>
            <Flex direction="column" gap="5">
              <Box style={{ textAlign: "center" }} mb="4">
                <Heading size="7" mb="2" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Reset Password
                </Heading>
                <Text size="3" color="gray">
                  Enter your email to receive a reset link
                </Text>
              </Box>

              {errorMsg && (
                <Callout.Root color="red" role="alert">
                  <Callout.Icon><InfoCircledIcon /></Callout.Icon>
                  <Callout.Text>{errorMsg}</Callout.Text>
                </Callout.Root>
              )}

              {message && (
                <Callout.Root color="green" role="status">
                  <Callout.Icon><CheckCircledIcon /></Callout.Icon>
                  <Callout.Text>{message}</Callout.Text>
                </Callout.Root>
              )}

              <Flex direction="column" gap="4">
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

                <Button type="submit" size="3" mt="2" style={{ cursor: "pointer" }} disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </Flex>
              
              <Text size="2" align="center" mt="4">
                Remember your password? <Link href="/signin" style={{ color: 'var(--cyan-10)', textDecoration: 'none', fontWeight: 'bold' }}>Sign in</Link>
              </Text>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}
