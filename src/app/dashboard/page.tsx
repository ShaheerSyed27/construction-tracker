// Install Ant Design if you haven't already:
// npm install antd

"use client"; // Ensures this component is client-side rendered in Next.js

import { useState, useEffect, Suspense, ChangeEvent, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Table, Button, Input, Select, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/lib/table";
import type { UploadFile } from "antd/lib/upload/interface";

// Define the structure of the Issue object
interface Issue {
  key: string; // Ant Design's Table expects a 'key' prop
  description: string;
  status: string;
  timestamp: Date;
  imageUrl?: string;
  loggerName: string;
}

// Define the structure of the new issue (without id and timestamp)
interface NewIssue {
  description: string;
  status: string;
  loggerName: string;
}

export const dynamic = "force-dynamic";

/* ===================
   Dashboard Content Component
   =================== */
function DashboardContent({ userRole }: { userRole: string }) {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [newIssue, setNewIssue] = useState<NewIssue>({
    description: "",
    status: "Pending",
    loggerName: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /* ===================
     Fetch Issues from Firestore (useEffect)
     =================== */
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("User is not authenticated");
        }
        const querySnapshot = await getDocs(collection(db, "issues"));
        const issuesData: Issue[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();

          return {
            key: doc.id,
            description: data.description,
            status: data.status,
            imageUrl: data.imageUrl || "",
            timestamp: (data.timestamp as Timestamp).toDate(),
            loggerName: data.loggerName,
          };
        });

        setIssues(issuesData);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching issues: ", error);
          if (error.message === "User is not authenticated") {
            alert("You need to be logged in to view issues.");
            router.push("/login");
          }
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchIssues();
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  /* ===================
     Handle Logout Function
     =================== */
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  /* ===================
     Handle Input Changes (Form Input)
     =================== */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewIssue((prevIssue) => ({
      ...prevIssue,
      [name]: value,
    }));
  };

  /* ===================
     Handle Select Change
     =================== */
     const handleSelectChange = (name: keyof NewIssue) => (value: string) => {
      setNewIssue((prevIssue) => ({
        ...prevIssue,
        [name]: value,
      }));
    };

  /* ===================
     Handle Image Upload (Ant Design Upload)
     =================== */
  const handleImageChange = (info: any) => {
    if (info.file.status === "done") {
      setSelectedImage(info.file.originFileObj);
    }
  };

  /* ===================
     Add New Issue (Firestore + Storage)
     =================== */
  const addIssue = async () => {
    setIsLoading(true);

    try {
      if (!auth.currentUser) {
        throw new Error("User is not authenticated");
      }

      let imageUrl = "";

      if (selectedImage) {
        const uniqueImageName = `${Date.now()}_${selectedImage.name}`;
        const imageRef = ref(storage, `issues/${uniqueImageName}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      const newIssueData = {
        ...newIssue,
        timestamp: Timestamp.fromDate(new Date()),
        imageUrl,
      };

      const docRef = await addDoc(collection(db, "issues"), newIssueData);

      setIssues((prevIssues) => [
        ...prevIssues,
        {
          ...newIssueData,
          key: docRef.id,
          timestamp: new Date(),
        },
      ]);

      setNewIssue({ description: "", status: "Pending", loggerName: "" });
      setSelectedImage(null);
      message.success("Issue added successfully!");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error adding issue: ", error);
        if (error.message === "User is not authenticated") {
          alert("You need to be logged in to add an issue.");
          router.push("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================
     Define Table Columns
     =================== */
  const columns: ColumnsType<Issue> = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "In Progress", value: "In Progress" },
        { text: "Resolved", value: "Resolved" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: Date) => timestamp.toLocaleString(),
      sorter: (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    },
    {
      title: "Logger Name",
      dataIndex: "loggerName",
      key: "loggerName",
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string | undefined) =>
        imageUrl ? <img src={imageUrl} alt="Issue" style={{ width: 64, height: 64 }} /> : null,
    },
  ];

  /* ===================
     Component JSX Rendering
     =================== */
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-6">
        <h1 className="text-2xl font-bold mb-8">Project Dashboard</h1>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li>
              <a href="#" className="hover:bg-blue-700 p-2 rounded block">
                Overview
              </a>
            </li>
            <li>
              <a href="#" className="hover:bg-blue-700 p-2 rounded block">
                Reports
              </a>
            </li>
            <li>
              <a href="#" className="hover:bg-blue-700 p-2 rounded block">
                Issues
              </a>
            </li>
            <li>
              <a href="#" className="hover:bg-blue-700 p-2 rounded block">
                Settings
              </a>
            </li>
          </ul>
        </nav>
        <Button danger onClick={handleLogout} className="mt-4">
          Logout
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold">Welcome, {userRole}!</h2>
          <p>Today’s Date: {new Date().toLocaleDateString()}</p>
        </header>

        {/* Issues Table with Add Form */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Recent Issues</h3>
          </div>

          {/* Add New Issue Form */}
          <div className="mb-6">
            <Input.TextArea
              name="description"
              value={newIssue.description}
              onChange={handleInputChange}
              placeholder="Issue Description"
              rows={2}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: "8px", marginBottom: 8 }}>
              <Select
                value={newIssue.loggerName}
                onChange={handleSelectChange("loggerName")}
                placeholder="Select Logger"
                style={{ flex: 1 }}
              >
                <Select.Option value="Shaheer Syed">Shaheer Syed</Select.Option>
                <Select.Option value="Yahhya Chatta">Yahhya Chatta</Select.Option>
                <Select.Option value="Ramzan Sajid">Ramzan Sajid</Select.Option>
              </Select>
              <Select
                value={newIssue.status}
                onChange={handleSelectChange("status")}
                style={{ width: 150 }}
              >
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="In Progress">In Progress</Select.Option>
                <Select.Option value="Resolved">Resolved</Select.Option>
              </Select>
            </div>
            <Upload
              beforeUpload={() => false} // Prevent automatic upload
              onChange={handleImageChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
            <Button
              type="primary"
              onClick={addIssue}
              loading={isLoading}
              style={{ marginTop: 8 }}
              disabled={!newIssue.description || !newIssue.loggerName}
            >
              Add Issue
            </Button>
          </div>

          {/* Issues Table */}
          <Table columns={columns} dataSource={issues} />
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
    const role = searchParams?.get("role") || "user";
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
