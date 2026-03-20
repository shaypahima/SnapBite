import { Button, Input, InputNumber, Space } from "antd";
import { PlusOutlined, DeleteOutlined, SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import api from "@/lib/axios";
import MealPreview from "./MealPreview";
import styles from "./FormMealInput.module.css";

interface FormRow {
  name: string;
  amount: number | null;
}

interface FormMealInputProps {
  onSaved: () => void;
}

export default function FormMealInput({ onSaved }: FormMealInputProps) {
  const [rows, setRows] = useState<FormRow[]>([{ name: "", amount: null }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const updateRow = (index: number, field: keyof FormRow, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { name: "", amount: null }]);

  const removeRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const isValid = rows.every((r) => r.name.trim() && r.amount && r.amount > 0);

  const handleAnalyze = async () => {
    if (!isValid) return;
    setLoading(true);
    setResult(null);
    try {
      const items = rows.map((r) => ({ name: r.name.trim(), amount: r.amount! }));
      const { data } = await api.post("/api/meals/analyze-form", { items });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.rows}>
        {rows.map((row, i) => (
          <div key={i} className={styles.row}>
            <Input
              placeholder="Food name"
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
              className={styles.nameInput}
            />
            <InputNumber
              placeholder="Grams"
              min={1}
              value={row.amount}
              onChange={(v) => updateRow(i, "amount", v)}
              className={styles.amountInput}
              addonAfter="g"
            />
            <Button
              icon={<DeleteOutlined />}
              onClick={() => removeRow(i)}
              disabled={rows.length === 1}
              danger
              type="text"
            />
          </div>
        ))}
      </div>

      <Button icon={<PlusOutlined />} onClick={addRow} style={{ marginTop: 8 }} block type="dashed">
        Add Item
      </Button>

      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleAnalyze}
        loading={loading}
        disabled={!isValid}
        style={{ marginTop: 12 }}
        block
      >
        Analyze
      </Button>

      {result && (
        <MealPreview items={result.items} totals={result.totals} onSaved={onSaved} />
      )}
    </div>
  );
}
