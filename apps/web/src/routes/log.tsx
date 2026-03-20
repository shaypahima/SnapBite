import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, Card, Typography } from "antd";
import { EditOutlined, CameraOutlined, UnorderedListOutlined } from "@ant-design/icons";
import TextMealInput from "@/components/log/TextMealInput";
import styles from "./log.module.css";

const { Title } = Typography;

function LogPage() {
  const navigate = useNavigate();

  const onMealSaved = () => {
    navigate({ to: "/" });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={3}>Log a Meal</Title>
        <Tabs
          defaultActiveKey="text"
          items={[
            {
              key: "text",
              label: (
                <span>
                  <EditOutlined /> Free Text
                </span>
              ),
              children: <TextMealInput onSaved={onMealSaved} />,
            },
            {
              key: "photo",
              label: (
                <span>
                  <CameraOutlined /> Photo
                </span>
              ),
              children: <div style={{ padding: 24, textAlign: "center", color: "#999" }}>Coming soon</div>,
            },
            {
              key: "form",
              label: (
                <span>
                  <UnorderedListOutlined /> Form
                </span>
              ),
              children: <div style={{ padding: 24, textAlign: "center", color: "#999" }}>Coming soon</div>,
            },
          ]}
        />
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/log")({
  component: LogPage,
});
