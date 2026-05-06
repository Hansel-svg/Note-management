import { useEffect, useState } from "react";
import "./App.css";
import { Route } from "wouter";
import SignUp from "./SignUp";


function App() { 
  
  

  return (
    <>
      <Route path="/signup">
        <SignUp />
      </Route>
    </>
  );
}

export default App;