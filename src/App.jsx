import { useEffect, useState } from "react";
import "./App.css";
import { Route } from "wouter";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import { supabase} from "./SupaBaseClient";


function App() { 
  
  

  return (
    <>
      <Route path="/signup">
        <SignUp />
      </Route>

      <Route path="/signin">
        <SignIn />
      </Route>
    </>
  );
}

export default App;