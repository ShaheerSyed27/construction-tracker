"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "react-tsparticles";
import type { ISourceOptions } from "tsparticles-engine"; // Use ISourceOptions to type particles options
import { loadFull } from "tsparticles"; // Ensure we use loadFull correctly to load particles engine

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  // Initialize react-hook-form for managing form state and validation
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for storing error messages
  const router = useRouter(); // Next.js router for navigation

  // Function to handle form submission
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { email, password } = data;
    try {
      // Attempt to sign in using Firebase authentication
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect user to the dashboard page upon successful login
      router.push(`/dashboard?user=${encodeURIComponent(email)}`);
    } catch (error) {
      // Set error message if login fails
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    }
  };

  // Function to initialize particles background
  const particlesInit = async (engine: unknown): Promise<void> => {
    console.log(engine); // Optional: Log engine to verify initialization
    await loadFull(engine as any); // Load tsparticles engine to enable particle effects
  };

  // Configuration options for particles effect
  const particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: "#000", // Set background color to black
      },
    },
    particles: {
      number: {
        value: 50, // Number of particles
      },
      size: {
        value: 3, // Size of particles
      },
      move: {
        enable: true, // Enable particle movement
        speed: 2, // Set speed of particle movement
      },
      links: {
        enable: true, // Enable links between particles
        color: "#fff", // Set link color to white
      },
    },
  };

  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center px-6">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0" // Full-screen background
        init={particlesInit} // Initialize particles engine
        options={particlesOptions} // Pass configuration options for particles
      />

      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Login to Your Account
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email", { required: true })} // Register email input with validation
              type="email"
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password", { required: true })} // Register password input with validation
              type="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Display error message if login fails */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}