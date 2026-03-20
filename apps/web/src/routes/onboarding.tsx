import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  Radio,
  message,
} from "antd";
import api from "@/lib/axios";
import styles from "./onboarding.module.css";

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

function OnboardingPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const unitPreference = Form.useWatch("unitPreference", form);

  const onFinish = async (values: Record<string, unknown>) => {
    let weight = values.weight as number;
    let height = values.height as number;

    // Convert to metric for storage
    if (values.unitPreference === "imperial") {
      weight = weight * 0.453592; // lbs to kg
      height = height * 2.54; // inches to cm
    }

    await api.post("/api/profile", {
      age: values.age,
      gender: values.gender,
      weight: Math.round(weight * 10) / 10,
      height: Math.round(height * 10) / 10,
      activityLevel: values.activityLevel,
      goal: values.goal,
      unitPreference: values.unitPreference,
    });

    message.success("Profile saved!");
    navigate({ to: "/" });
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Title level={2}>Welcome to SnapBite</Title>
        <Text className={styles.subtitle}>
          Set up your profile to calculate your daily targets
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ unitPreference: "metric", gender: "male" }}
          className={styles.form}
        >
          <Form.Item
            name="unitPreference"
            label="Units"
          >
            <Radio.Group>
              <Radio.Button value="metric">Metric</Radio.Button>
              <Radio.Button value="imperial">Imperial</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio.Button value="male">Male</Radio.Button>
              <Radio.Button value="female">Female</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: "Enter your age" }]}
          >
            <InputNumber min={1} max={150} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="weight"
            label={unitPreference === "imperial" ? "Weight (lbs)" : "Weight (kg)"}
            rules={[{ required: true, message: "Enter your weight" }]}
          >
            <InputNumber min={1} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="height"
            label={unitPreference === "imperial" ? "Height (inches)" : "Height (cm)"}
            rules={[{ required: true, message: "Enter your height" }]}
          >
            <InputNumber min={1} step={0.1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="activityLevel"
            label="Activity Level"
            rules={[{ required: true, message: "Select activity level" }]}
          >
            <Select options={activityOptions} />
          </Form.Item>

          <Form.Item
            name="goal"
            label="Goal"
            rules={[{ required: true, message: "Select your goal" }]}
          >
            <Select options={goalOptions} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Calculate My Targets
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});
