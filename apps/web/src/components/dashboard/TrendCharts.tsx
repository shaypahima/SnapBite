import { useState } from "react";
import { Segmented, Empty, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "@/lib/axios";
import styles from "./TrendCharts.module.css";

interface TrendPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function TrendCharts() {
  const [range, setRange] = useState<"week" | "month">("week");

  const { data, isLoading } = useQuery<TrendPoint[]>({
    queryKey: ["stats", "trends", range],
    queryFn: () =>
      api.get(`/api/stats/trends?range=${range}`).then((r) => r.data),
  });

  const formatted = (data || []).map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className={styles.container}>
      <div className={styles.toggle}>
        <Segmented
          options={[
            { label: "Week", value: "week" },
            { label: "Month", value: "month" },
          ]}
          value={range}
          onChange={(v) => setRange(v as "week" | "month")}
        />
      </div>

      {isLoading ? (
        <Spin style={{ display: "block", textAlign: "center" }} />
      ) : formatted.length === 0 ? (
        <Empty description="No data" />
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              interval={range === "month" ? 4 : 0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Calories"
            />
            <Line
              type="monotone"
              dataKey="protein"
              stroke="#52c41a"
              strokeWidth={1}
              dot={false}
              name="Protein (g)"
            />
            <Line
              type="monotone"
              dataKey="carbs"
              stroke="#faad14"
              strokeWidth={1}
              dot={false}
              name="Carbs (g)"
            />
            <Line
              type="monotone"
              dataKey="fat"
              stroke="#eb2f96"
              strokeWidth={1}
              dot={false}
              name="Fat (g)"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
