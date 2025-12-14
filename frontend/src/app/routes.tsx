import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { FoodsPage } from "../pages/Foods/FoodsPage";
import { ExercisesPage } from "../pages/Exercises/ExercisesPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/foods" element={<FoodsPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
