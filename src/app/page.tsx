// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Duplex Brothers</h1>
      <p className="mb-8">Track your construction project easily.</p>
      <div className="flex gap-4">
        <Link href="/login">
          <button className="bg-blue-500 text-white p-3 rounded hover:bg-blue-700">
            Login / Sign Up
          </button>
        </Link>
        <Link href="/dashboard">
          <button className="bg-green-500 text-white p-3 rounded hover:bg-green-700">
            Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
