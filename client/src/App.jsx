import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import GenerateQR from "./pages/QRGenerate";
import ScanQR from "./pages/ScanQR";
import AdminClasses from "./pages/AdminClasses";
import AttendanceReport from "./pages/AttendanceReport";
import AdminReports from "./pages/AdminReports";

const HomePage = () => {
  const { user, loading } = useContext(AuthContext);  // ✅ Fixed - removed ()

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === "admin"
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<HomePage />} />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/generate-qr" element={
            <ProtectedRoute role="admin">
              <GenerateQR />
            </ProtectedRoute>
          } />

          <Route path="/admin/classes" element={
            <ProtectedRoute role="admin">
              <AdminClasses />
            </ProtectedRoute>
          } />

          <Route path="/admin/reports" element={
            <ProtectedRoute role="admin">
              <AdminReports />
            </ProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />

          <Route path="/student/scan" element={
            <ProtectedRoute role="student">
              <ScanQR />
            </ProtectedRoute>
          } />

          <Route path="/student/attendance" element={
            <ProtectedRoute role="student">
              <AttendanceReport />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;