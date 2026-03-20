import { Button, Upload, message } from "antd";
import { CameraOutlined, UploadOutlined } from "@ant-design/icons";
import { useState, useRef } from "react";
import api from "@/lib/axios";
import MealPreview from "./MealPreview";
import styles from "./PhotoMealInput.module.css";

interface PhotoMealInputProps {
  onSaved: () => void;
}

export default function PhotoMealInput({ onSaved }: PhotoMealInputProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);

      const base64 = dataUrl.split(",")[1];
      setLoading(true);
      setResult(null);
      try {
        const { data } = await api.post("/api/meals/analyze-photo", { image: base64 });
        setResult(data);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Could not identify food. Please retake the photo.";
        message.error(msg);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      {!preview ? (
        <div className={styles.uploadArea}>
          <Button
            type="primary"
            icon={<CameraOutlined />}
            size="large"
            onClick={handleCapture}
            block
          >
            Take Photo
          </Button>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              processFile(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} size="large" block style={{ marginTop: 12 }}>
              Upload Image
            </Button>
          </Upload>
        </div>
      ) : (
        <div className={styles.previewArea}>
          <img src={preview} alt="Meal" className={styles.image} />
          <Button onClick={handleReset} style={{ marginTop: 8 }}>
            Retake
          </Button>
        </div>
      )}

      {loading && <div className={styles.analyzing}>Analyzing your meal...</div>}

      {result && (
        <MealPreview items={result.items} totals={result.totals} onSaved={onSaved} />
      )}
    </div>
  );
}
