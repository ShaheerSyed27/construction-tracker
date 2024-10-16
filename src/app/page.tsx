// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-semibold tracking-wide">Duplex Brothers v2.4</div>
        <div className="flex gap-6">
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative flex items-center justify-center h-[80vh] bg-cover bg-center" 
              style={{ backgroundImage: `url('/construction-bg.jpg')` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="text-center z-10">
          <h1 className="text-5xl font-extrabold text-white tracking-wider mb-4">
            Building Our First Project
          </h1>
          <p className="text-lg text-gray-200 max-w-md mx-auto mb-6">
            Track every phase of our construction journey here with precision and style.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login">
              <button className="bg-white text-black px-6 py-2 rounded-full text-lg hover:bg-gray-100">
                Get Started
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="bg-gray-900 text-white px-6 py-2 rounded-full text-lg hover:bg-gray-800">
                View Dashboard
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-semibold">Why Built Duplex Brothers Website?</h2>
          <p className="text-lg text-gray-600 mt-2">
            Because I hate myself and didn&apos;t want to sleep.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Real-Time Tracking</h3>
            <p className="text-gray-700">
              Monitor every phase of our project, from foundation to completion.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Collaborative Tools</h3>
            <p className="text-gray-700">
              Keep everyone on the same page with seamless updates and endorsements.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow-md hover:shadow-lg bg-blue-50 hover:bg-blue-100 transition duration-300 ease-in-out transform hover:scale-105">
            <h3 className="text-2xl font-semibold mb-4 text-blue-800">Budget Management</h3>
            <p className="text-gray-700">
            Log expenses and upload receipts with ease.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="text-center">
          <p>&copy; 2024 Duplex Brothers. All rights reserved.</p>
          <div className="mt-4">
            <Link href="#" className="hover:underline mx-2">Privacy Policy</Link>
            <Link href="#" className="hover:underline mx-2">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
