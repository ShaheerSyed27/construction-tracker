// src/app/dashboard/page.tsx
"use client";
import { auth } from "../firebase"; // Import from your local firebase.js file
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth"; // Import Firebase methods

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null); // Use correct User type from firebase/auth

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
