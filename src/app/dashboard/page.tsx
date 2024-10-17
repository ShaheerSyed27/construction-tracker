// Install Ant Design if you haven't already:
// npm install antd
/* eslint-disable */
"use client"; // Ensures this component is client-side rendered in Next.js

import { useState, useEffect, Suspense, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Layout,
  Menu,
  Button,
  Input,
  Select,
  Upload,
  message,
  Table,
  Avatar,
  Typography,
  Tag,
  Dropdown,
} from "antd";
import {
  UploadOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/lib/table";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

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
  const [collapsed, setCollapsed] = useState(false);

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
            message.error("You need to be logged in to view issues.");
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
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewIssue((prevIssue) => ({
      ...prevIssue,
      [name]: value,
    }));
  };

  /* ===================
     Handle Select Change
     =================== */
  const handleSelectChange =
    (name: keyof NewIssue) => (value: string) => {
      setNewIssue((prevIssue) => ({
        ...prevIssue,
        [name]: value,
      }));
    };

  /* ===================
     Handle Image Upload (Ant Design Upload)
     =================== */
  const handleImageChange = (info: any) => {
    if (info.file.status === "removed") {
      setSelectedImage(null);
    } else if (info.file.status === "uploading") {
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
          message.error("You need to be logged in to add an issue.");
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
      render: (text) => <Text>{text}</Text>,
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
      render: (status) => {
        let type: "secondary" | "success" | "warning" | "danger" | undefined;
        if (status === "Pending") type = "warning";
        else if (status === "In Progress") type = "secondary";
        else if (status === "Resolved") type = "success";
        return <Text type={type}>{status}</Text>;
      },
    },
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: Date) => (
        <Text>{timestamp.toLocaleString()}</Text>
      ),
      sorter: (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    },
    {
      title: "Logger",
      dataIndex: "loggerName",
      key: "loggerName",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
          <Text>{name}</Text>
        </div>
      ),
    },
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string | undefined) =>
        imageUrl ? (
          <img
            src={imageUrl}
            alt="Issue"
            style={{ width: 64, height: 64, borderRadius: 8 }}
          />
        ) : null,
    },
  ];

  /* ===================
     Component JSX Rendering
     =================== */
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: "#fff",
          boxShadow: "2px 0 6px rgba(0, 21, 41, 0.1)",
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            background: "rgba(0, 0, 0, 0.25)",
            borderRadius: 8,
          }}
        />
        <Menu
          theme="light"
          defaultSelectedKeys={["1"]}
          mode="inline"
          style={{ border: "none" }}
        >
          <Menu.Item key="1" icon={<UserOutlined />}>Overview</Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>Reports</Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>Issues</Menu.Item>
          <Menu.Item key="4" icon={<UserOutlined />}>Settings</Menu.Item>
        </Menu>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0, 21, 41, 0.08)",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="1" onClick={handleLogout}>
                    <LogoutOutlined /> Logout
                  </Menu.Item>
                </Menu>
              }
            >
              <a onClick={(e) => e.preventDefault()}>{userRole}</a>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              background: "#fff",
              minHeight: "calc(100vh - 158px)",
              borderRadius: 8,
            }}
          >
            {/* Page Header */}
            <div style={{ marginBottom: 24 }}>
              <Title level={2}>Welcome, {userRole}!</Title>
              <Text type="secondary">
                Today’s Date: {new Date().toLocaleDateString()}
              </Text>
            </div>

            {/* Issues Section */}
            <div>
              {/* Add New Issue */}
              <div
                style={{
                  marginBottom: 24,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Title level={3} style={{ margin: 0 }}>
                  Recent Issues
                </Title>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  onClick={() => {
                    // Open a modal or drawer to add a new issue
                  }}
                >
                  Add Issue
                </Button>
              </div>

              {/* Add New Issue Form */}
              <div
                style={{
                  background: "#fafafa",
                  padding: 24,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <Input.TextArea
                  name="description"
                  value={newIssue.description}
                  onChange={handleInputChange}
                  placeholder="Issue Description"
                  rows={2}
                  style={{ marginBottom: 16 }}
                />
                <div style={{ display: "flex", gap: "16px", marginBottom: 16 }}>
                  <Select
                    value={newIssue.loggerName}
                    onChange={handleSelectChange("loggerName")}
                    placeholder="Select Logger"
                    style={{ flex: 1 }}
                  >
                    <Select.Option value="Shaheer Syed">
                      Shaheer Syed
                    </Select.Option>
                    <Select.Option value="Yahhya Chatta">
                      Yahhya Chatta
                    </Select.Option>
                    <Select.Option value="Ramzan Sajid">
                      Ramzan Sajid
                    </Select.Option>
                  </Select>
                  <Select
                    value={newIssue.status}
                    onChange={handleSelectChange("status")}
                    style={{ width: 200 }}
                  >
                    <Select.Option value="Pending">Pending</Select.Option>
                    <Select.Option value="In Progress">
                      In Progress
                    </Select.Option>
                    <Select.Option value="Resolved">Resolved</Select.Option>
                  </Select>
                </div>
                <Upload
                  listType="picture"
                  beforeUpload={() => true} // Allow the image to be uploaded manually later
                  onChange={handleImageChange}
                  maxCount={1}
                  onRemove={() => setSelectedImage(null)}
                  style={{ marginBottom: 16 }}
                >
                  <Button icon={<UploadOutlined />}>Select Image</Button>
                </Upload>
                <Button
                  type="primary"
                  onClick={addIssue}
                  loading={isLoading}
                  disabled={
                    !newIssue.description || !newIssue.loggerName
                  }
                >
                  Submit Issue
                </Button>
              </div>

              {/* Issues Table */}
              <Table
                columns={columns}
                dataSource={issues}
                pagination={{ pageSize: 5 }}
                style={{ background: "#fff", borderRadius: 8 }}
              />
            </div>
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          © {new Date().getFullYear()} Shaheer and Yahhya
        </Footer>
      </Layout>
    </Layout>
  );
}

/* ===================
   Dashboard Loader
   =================== */
function DashboardLoader() {
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = searchParams?.get("user") || "User";
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
