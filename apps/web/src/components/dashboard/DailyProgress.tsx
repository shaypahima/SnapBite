import { Progress, Typography, Row, Col } from "antd";
import styles from "./DailyProgress.module.css";

const { Text, Title } = Typography;

interface DailyProgressProps {
  totals: { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories: number; protein: number; carbs: number; fat: number };
}

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className={styles.macroBar}>
      <div className={styles.macroLabel}>
        <Text strong>{label}</Text>
        <Text type="secondary">{current}g / {target}g</Text>
      </div>
      <Progress percent={Math.round(percent)} strokeColor={color} size="small" />
    </div>
  );
}

export default function DailyProgress({ totals, targets }: DailyProgressProps) {
  const caloriePercent = targets.calories > 0 ? Math.min((totals.calories / targets.calories) * 100, 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.calorieSection}>
        <Progress
          type="circle"
          percent={Math.round(caloriePercent)}
          format={() => (
            <div>
              <Title level={3} style={{ margin: 0 }}>{totals.calories}</Title>
              <Text type="secondary">/ {targets.calories} cal</Text>
            </div>
          )}
          size={160}
          strokeColor={caloriePercent > 100 ? "#ff4d4f" : "#1890ff"}
        />
      </div>
      <Row gutter={16} className={styles.macros}>
        <Col span={8}>
          <MacroBar label="Protein" current={totals.protein} target={targets.protein} color="#52c41a" />
        </Col>
        <Col span={8}>
          <MacroBar label="Carbs" current={totals.carbs} target={targets.carbs} color="#faad14" />
        </Col>
        <Col span={8}>
          <MacroBar label="Fat" current={totals.fat} target={targets.fat} color="#eb2f96" />
        </Col>
      </Row>
    </div>
  );
}
