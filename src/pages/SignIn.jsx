import { supabase } from "../lib/SupaBaseClient";
import { useState } from "react";
import { Container, Card, Flex, Heading, Text, TextField, Button, Box, Callout } from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Link } from "wouter";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signInError, setSignInError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isOnline = useOnlineStatus();

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
        <Flex justify="center" align="center" style={{ minHeight: "100vh", backgroundColor: 'var(--bg)' }}>
            <Container size="1" py="9" px="4" style={{ maxWidth: '400px' }}>
                <Card size="4" variant="surface" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'var(--bg)' }}>
                    <form onSubmit={signIn}>
                        <Flex direction="column" gap="5">
                            <Box style={{ textAlign: "center" }} mb="4">
                                <Heading size={{ initial: '7', sm: '8' }} mb="2" style={{ color: 'var(--text-h)', fontWeight: 800, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                                    WELCOME BACK
                                </Heading>
                                <Text size="2" style={{ color: 'var(--text)', fontWeight: 600, textTransform: 'uppercase', opacity: 0.6 }}>
                                    Sign in to your account to continue
                                </Text>
                            </Box>

                            {!isOnline && (
                                <Callout.Root color="amber" role="alert" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                                    <Callout.Icon>
                                        <InfoCircledIcon />
                                    </Callout.Icon>
                                    <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                                        YOU ARE CURRENTLY OFFLINE. PLEASE CONNECT TO THE INTERNET TO SIGN IN.
                                    </Callout.Text>
                                </Callout.Root>
                            )}

                            {signInError && (
                                <Callout.Root color="gray" role="alert" style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}>
                                    <Callout.Icon>
                                        <InfoCircledIcon />
                                    </Callout.Icon>
                                    <Callout.Text style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-h)' }}>
                                        {signInError}
                                    </Callout.Text>
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
                                        onChange={e => setEmail(e.target.value)}
                                        style={{ borderRadius: 0, border: '1.5px solid var(--border)', backgroundColor: 'transparent' }}
                                    />
                                </Box>

                                <Box>
                                    <Flex justify="between" mb="2">
                                        <Text as="label" size="1" style={{ display: 'block', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-h)' }}>
                                            PASSWORD
                                        </Text>
                                        <Link href="/forgot-password" style={{ color: 'var(--text-h)', textDecoration: 'underline', fontSize: 'var(--font-size-1)', fontWeight: 700, textTransform: 'uppercase' }}>
                                            Forgot password?
                                        </Link>
                                    </Flex>
                                    <TextField.Root
                                        type="password"
                                        placeholder="ENTER YOUR PASSWORD"
                                        required
                                        size="3"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
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
                                    {!isOnline ? "OFFLINE" : (isLoading ? "SIGNING IN..." : "SIGN IN")}
                                </Button>
                            </Flex>

                            <Text size="2" align="center" mt="4" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)' }}>
                                Don't have an account? <Link href="/signup" style={{ color: 'var(--text-h)', textDecoration: 'underline', fontWeight: 800 }}>Sign up</Link>
                            </Text>
                        </Flex>
                    </form>
                </Card>
            </Container>
        </Flex>
    );
}

export default SignIn;