/* eslint-disable */
//adding comments for redeployment
// Start of imports
"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "react-tsparticles";
import type { ISourceOptions } from "tsparticles-engine"; import { Engine } from "tsparticles-engine"; // Adjusted import
import { loadFull } from "tsparticles";
// End of imports

// Start of interface definition
interface LoginFormInputs {
  email: string;
  password: string;
}
// End of interface definition

// Start of LoginPage component
export default function LoginPage() {
  // Start of hooks initialization
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  // End of hooks initialization

  // Start of form submission handler
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { email, password } = data;
    try {
      // Attempt to sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to dashboard upon successful login
      router.push(`/dashboard?user=${encodeURIComponent(email)}`);
    } catch (error) {
      // Set error message if sign-in fails
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    }
  };
  // End of form submission handler

  // Start of particles initialization function
  const particlesInit = async (engine: any): Promise<void> => {
    try {
      await loadFull(engine);
      console.log("Particles engine loaded successfully");
    } catch (error) {
      console.error("Error loading particles engine:", error);
    }
  };
  // End of particles initialization function

  // Start of particles options configuration
  const particlesOptions: ISourceOptions = {
    background: {
      color: {
        value: "#000",
      },
    },
    particles: {
      number: {
        value: 50,
      },
      size: {
        value: 3,
      },
      move: {
        enable: true,
        speed: 2,
      },
      links: {
        enable: true,
        color: "#fff",
      },
    },
  };
  // End of particles options configuration

  // Start of return statement
  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center px-6">
      {/* Start of Particles component */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        className="absolute inset-0 -z-10"
        options={particlesOptions}
      />
      {/* End of Particles component */}

      {/* Start of login form container */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Login to Your Account
        </h1>
        {/* Start of form element */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Start of email input field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              placeholder="you@example.com"
              className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* End of email input field */}

          {/* Start of password input field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* End of password input field */}

          {/* Start of error message display */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          {/* End of error message display */}

          {/* Start of submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            Login
          </button>
          {/* End of submit button */}
        </form>
        {/* End of form element */}
      </div>
      {/* End of login form container */}
    </div>
  );
  // End of return statement
}
// End of LoginPage component
