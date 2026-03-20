import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h1>SnapBite</h1>
      <p>AI-Powered Nutrition Tracker</p>
    </div>
  ),
});
