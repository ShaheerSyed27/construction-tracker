// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-white py-6">
        <div className="container mx-auto flex justify-center items-center">
          <div className="flex space-x-8">
            <Link href="/login" className="hover:text-blue-500 text-gray-600 transition-colors">
              Login
            </Link>
            <Link href="/dashboard" className="hover:text-blue-500 text-gray-600 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gray-50 py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Building Amazing Projects
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Track every phase of your construction journey with precision and style.
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/login" className="inline-block">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                Learn More
              </button>
            </Link>
            <Link href="/dashboard" className="inline-block">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-8 rounded-lg transition-colors">
                View Projects
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Real-Time Tracking</h3>
              <p className="text-gray-600">Monitor every project phase from start to finish with our intuitive tracking system.</p>
            </div>
            {/* Feature 2 */}
            <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Collaboration Tools</h3>
              <p className="text-gray-600">Keep everyone aligned with seamless updates, approvals, and communication features.</p>
            </div>
            {/* Add more features as needed */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="text-center">
          <p className="text-gray-600">&copy; 2024 Duplex Brothers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
