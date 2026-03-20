import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input, Button, Card, Typography, Tag, message, Spin } from "antd";
import { SearchOutlined, HeartOutlined, HeartFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import styles from "./food-lookup.module.css";

const { Title, Text } = Typography;

interface FoodResult {
  id: string;
  name: string;
  description: string | null;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

function FoodLookupPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<FoodResult | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const lookupMutation = useMutation({
    mutationFn: (q: string) =>
      api.get(`/api/foods/lookup?q=${encodeURIComponent(q)}`).then((r) => r.data),
    onSuccess: (data) => setResult(data),
  });

  const favMutation = useMutation({
    mutationFn: (foodId: string) =>
      api.post("/api/foods/favorites", { foodId }),
    onSuccess: (_, foodId) => {
      setSavedIds((prev) => new Set(prev).add(foodId));
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      message.success("Added to favorites");
    },
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    lookupMutation.mutate(query.trim());
  };

  return (
    <div className={styles.container}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/">
          <Button type="text" icon={<ArrowLeftOutlined />}>Back</Button>
        </Link>
      </div>
      <Title level={3}>Food Lookup</Title>

      <div className={styles.searchRow}>
        <Input
          placeholder="Search for a food..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          loading={lookupMutation.isPending}
        >
          Search
        </Button>
      </div>

      {lookupMutation.isPending && <Spin style={{ display: "block", textAlign: "center" }} />}

      {result && !lookupMutation.isPending && (
        <Card className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div>
              <Text strong style={{ fontSize: 16 }}>{result.name}</Text>
              {result.description && (
                <div><Text type="secondary">{result.description}</Text></div>
              )}
            </div>
            <Button
              type="text"
              icon={savedIds.has(result.id) ? <HeartFilled style={{ color: "#ff4d4f" }} /> : <HeartOutlined />}
              onClick={() => favMutation.mutate(result.id)}
              disabled={savedIds.has(result.id)}
            />
          </div>
          <Tag color="blue" style={{ marginTop: 8 }}>Per 100g</Tag>
          <div className={styles.macros}>
            <Text>{Math.round(result.caloriesPer100g)} cal</Text>
            <Text type="secondary">P: {result.proteinPer100g}g</Text>
            <Text type="secondary">C: {result.carbsPer100g}g</Text>
            <Text type="secondary">F: {result.fatPer100g}g</Text>
          </div>
        </Card>
      )}
    </div>
  );
}

export const Route = createFileRoute("/food-lookup")({
  component: FoodLookupPage,
});
