import { Table, Select, Button, Typography, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useState } from "react";
import DOMPurify from "dompurify";
import api from "@/lib/axios";
import type { FoodItem } from "shared";
import styles from "./MealPreview.module.css";

const { Text } = Typography;

interface MealPreviewProps {
  items: (FoodItem & { estimatedGrams?: number; description?: string })[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  onSaved: () => void;
}

const categoryOptions = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];

export default function MealPreview({ items, totals, onSaved }: MealPreviewProps) {
  const [category, setCategory] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  const columns = [
    {
      title: "Food",
      dataIndex: "name",
      key: "name",
      render: (name: string) => DOMPurify.sanitize(name),
    },
    { title: "Cal", dataIndex: "calories", key: "calories", render: (v: number) => Math.round(v) },
    { title: "Protein", dataIndex: "protein", key: "protein", render: (v: number) => `${Math.round(v)}g` },
    { title: "Carbs", dataIndex: "carbs", key: "carbs", render: (v: number) => `${Math.round(v)}g` },
    { title: "Fat", dataIndex: "fat", key: "fat", render: (v: number) => `${Math.round(v)}g` },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/api/meals", { items, category });
      message.success("Meal logged!");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.preview}>
      <Table
        dataSource={items.map((item, i) => ({ ...item, key: i }))}
        columns={columns}
        pagination={false}
        size="small"
        footer={() => (
          <div className={styles.totals}>
            <Text strong>Total: </Text>
            <Text>{Math.round(totals.calories)} cal</Text>
            <Text> · {Math.round(totals.protein)}g P</Text>
            <Text> · {Math.round(totals.carbs)}g C</Text>
            <Text> · {Math.round(totals.fat)}g F</Text>
          </div>
        )}
      />

      <div className={styles.actions}>
        <Select
          placeholder="Category (optional)"
          options={categoryOptions}
          allowClear
          onChange={setCategory}
          style={{ width: 200 }}
        />
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          Save Meal
        </Button>
      </div>
    </div>
  );
}
