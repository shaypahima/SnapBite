import { List, Tag, Typography, Empty } from "antd";
import DOMPurify from "dompurify";
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
}

const categoryColors: Record<string, string> = {
  breakfast: "orange",
  lunch: "blue",
  dinner: "purple",
  snack: "green",
};

export default function Diary({ meals }: DiaryProps) {
  if (meals.length === 0) {
    return <Empty description="No meals logged" />;
  }

  return (
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
              <Text strong>{Math.round(totalCal)} cal</Text>
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
  );
}
