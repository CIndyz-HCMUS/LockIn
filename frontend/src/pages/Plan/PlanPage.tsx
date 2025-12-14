// frontend/src/pages/Plan/PlanPage.tsx
import React from "react";

export function PlanPage() {
  return (
    <div style={{ maxWidth: 900 }}>
      <h1>My Plan</h1>
      <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
        <div style={{ fontWeight: 800 }}>Demo plan</div>
        <ul>
          <li>Calories: follow goal in Profile</li>
          <li>Water: 2000ml/day</li>
          <li>Steps: 8000/day</li>
          <li>Sleep: 7.5 hours/night</li>
        </ul>
        <button disabled>Edit plan (demo)</button>
      </div>
    </div>
  );
}
