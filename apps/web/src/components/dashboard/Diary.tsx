import { useState } from "react";
import { List, Tag, Typography, Empty, Button, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import api from "@/lib/axios";
import EditMealModal from "./EditMealModal";
import styles from "./Diary.module.css";

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

interface DiaryProps {
  meals: Meal[];
  dateStr: string;
}

const categoryColors: Record<string, string> = {
  breakfast: "orange",
  lunch: "blue",
  dinner: "purple",
  snack: "green",
};

export default function Diary({ meals, dateStr }: DiaryProps) {
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (mealId: string) => api.delete(`/api/meals/${mealId}`),
    onSuccess: () => {
      message.success("Meal deleted");
      queryClient.invalidateQueries({ queryKey: ["meals", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["stats", "daily", dateStr] });
      queryClient.invalidateQueries({ queryKey: ["stats", "trends"] });
    },
  });

  if (meals.length === 0) {
    return <Empty description="No meals logged" />;
  }

  return (
    <>
      <List
        dataSource={meals}
        renderItem={(meal) => {
          const totalCal = meal.items.reduce((s, i) => s + i.calories, 0);
          return (
            <List.Item className={styles.mealItem}>
              <div className={styles.mealHeader}>
                <div>
                  {meal.category && (
                    <Tag color={categoryColors[meal.category]}>{meal.category}</Tag>
                  )}
                  <Text type="secondary">
                    {new Date(meal.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </div>
                <div className={styles.mealActions}>
                  <Text strong>{Math.round(totalCal)} cal</Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setEditingMeal(meal)}
                  />
                  <Popconfirm
                    title="Delete this meal?"
                    onConfirm={() => deleteMutation.mutate(meal.id)}
                    okText="Delete"
                    cancelText="Cancel"
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
              <div className={styles.items}>
                {meal.items.map((item) => (
                  <div key={item.id} className={styles.foodItem}>
                    <Text>{DOMPurify.sanitize(item.food.name)}</Text>
                    <Text type="secondary">{Math.round(item.calories)} cal</Text>
                  </div>
                ))}
              </div>
            </List.Item>
          );
        }}
      />
      <EditMealModal
        meal={editingMeal}
        open={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        dateStr={dateStr}
      />
    </>
  );
}
