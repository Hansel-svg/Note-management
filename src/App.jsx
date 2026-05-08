import { useEffect, useState } from "react";
import "./App.css";
import { Route, Redirect } from "wouter";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import { supabase } from "./SupaBaseClient";
import Home from "./Home";
import { ThemeToggle } from "./ThemeToggle";
import { Box } from "@radix-ui/themes";
import ForgotPassword from "./ForgotPassword";
import UpdatePassword from "./UpdatePassword";
import Preferences from "./Preferences";

const ProtectedRoute = ({ session, path, children }) => {
  return (
    <Route path={path}>
      {session ? children : <Redirect to="/signin" />}
    </Route>
  );
};

function App() { 
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false); 
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (loading) return <div>Loading...</div>;

  return (
    <>
    

      <Route path="/signup">
        <Box style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1000 }}>
        <ThemeToggle />
      </Box>
        {session ? <Redirect to="/" /> : <SignUp />}
      </Route>

      <Route path="/signin">
        <Box style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1000 }}>
        <ThemeToggle />
      </Box>
        {session ? <Redirect to="/" /> : <SignIn />}
      </Route>

      <Route path="/forgot-password">
        <Box style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1000 }}>
        <ThemeToggle />
      </Box>
        <ForgotPassword />
      </Route>

      <Route path="/update-password">
        <Box style={{ position: "absolute", top: "1rem", right: "1rem", zIndex: 1000 }}>
        <ThemeToggle />
      </Box>
        {isRecovery ? <UpdatePassword /> : <Redirect to="/" />}
      </Route>

      <ProtectedRoute session={session} path="/preferences">
        <Preferences session={session} />
      </ProtectedRoute>

      <ProtectedRoute session={session} path="/">
        <Home session={session} />
      </ProtectedRoute>
    </>
  );
}

export default App;