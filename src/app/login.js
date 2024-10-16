import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const handleAuth = async () => {
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      alert("Authentication successful!");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>{isNewUser ? "Sign Up" : "Login"}</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAuth}>{isNewUser ? "Sign Up" : "Login"}</button>
      <button onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? "Already have an account? Login" : "Create an account"}
      </button>
    </div>
  );
};

export default Login;
