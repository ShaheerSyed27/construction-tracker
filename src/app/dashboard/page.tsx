/* eslint-disable */
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

export const dynamic = "force-dynamic";

function DashboardContent({ userRole }: { userRole: string }) {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newIssue, setNewIssue] = useState<Issue>({
    id: 0,
    description: "",
    status: "Pending",
    timestamp: new Date().toLocaleString(),
  });

  // Logout functionality
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  useEffect(() => {
    // Dummy initial issues data
    setIssues([
      { id: 1, description: "Crane malfunction", status: "Resolved", timestamp: "2 hours ago" },
      { id: 2, description: "Safety gear inspection", status: "Pending", timestamp: "Yesterday" },
      { id: 3, description: "Material delay", status: "In Progress", timestamp: "3 days ago" },
    ]);
  }, []);

  // Function to handle input changes for the new issue
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewIssue((prevIssue) => ({
      ...prevIssue,
      [name]: value,
      timestamp: new Date().toLocaleString(), // Automatically set timestamp
    }));
  };

  // Function to add a new issue to the dashboard
  const addIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIssues((prevIssues) => [
      ...prevIssues,
      { ...newIssue, id: prevIssues.length + 1 },
    ]);
    // Clear the form after submission
    setNewIssue({ id: 0, description: "", status: "Pending", timestamp: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">Welcome, {userRole}!</h2>
          <p className="text-gray-600">Today’s Date: {new Date().toLocaleDateString()}</p>
        </header>

        {/* Add New Issue Form */}
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4">Add New Issue</h3>
          <form onSubmit={addIssue} className="space-y-4">
            <input
              type="text"
              name="description"
              value={newIssue.description}
              onChange={handleInputChange}
              placeholder="Issue Description"
              className="w-full p-2 border rounded"
              required
            />
            <select
              name="status"
              value={newIssue.status}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              Add Issue
            </button>
          </form>
        </section>

        {/* Issues Table */}
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
                          issue.status === "Resolved"
                            ? "bg-green-100 text-green-800"
                            : issue.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
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

function DashboardLoader() {
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = searchParams?.get("role") || "user"; // Default to "user" role
    setUserRole(role);
  }, [searchParams]);

  if (!userRole) return <p>Loading...</p>;

  return <DashboardContent userRole={userRole} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardLoader />
    </Suspense>
  );
}
