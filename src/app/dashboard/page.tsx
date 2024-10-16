/* eslint-disable */
"use client";
import { useState, useEffect, Suspense, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "../firebase"; // Import Firestore and Storage
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Issue {
  id: string;
  description: string;
  status: string;
  timestamp: string;
  imageUrl?: string;
}

export const dynamic = "force-dynamic";

function DashboardContent({ userRole }: { userRole: string }) {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showForm, setShowForm] = useState(false); // Control form visibility
  const [newIssue, setNewIssue] = useState<Issue>({
    id: "",
    description: "",
    status: "Pending",
    timestamp: new Date().toLocaleString(),
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Store selected image

  // Fetch issues from Firestore
  useEffect(() => {
    const fetchIssues = async () => {
      const querySnapshot = await getDocs(collection(db, "issues"));
      const issuesData: Issue[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Issue[];
      setIssues(issuesData);
    };

    fetchIssues();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Handle input changes for the new issue
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewIssue((prevIssue) => ({
      ...prevIssue,
      [name]: value,
      timestamp: new Date().toLocaleString(),
    }));
  };

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // Add new issue to Firestore and upload image to Storage
  const addIssue = async (e: FormEvent) => {
    e.preventDefault();
    let imageUrl = "";

    if (selectedImage) {
      const imageRef = ref(storage, `issues/${selectedImage.name}`);
      await uploadBytes(imageRef, selectedImage);
      imageUrl = await getDownloadURL(imageRef);
    }

    const newIssueData = {
      ...newIssue,
      timestamp: Timestamp.fromDate(new Date()),
      imageUrl,
    };

    const docRef = await addDoc(collection(db, "issues"), newIssueData);

    setIssues((prevIssues) => [...prevIssues, { ...newIssueData, id: docRef.id }]);
    setNewIssue({ id: "", description: "", status: "Pending", timestamp: "" });
    setSelectedImage(null);
    setShowForm(false);
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

        {/* Issues Table with Add Button */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Recent Issues</h3>
            <button
              className="text-2xl bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
              onClick={() => setShowForm(!showForm)}
            >
              +
            </button>
          </div>

          {/* Form to Add New Issue (Hidden by Default) */}
          {showForm && (
            <form onSubmit={addIssue} className="space-y-4 mb-8">
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
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
              >
                Add Issue
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Description</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
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
                    <td className="px-6 py-4">
                      {issue.imageUrl && (
                        <img src={issue.imageUrl} alt="Issue" className="w-16 h-16 object-cover" />
                      )}
                    </td>
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
    const role = searchParams?.get("role") || "user";
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
