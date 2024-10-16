// src/app/login/page.tsx
"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { useState } from "react";

// Define a type for the form inputs
interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [isNewUser, setIsNewUser] = useState(false);

  // Use the SubmitHandler type for the form submission function
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { email, password } = data;
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("User registered successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message); // Properly typed error handling
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">{isNewUser ? "Sign Up" : "Login"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          {...register("email", { required: true })}
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
        />
        <input
          {...register("password", { required: true })}
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          {isNewUser ? "Sign Up" : "Login"}
        </button>
        <button
          type="button"
          onClick={() => setIsNewUser(!isNewUser)}
          className="text-blue-500"
        >
          {isNewUser ? "Already have an account? Login" : "Create an account"}
        </button>
      </form>
    </div>
  );
}
