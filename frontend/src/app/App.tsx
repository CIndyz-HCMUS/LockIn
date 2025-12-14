import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";     // ✅ đổi ./ -> ../
import { AuthGuard } from "../components/AuthGuard";    // ✅ đổi ./ -> ../

import { LoginPage } from "../pages/Auth/LoginPage";
import { SignUpPage } from "../pages/Auth/SignupPage";
import { OnBoardingPage } from "../pages/Onboarding/OnboardingPage";

import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { FoodsPage } from "../pages/Foods/FoodsPage";
import { ExercisesPage } from "../pages/Exercises/ExercisesPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { RelaxationPage } from "../pages/Relaxation/RelaxationPage";
import { ReportPage } from "../pages/Report/ReportPage";
import { PlanPage } from "../pages/Plan/PlanPage";
import { QAPage } from "../pages/QA/QAPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/onboarding" element={<OnBoardingPage />} />

        {/* protected */}
        <Route element={<AuthGuard />}>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/meal" element={<FoodsPage />} />
            <Route path="/activity" element={<ExercisesPage />} />
            <Route path="/relaxation" element={<RelaxationPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/qa" element={<QAPage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}