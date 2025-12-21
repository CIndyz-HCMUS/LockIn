import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainShellLayout } from "../layouts/MainShellLayout";

import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { MealPage } from "../pages/Meal/MealPage";
import { ActivityPage } from "../pages/Activity/ActivityPage";
import { RelaxationPage } from "../pages/Relaxation/RelaxationPage";
import { ReportPage } from "../pages/Report/ReportPage";
import { MyPlanPage } from "../pages/MyPlan/MyPlanPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import LoginPage from "../pages/Auth/LoginPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainShellLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/meal" element={<MealPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/relaxation" element={<RelaxationPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/my-plan" element={<MyPlanPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
