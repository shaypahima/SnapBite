import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Form,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  Radio,
  message,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/axios";
import styles from "./settings.module.css";

const { Title, Text } = Typography;

const activityOptions = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "light", label: "Light (1-3 days/week)" },
  { value: "moderate", label: "Moderate (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very_active", label: "Very Active (intense daily)" },
];

const goalOptions = [
  { value: "lose", label: "Lose weight" },
  { value: "maintain", label: "Maintain weight" },
  { value: "gain", label: "Gain weight" },
];

function SettingsPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const unitPreference = Form.useWatch("unitPreference", form);

  const { data: profile, isPending } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.get("/api/profile").then((r) => r.data),
  });

  useEffect(() => {
    if (profile) {
      const unit = profile.unitPreference || "metric";
      let weight = profile.weight;
      let height = profile.height;

      if (unit === "imperial" && weight && height) {
        weight = Math.round(weight / 0.453592 * 10) / 10;
        height = Math.round(height / 2.54 * 10) / 10;
      }

      form.setFieldsValue({
        age: profile.age,
        gender: profile.gender,
        weight,
        height,
        activityLevel: profile.activityLevel,
        goal: profile.goal,
        unitPreference: unit,
      });
    }
  }, [profile, form]);

  const onFinish = async (values: Record<string, unknown>) => {
    let weight = values.weight as number;
    let height = values.height as number;

    if (values.unitPreference === "imperial") {
      weight = weight * 0.453592;
      height = height * 2.54;
    }

    await api.put("/api/profile", {
      age: values.age,
      gender: values.gender,
      weight: Math.round(weight * 10) / 10,
      height: Math.round(height * 10) / 10,
      activityLevel: values.activityLevel,
      goal: values.goal,
      unitPreference: values.unitPreference,
    });

    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    message.success("Settings saved!");
  };

  if (isPending) return <Spin style={{ display: "block", margin: "48px auto" }} />;

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/">
          <Button type="text" icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
      </div>

      <Card>
        <Title level={3}>Settings</Title>

        {profile?.calorieTarget && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Current targets</Text>
            <div className={styles.targets}>
              <div className={styles.targetItem}>
                <div><Text strong>{Math.round(profile.calorieTarget)}</Text></div>
                <Text type="secondary">cal</Text>
              </div>
              <div className={styles.targetItem}>
                <div><Text strong>{Math.round(profile.proteinTarget)}g</Text></div>
                <Text type="secondary">protein</Text>
              </div>
              <div className={styles.targetItem}>
                <div><Text strong>{Math.round(profile.carbsTarget)}g</Text></div>
                <Text type="secondary">carbs</Text>
              </div>
              <div className={styles.targetItem}>
                <div><Text strong>{Math.round(profile.fatTarget)}g</Text></div>
                <Text type="secondary">fat</Text>
              </div>
            </div>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item name="unitPreference" label="Units">
            <Radio.Group>
              <Radio.Button value="metric">Metric</Radio.Button>
              <Radio.Button value="imperial">Imperial</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio.Button value="male">Male</Radio.Button>
              <Radio.Button value="female">Female</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="age" label="Age" rules={[{ required: true }]}>
            <InputNumber min={1} max={150} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="weight"
            label={unitPreference === "imperial" ? "Weight (lbs)" : "Weight (kg)"}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="height"
            label={unitPreference === "imperial" ? "Height (inches)" : "Height (cm)"}
            rules={[{ required: true }]}
          >
            <InputNumber min={1} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="activityLevel" label="Activity Level" rules={[{ required: true }]}>
            <Select options={activityOptions} />
          </Form.Item>

          <Form.Item name="goal" label="Goal" rules={[{ required: true }]}>
            <Select options={goalOptions} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Save & Recalculate
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});
