import { createFileRoute } from "@tanstack/react-router";
import { Button, Typography } from "antd";
import { signOut, useSession } from "@/lib/auth";

const { Title, Text } = Typography;

function HomePage() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <Title>SnapBite</Title>
      <Text>Welcome, {session?.user?.name}</Text>
      <br />
      <Button onClick={() => signOut()} style={{ marginTop: 16 }}>
        Sign out
      </Button>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomePage,
});
