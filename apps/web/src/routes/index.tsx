import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Typography } from "antd";
import { PlusOutlined, LogoutOutlined } from "@ant-design/icons";
import { signOut, useSession } from "@/lib/auth";

const { Title, Text } = Typography;

function HomePage() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <Title>SnapBite</Title>
      <Text>Welcome, {session?.user?.name}</Text>
      <br />
      <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
        <Link to="/log">
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Log a Meal
          </Button>
        </Link>
        <Button icon={<LogoutOutlined />} onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
