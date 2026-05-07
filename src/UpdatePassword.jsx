import { supabase } from "./SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { useLocation } from "wouter";

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
    <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
      <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
        <Card size="4" variant="surface">
          <form onSubmit={handleUpdate}>
            <Flex direction="column" gap="5">
              <Box style={{ textAlign: "center" }} mb="4">
                <Heading size="7" mb="2" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  New Password
                </Heading>
                <Text size="3" color="gray">
                  Enter your new password below
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
                    New Password
                  </Text>
                  <TextField.Root 
                    type="password" 
                    placeholder="Enter new password" 
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
                    placeholder="Confirm new password" 
                    required 
                    size="3"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Box>

                <Button type="submit" size="3" mt="2" style={{ cursor: "pointer" }} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      </Container>
    </Flex>
  );
}
