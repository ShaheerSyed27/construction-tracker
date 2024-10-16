// src/app/login/page.tsx
"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

// Define a type for the form inputs
interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [isNewUser, setIsNewUser] = useState(false);

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
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center px-6">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          {isNewUser ? "Create an Account" : "Welcome Back"}
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {isNewUser ? "Sign Up" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => setIsNewUser(!isNewUser)}
            className="w-full text-blue-600 py-2 mt-4 hover:underline"
          >
            {isNewUser ? "Already have an account? Login" : "Create an account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
