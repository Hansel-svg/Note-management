import { useEffect, useState } from "react";
import "./App.css";
import { Route, Redirect } from "wouter";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import { supabase } from "./SupaBaseClient";
import Home from "./Home";

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

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false); 
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Route path="/signup">
        {session ? <Redirect to="/" /> : <SignUp />}
      </Route>

      <Route path="/signin">
        {session ? <Redirect to="/" /> : <SignIn />}
      </Route>

      <ProtectedRoute session={session} path="/">
        <Home />
      </ProtectedRoute>
    </>
  );
}

export default App;