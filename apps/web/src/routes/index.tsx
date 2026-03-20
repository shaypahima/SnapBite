import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Card, Typography, DatePicker } from "antd";
import { PlusOutlined, LeftOutlined, RightOutlined, SettingOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import dayjs from "dayjs";
import api from "@/lib/axios";
import { signOut } from "@/lib/auth";
import DailyProgress from "@/components/dashboard/DailyProgress";
import Diary from "@/components/dashboard/Diary";
import styles from "./index.module.css";

const { Title } = Typography;

function DashboardPage() {
  const [date, setDate] = useState(dayjs());
  const dateStr = date.format("YYYY-MM-DD");

  const { data: stats } = useQuery({
    queryKey: ["stats", "daily", dateStr],
    queryFn: () => api.get(`/api/stats/daily?date=${dateStr}`).then((r) => r.data),
  });

  const { data: meals } = useQuery({
    queryKey: ["meals", dateStr],
    queryFn: () => api.get(`/api/meals?date=${dateStr}`).then((r) => r.data),
  });

  const goDay = (offset: number) => setDate(date.add(offset, "day"));
  const isToday = date.isSame(dayjs(), "day");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={3} style={{ margin: 0 }}>SnapBite</Title>
        <div className={styles.headerActions}>
          <Link to="/log">
            <Button type="primary" icon={<PlusOutlined />}>Log Meal</Button>
          </Link>
          <Link to="/settings">
            <Button icon={<SettingOutlined />} />
          </Link>
          <Button size="small" onClick={() => signOut()}>Sign out</Button>
        </div>
      </div>

      <div className={styles.dateNav}>
        <Button icon={<LeftOutlined />} onClick={() => goDay(-1)} type="text" />
        <DatePicker
          value={date}
          onChange={(d) => d && setDate(d)}
          allowClear={false}
          format="ddd, MMM D"
        />
        <Button icon={<RightOutlined />} onClick={() => goDay(1)} type="text" disabled={isToday} />
      </div>

      {stats && (
        <Card className={styles.section}>
          <DailyProgress totals={stats.totals} targets={stats.targets} />
        </Card>
      )}

      <Card title="Meals" className={styles.section}>
        <Diary meals={meals || []} />
      </Card>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: DashboardPage,
});
