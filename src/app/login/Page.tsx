// src/app/LoginPage.tsx
"use client";
import { useForm } from "react-hook-form";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const [isNewUser, setIsNewUser] = useState(false);

  const onSubmit = async (data: any) => {
    const { email, password } = data;
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("User registered successfully!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">{isNewUser ? "Sign Up" : "Login"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
        />
        <input
          {...register("password")}
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
