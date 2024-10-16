// src/app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Duplex Brothers</h1>
      <p>Track your construction project easily.</p>
    </div>
  );
}

"use client";
import { useForm } from "react-hook-form";
import { auth } from "../../firebase";
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

"use client";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    alert("Logged out!");
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
        Logout
      </button>
    </div>
  );
}
