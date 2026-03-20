import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Button,
  Card,
  Typography,
  List,
  InputNumber,
  Empty,
  Popconfirm,
  Select,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import styles from "./favorites.module.css";

const { Title, Text } = Typography;

interface Food {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

interface Favorite {
  id: string;
  foodId: string;
  food: Food;
}

function FavoritesPage() {
  const [quickLogState, setQuickLogState] = useState<Record<string, { qty: number; cat?: string }>>({});
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: () => api.get("/api/foods/favorites").then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/foods/favorites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      message.success("Removed from favorites");
    },
  });

  const logMutation = useMutation({
    mutationFn: (data: { foodId: string; quantity: number; category?: string }) =>
      api.post("/api/foods/favorites/log", data),
    onSuccess: () => {
      message.success("Meal logged");
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const handleQuickLog = (fav: Favorite) => {
    const state = quickLogState[fav.id] || { qty: 100 };
    logMutation.mutate({
      foodId: fav.foodId,
      quantity: state.qty,
      category: state.cat,
    });
  };

  const updateState = (favId: string, updates: Partial<{ qty: number; cat: string }>) => {
    setQuickLogState((prev) => ({
      ...prev,
      [favId]: { ...({ qty: 100, ...prev[favId] }), ...updates },
    }));
  };

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Link to="/">
          <Button type="text" icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
        <Link to="/food-lookup">
          <Button icon={<SearchOutlined />}>Lookup Food</Button>
        </Link>
      </div>
      <Title level={3}>Favorites</Title>

      {favorites.length === 0 && !isLoading ? (
        <Card>
          <Empty description="No favorites yet">
            <Link to="/food-lookup">
              <Button type="primary">Look up foods</Button>
            </Link>
          </Empty>
        </Card>
      ) : (
        <List
          loading={isLoading}
          dataSource={favorites}
          renderItem={(fav) => {
            const f = fav.food;
            const state = quickLogState[fav.id] || { qty: 100 };
            return (
              <List.Item className={styles.favItem}>
                <div className={styles.favHeader}>
                  <Text strong>{f.name}</Text>
                  <div className={styles.favActions}>
                    <Popconfirm
                      title="Remove from favorites?"
                      onConfirm={() => deleteMutation.mutate(fav.id)}
                    >
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
                <div className={styles.macros}>
                  <Text type="secondary">{Math.round(f.caloriesPer100g)} cal/100g</Text>
                  <Text type="secondary">P: {f.proteinPer100g}g</Text>
                  <Text type="secondary">C: {f.carbsPer100g}g</Text>
                  <Text type="secondary">F: {f.fatPer100g}g</Text>
                </div>
                <div className={styles.quickLog}>
                  <InputNumber
                    size="small"
                    min={1}
                    value={state.qty}
                    onChange={(v) => updateState(fav.id, { qty: v || 100 })}
                    addonAfter="g"
                    style={{ width: 120 }}
                  />
                  <Select
                    size="small"
                    placeholder="Category"
                    allowClear
                    style={{ width: 110 }}
                    value={state.cat}
                    onChange={(v) => updateState(fav.id, { cat: v })}
                    options={[
                      { label: "Breakfast", value: "breakfast" },
                      { label: "Lunch", value: "lunch" },
                      { label: "Dinner", value: "dinner" },
                      { label: "Snack", value: "snack" },
                    ]}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleQuickLog(fav)}
                    loading={logMutation.isPending}
                  >
                    Log
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});
