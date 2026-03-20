import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { signIn, useSession } from "@/lib/auth";
import { useEffect } from "react";
import styles from "./login.module.css";

const { Title, Text } = Typography;

function LoginPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate({ to: "/" });
    }
  }, [session, navigate]);

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  if (isPending) return null;

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={2} className={styles.title}>
          SnapBite
        </Title>
        <Text className={styles.subtitle}>
          AI-Powered Nutrition Tracker
        </Text>
        <Button
          type="primary"
          size="large"
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          block
        >
          Sign in with Google
        </Button>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
});
