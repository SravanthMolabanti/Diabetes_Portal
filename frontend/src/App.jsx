import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashBoard';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import AccessDenied from './pages/AccessDenied';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {

  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div>
      <Navbar />
      <Routes>

        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={<Navigate to={authUser ? authUser.role === "admin" ? "/admin" : "/dashboard" : "/login"} />} />

        <Route
          path="/dashboard"
          element={
            authUser ? (
              authUser.role !== "admin" ? (
                <UserDashboard />
              ) : (
                <AccessDenied userRole={authUser.role} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/" />} />
        <Route
          path="/admin"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <AccessDenied userRole={authUser.role} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/history"
          element={
            authUser ? (
              authUser.role !== "admin" ? (
                <History />
              ) : (
                <AccessDenied userRole={authUser.role} />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App