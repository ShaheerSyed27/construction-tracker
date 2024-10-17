/* eslint-disable */
"use client"; // Ensures this component is client-side rendered in Next.js

// Import necessary React hooks and Firebase modules
import { useState, useEffect, Suspense, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Next.js router hooks for navigation
import { signOut, onAuthStateChanged } from "firebase/auth"; // Firebase authentication module
import { auth, db, storage } from "../firebase"; // Firebase configuration (Firestore and Storage)
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore"; // Firestore methods
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage methods

// Define the structure of the Issue object
interface Issue {
  id: string;
  description: string;
  status: string;
  timestamp: string; // Ensures timestamp is stored as string in state
  imageUrl?: string; // Optional image URL field
  loggerName: string; //Logger name entry
}

// Force dynamic rendering (prevents static page generation in Next.js)
export const dynamic = "force-dynamic";

/* ===================
   Dashboard Content Component
   =================== */
function DashboardContent({ userRole }: { userRole: string }) {
  const router = useRouter(); // Initialize router for navigation
  const [issues, setIssues] = useState<Issue[]>([]); // State for storing issues from Firestore
  const [newIssue, setNewIssue] = useState<Issue>({
    id: "",
    description: "",
    status: "Pending", // Default status of a new issue
    timestamp: new Date().toLocaleString(), // Default timestamp as string
    loggerName: "", // Default as an empty string
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null); // Store the selected image file
  const [isLoading, setIsLoading] = useState(false); // Loading state for adding issue

  /* ===================
     Fetch Issues from Firestore (useEffect)
     =================== */
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("User is not authenticated");
        }
        const querySnapshot = await getDocs(collection(db, "issues")); // Fetch issues from Firestore
        const issuesData: Issue[] = querySnapshot.docs.map((doc) => {
          const data = doc.data(); // Get the document data

          // Return the issue object with timestamp converted to a string
          return {
            id: doc.id, // Document ID
            description: data.description,
            status: data.status,
            imageUrl: data.imageUrl || "", // Optional image URL
            timestamp: (data.timestamp as Timestamp).toDate().toLocaleString(), // Convert Timestamp to string
            loggerName: data.loggerName, // Include logger name
          };
        });

        setIssues(issuesData); // Update state with fetched issues
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching issues: ", error); // Error handling
          if (error.message === "User is not authenticated") {
            alert("You need to be logged in to view issues.");
            router.push("/login");
          }
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchIssues(); // Call fetch function if user is authenticated
      } else {
        router.push("/login"); // Redirect if user is not authenticated
      }
    });

    return () => unsubscribe(); // Clean up on unmount
  }, [router]); // Run once when component mounts

  /* ===================
     Handle Logout Function
     =================== */
  const handleLogout = async () => {
    await signOut(auth); // Sign out from Firebase authentication
    router.push("/login"); // Redirect the user to the login page
  };

  /* ===================
     Handle Input Changes (Form Input)
     =================== */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target; // Extract input name and value
    setNewIssue((prevIssue) => ({
      ...prevIssue, // Preserve existing issue data
      [name]: value, // Update the changed field
      timestamp: new Date().toLocaleString(), // Automatically update timestamp as string
    }));
  };

  /* ===================
     Handle Image Selection (File Input)
     =================== */
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]); // Store the selected image file in state
    }
  };

  /* ===================
     Add New Issue (Firestore + Storage)
     =================== */
  const addIssue = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Start loading indicator

    try {
      if (!auth.currentUser) {
        throw new Error("User is not authenticated");
      }

      let imageUrl = ""; // Initialize image URL variable

      // Upload image to Firebase Storage if one is selected
      if (selectedImage) {
        const imageRef = ref(storage, `issues/${selectedImage.name}`); // Create storage reference
        await uploadBytes(imageRef, selectedImage); // Upload the image
        imageUrl = await getDownloadURL(imageRef); // Retrieve the image URL
      }

      // Prepare new issue data with timestamp as Firestore Timestamp
      const newIssueData = {
        ...newIssue,
        timestamp: Timestamp.fromDate(new Date()), // Store timestamp in Firestore format
        imageUrl, // Include the uploaded image URL
      };

      // Add the new issue to Firestore
      const docRef = await addDoc(collection(db, "issues"), newIssueData);

      // Update the state with the newly added issue (convert timestamp to string)
      setIssues((prevIssues) => [
        ...prevIssues,
        {
          ...newIssueData,
          id: docRef.id,
          timestamp: new Date().toLocaleString(), // Ensure timestamp is a string
        },
      ]);

      // Clear the form after submission
      setNewIssue({ id: "", description: "", status: "Pending", timestamp: new Date().toLocaleString(), loggerName: "" });
      setSelectedImage(null); // Clear the selected image
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding issue: ", error);
        if (error.message === "User is not authenticated") {
          alert("You need to be logged in to add an issue.");
          router.push("/login");
        }
      }
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  /* ===================
     Component JSX Rendering
     =================== */
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
          <h2 className="text-3xl font-semibold text-gray-900">Welcome, {userRole}!</h2>
          <p className="text-gray-800">Today’s Date: {new Date().toLocaleDateString()}</p>
        </header>

        {/* Issues Table with Inline Add Form */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">Recent Issues</h3>
          </div>

          {/* Issues List with Inline Add Form */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded">
              <thead>
                <tr>
                  <th className="text-gray-900">ID</th>
                  <th className="text-gray-900">Description</th>
                  <th className="text-gray-900">Status</th>
                  <th className="text-gray-900">Timestamp</th>
                  <th className="text-gray-900">Image</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="text-gray-900">
                    <td>{issue.id}</td>
                    <td className="text-gray-900">{issue.description}</td>
                    <td className="text-gray-900">{issue.status}</td>
                    <td className="text-gray-900">{issue.timestamp}</td>
                    <td>
                      {issue.imageUrl && issue.imageUrl !== "" && (
                        <img src={issue.imageUrl} alt="Issue" className="w-16 h-16" />
                      )}
                    </td>
                  </tr>
                ))}

                {/* Inline Add New Issue Form */}
                <tr>
                  <td colSpan={5}>
                    <form onSubmit={addIssue} className="flex items-center space-x-4 mt-4">
                      <input
                        type="text"
                        name="description"
                        value={newIssue.description}
                        onChange={handleInputChange}
                        placeholder="Issue Description"
                        className="flex-1 p-2 border rounded"
                        required
                      />
                      <select
                        name="loggerName"
                        value={newIssue.loggerName}
                        onChange={handleInputChange}
                        className="flex-1 p-2 border rounded"
                        required
                      >
                        <option value="" disabled>Select Logger</option>
                        <option value="Shaheer Syed">Shaheer Syed</option>
                        <option value="Yahhya Chatta">Yahhya Chatta</option>
                        <option value="Ramzan Sajid">Ramzan Sajid</option>
                      </select>
                      <select
                        name="status"
                        value={newIssue.status}
                        onChange={handleInputChange}
                        className="p-2 border rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                      <input type="file" onChange={handleImageChange} className="p-2 border rounded" />
                      <button type="submit" disabled={isLoading} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        {isLoading ? "Adding..." : "Add Issue"}
                      </button>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ===================
   Dashboard Loader
   =================== */
function DashboardLoader() {
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = searchParams?.get("role") || "user"; // Default to "user"
    setUserRole(role);
  }, [searchParams]);

  if (!userRole) return <p>Loading...</p>;

  return <DashboardContent userRole={userRole} />;
}

/* ===================
   Dashboard Page (Exported Component)
   =================== */
export default function DashboardPage() {
  return (
    <Suspense fallback={<p>Loading dashboard...</p>}>
      <DashboardLoader />
    </Suspense>
  );
}

import { Form, Input, Button } from 'antd';

export function ContactForm() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md">
        <Form layout="vertical" style={{ width: '300px' }}>
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

/* ===================
   Firebase Storage Rules (updated)
   =================== */
/*
service firebase.storage {
  match /b/{bucket}/o {
    match /issues/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
*/
//adding comments for redeployment
