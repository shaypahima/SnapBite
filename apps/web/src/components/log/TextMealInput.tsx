import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useState } from "react";
import api from "@/lib/axios";
import MealPreview from "./MealPreview";

const { TextArea } = Input;

interface TextMealInputProps {
  onSaved: () => void;
}

export default function TextMealInput({ onSaved }: TextMealInputProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/api/meals/analyze-text", { text });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TextArea
        rows={3}
        placeholder='Describe what you ate, e.g. "3 eggs, toast with butter, and orange juice"'
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleAnalyze();
          }
        }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleAnalyze}
        loading={loading}
        disabled={!text.trim()}
        style={{ marginTop: 12 }}
        block
      >
        Analyze
      </Button>

      {result && (
        <MealPreview
          items={result.items}
          totals={result.totals}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
