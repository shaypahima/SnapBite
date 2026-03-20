import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Tabs, Card, Typography } from "antd";
import { EditOutlined, CameraOutlined, UnorderedListOutlined } from "@ant-design/icons";
import TextMealInput from "@/components/log/TextMealInput";
import PhotoMealInput from "@/components/log/PhotoMealInput";
import FormMealInput from "@/components/log/FormMealInput";
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
              children: <PhotoMealInput onSaved={onMealSaved} />,
            },
            {
              key: "form",
              label: (
                <span>
                  <UnorderedListOutlined /> Form
                </span>
              ),
              children: <FormMealInput onSaved={onMealSaved} />,
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
