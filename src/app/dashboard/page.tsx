"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

interface Issue {
  id: number;
  description: string;
  status: string;
  timestamp: string;
}

// Add this to enforce dynamic rendering
export const dynamic = "force-dynamic";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const currentUser = searchParams?.get("user");
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  useEffect(() => {
    setIssues([
      { id: 1, description: "Crane malfunction", status: "Resolved", timestamp: "2 hours ago" },
      { id: 2, description: "Safety gear inspection", status: "Pending", timestamp: "Yesterday" },
      { id: 3, description: "Material delay", status: "In Progress", timestamp: "3 days ago" },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-8">Project Dashboard</h1>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li><a href="#" className="hover:bg-blue-700 p-2 rounded block">Overview</a></li>
            <li><a href="#" className="hover:bg-blue-700 p-2 rounded block">Reports</a></li>
            <li><a href="#" className="hover:bg-blue-700 p-2 rounded block">Issues</a></li>
            <li><a href="#" className="hover:bg-blue-700 p-2 rounded block">Settings</a></li>
          </ul>
        </nav>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 p-2 rounded mt-4"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">Welcome, {user}</h2>
          <p className="text-gray-600">Today’s Date: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold">Total Projects</h3>
            <p className="text-4xl mt-4">12</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold">Active Issues</h3>
            <p className="text-4xl mt-4">{issues.length}</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold">Resolved Today</h3>
            <p className="text-4xl mt-4">5</p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-4">Recent Issues</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-t">
                    <td className="px-6 py-4">{issue.id}</td>
                    <td className="px-6 py-4">{issue.description}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded ${
                          issue.status === "Resolved" ? "bg-green-100 text-green-800" :
                          issue.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{issue.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  );
}
