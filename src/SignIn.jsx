import { supabase } from "./SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Link } from "wouter";

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signInError, setSignInError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function signIn(e) {
        e.preventDefault();
        setIsLoading(true);
        setSignInError("");
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            setSignInError(error.message);
        }
        setIsLoading(false);
    }

    return (
        <Flex justify="center" align="center" style={{ minHeight: "100vh" }}>
            <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
                <Card size="4" variant="surface">
                    <form onSubmit={signIn}>
                        <Flex direction="column" gap="5">
                            <Box style={{ textAlign: "center" }} mb="4">
                                <Heading size="7" mb="2" style={{ background: 'linear-gradient(to right, var(--cyan-9), var(--blue-9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Welcome Back
                                </Heading>
                                <Text size="3" color="gray">
                                    Sign in to your account to continue
                                </Text>
                            </Box>

                            {signInError && (
                                <Callout.Root color="red" role="alert">
                                    <Callout.Icon>
                                        <InfoCircledIcon />
                                    </Callout.Icon>
                                    <Callout.Text>
                                        {signInError}
                                    </Callout.Text>
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
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </Box>

                                <Box>
                                    <Flex justify="between" mb="2">
                                        <Text as="label" size="2" weight="bold" style={{ display: 'block' }}>
                                            Password
                                        </Text>
                                        <Link href="/forgot-password" style={{ color: 'var(--cyan-10)', textDecoration: 'none', fontSize: 'var(--font-size-2)' }}>
                                            Forgot password?
                                        </Link>
                                    </Flex>
                                    <TextField.Root
                                        type="password"
                                        placeholder="Enter your password"
                                        required
                                        size="3"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </Box>

                                <Button type="submit" size="3" mt="2" style={{ cursor: "pointer" }} disabled={isLoading}>
                                    {isLoading ? "Signing in..." : "Sign In"}
                                </Button>
                            </Flex>

                            <Text size="2" align="center" mt="4">
                                Don't have an account? <Link href="/signup" style={{ color: 'var(--cyan-10)', textDecoration: 'none', fontWeight: 'bold' }}>Sign up</Link>
                            </Text>
                        </Flex>
                    </form>
                </Card>
            </Container>
        </Flex>
    );
}

export default SignIn;