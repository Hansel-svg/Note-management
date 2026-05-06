import { supabase } from "./SupaBaseClient";
import { useState } from "react";


function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signInError, setSignInError] = useState("");

    async function signIn(formData) {
        formData.preventDefault()
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error) {
            setSignInError(error.message)
        } else {
            setSignInError("")
        }
    }

    return (
        <>
            <form onSubmit={signIn} action={signIn}>
                <input type="email" placeholder="Enter email" required onChange={e => setEmail(e.target.value)}/>
                <input type="password" placeholder="Enter password" required onChange={e => setPassword(e.target.value)}/>
                {signInError && <p>{signInError}</p>}

                <button type="submit">Sign In</button>
            </form>
        </>
    );
}

export default SignIn;