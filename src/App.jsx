import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

function App() {
  const [instruments, setInstruments] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [signUpError, setSignUpError] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);


  async function signUp(formData) {
    formData.preventDefault()
    if(password !== confirmPassword){
      setSignUpError("Passwords do not match")
      return
    }
    const { data, error } = await supabase.auth.signUp({
      email: email,            
      password: password,
      options: {
        data: {
          username: name
        }
      }
    })
    if (error) {
      setSignUpError(error.message)
    } else {
      setSignUpError("Account created successfully!")
      setSignUpSuccess(true)
    }
  } 
  

  return (
    <>
      <form onSubmit={signUp} action={signUp}>
        <input type="email" placeholder="Enter email" onChange={(e) => {setEmail(e.target.value)}}/>
        <input type="text" placeholder="Enter name" onChange={(e) => {setName(e.target.value)}}/>
        <input type="password" placeholder="Enter password" onChange={(e) => {setPassword(e.target.value)}}/>
        <input type="password" placeholder="Confirm password" onChange={(e) => {setConfirmPassword(e.target.value)}}/>

        <button type="submit">Submit</button>
      </form>

      <div className={`${signUpSuccess ? 'successful-message' : 'error-message'}`} >
        {signUpError}
      </div>
    </>
  );
}

export default App;