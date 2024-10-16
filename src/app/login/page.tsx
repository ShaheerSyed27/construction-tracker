"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Particles from "react-tsparticles";
import type { ISourceOptions, Engine } from "tsparticles-engine"; // Use ISourceOptions and Engine type
import { loadFull } from "tsparticles"; // Ensure we use loadFull correctly

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    const { email, password } = data;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(`/dashboard?user=${encodeURIComponent(email)}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unexpected error occurred."
      );
    }
  };

  const particlesInit = async (engine: any): Promise<any> => {
    console.log(engine); // Optional: Verify engine initialization
    await loadFull(engine); // Load tsparticles engine
  };

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

  return (
    <div className="relative min-h-screen bg-gray-900 flex items-center justify-center px-6">
      {/* Particles Background */}
      <Particles
        className="absolute inset-0"
        init={particlesInit}
        options={particlesOptions}
      />

      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Login to Your Account
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
