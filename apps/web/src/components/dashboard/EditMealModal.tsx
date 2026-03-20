import { useEffect, useState } from "react";
import { Modal, Input, InputNumber, Typography, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import styles from "./EditMealModal.module.css";

const { Text } = Typography;

interface MealItem {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  food: { name: string };
}

interface Meal {
  id: string;
  category: string | null;
  loggedAt: string;
  items: MealItem[];
}

interface EditMealModalProps {
  meal: Meal | null;
  open: boolean;
  onClose: () => void;
  dateStr: string;
}

interface EditableItem {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function EditMealModal({ meal, open, onClose, dateStr }: EditMealModalProps) {
  const [items, setItems] = useState<EditableItem[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (meal) {
      setItems(
        meal.items.map((i) => ({
          id: i.id,
          name: i.food.name,
          quantity: i.quantity,
          calories: i.calories,
          protein: i.protein,
          carbs: i.carbs,
          fat: i.fat,
        }))
      );
    }
  }, [meal]);

  const mutation = useMutation({
    mutationFn: (data: { items: EditableItem[] }) =>
      api.put(`/api/meals/${meal?.id}`, data),
    onSuccess: () => {
      message.success("Meal updated");
      queryClient.invalidateQueries({ queryKey: ["meals", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["stats", "daily", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["stats", "trends"] });
      onClose();
    },
  });

  const updateItem = (idx: number, field: keyof EditableItem, value: any) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  return (
    <Modal
      title="Edit Meal"
      open={open}
      onOk={() => mutation.mutate({ items })}
      onCancel={onClose}
      confirmLoading={mutation.isPending}
      width={600}
    >
      <div>
        <div className={styles.row} style={{ marginBottom: 4 }}>
          <Text strong className={styles.name}>Food</Text>
          <Text strong className={styles.number}>Qty (g)</Text>
          <Text strong className={styles.number}>Cal</Text>
          <Text strong className={styles.number}>P (g)</Text>
          <Text strong className={styles.number}>C (g)</Text>
          <Text strong className={styles.number}>F (g)</Text>
        </div>
        {items.map((item, idx) => (
          <div key={item.id} className={styles.row}>
            <Input
              className={styles.name}
              value={item.name}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
            />
            <InputNumber
              className={styles.number}
              value={item.quantity}
              min={1}
              onChange={(v) => updateItem(idx, "quantity", v || 1)}
            />
            <InputNumber
              className={styles.number}
              value={item.calories}
              min={0}
              onChange={(v) => updateItem(idx, "calories", v || 0)}
            />
            <InputNumber
              className={styles.number}
              value={item.protein}
              min={0}
              step={0.1}
              onChange={(v) => updateItem(idx, "protein", v || 0)}
            />
            <InputNumber
              className={styles.number}
              value={item.carbs}
              min={0}
              step={0.1}
              onChange={(v) => updateItem(idx, "carbs", v || 0)}
            />
            <InputNumber
              className={styles.number}
              value={item.fat}
              min={0}
              step={0.1}
              onChange={(v) => updateItem(idx, "fat", v || 0)}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}
