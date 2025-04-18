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
  DeleteOutlined,
  MenuUnfoldOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/lib/table";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

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
            message.error("You need to be logged in to view the dashboard.");
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
        if (error.message === "You need to be logged in to view the dashboard.") {
          message.error("You need to be logged in to add an issue.");
          router.push("/login");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteIssue = (key: string) => {
    setIssues(issues.filter((issue) => issue.key !== key));
    message.success("Issue deleted successfully!");
    // Here you would also make an API call to delete the issue from the database
    // Example: await deleteDoc(doc(db, "issues", key));
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
    },{
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
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => console.log("View details for:", record.key)}>View Details</a>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteIssue(record.key)}
          >
            Delete
          </Button>
        </Space>
      ),
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
          background: "#f0f2f5",
          boxShadow: "2px 0 6px rgba(0, 21, 41, 0.1)",
        }}
      >
        <div
          style={{
            height: 32,
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
          <Menu.Item key="1" icon={<UserOutlined />}>
            Overview
          </Menu.Item>

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

          <Content style={{ padding: '0 50px', marginTop: 24 }}>
            {/* Page Title */}
            <Title level={2} style={{ color: '#1890ff', marginBottom: 20 }}>
              House Construction Project
            </Title>

            {/* Summary Metrics */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Text strong style={{ fontSize: 18 }}>Total Expenses:</Text> <Text style={{ fontSize: 18 }}>$18002.00</Text>
              </div>
              <div>
                <Text strong style={{ fontSize: 18 }}>Last Updated:</Text> <Text style={{ fontSize: 18 }}>Apr 12, 2025</Text>
              </div>
            </div>

            <Layout.Content
              className="site-layout-background"
              style={{
                padding: 24,
                minHeight: 380,
                background: '#fff',
                borderRadius: 8,
              }}
            >
              {/* Expense Overview Section (Placeholder) */}
              <Title level={4} style={{ marginBottom: 16 }}>
                Expense Overview
              </Title>
              <div style={{ height: 300, background: '#f0f2f5', borderRadius: 8, marginBottom: 20, textAlign: 'center', padding: 50 }}>
                Chart Placeholder
              </div>

              {/* Category Breakdown Section (Placeholder) */}
              <Title level={4} style={{ marginBottom: 16 }}>
                Category Breakdown
              </Title>
              <div style={{ height: 300, background: '#f0f2f5', borderRadius: 8, marginBottom: 20, textAlign: 'center', padding: 50 }}>
                Pie Chart Placeholder
              </div>

              {/* Expense Entries Section */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Title level={4}>Expense Entries</Title>
                <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => console.log("Add Expense Clicked")}>
                  Add Expense
                </Button>
              </div>

              {/* Filters (Placeholder) */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: 20 }}>
                <Select defaultValue="All Categories" style={{ width: 150 }} onChange={() => { }}>
                  <Option value="All Categories">All Categories</Option>
                  {/* Add more options as needed */}
                </Select>
                <Select defaultValue="All Time" style={{ width: 120 }} onChange={() => { }}>
                  <Option value="All Time">All Time</Option>
                  {/* Add more options as needed */}
                </Select>
                <Input.Search placeholder="Search expenses..." style={{ width: 200 }} />
              </div>

              {/* Issues Table */}
              <div>

                <div style={{marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Title level={3} style={{ margin: 0}}>
                    Recent Issues
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => {

                    }}
                  >
                    Add Issue
                  </Button>
                </div>

                <Table
                  columns={columns}
                  dataSource={issues}
                  pagination={{ pageSize: 5 }}
                  style={{ background: '#fff', borderRadius: 8 }}
                  rowClassName={(record, index) => index % 2 === 0 ? 'even-row' : 'odd-row'}
                />
              </div>
            </Layout.Content>
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
