import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { TenantManagementPage } from './pages/TenantManagementPage';
import { ReminderManagementPage } from './pages/ReminderManagementPage';
import { ConfigManagementPage } from './pages/ConfigManagementPage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 60px)', paddingTop: '20px' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/tenants" element={
                <ProtectedRoute>
                    <TenantManagementPage />
                </ProtectedRoute>
            } />
            <Route path="/reminders" element={
              <ProtectedRoute>
                <ReminderManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/config" element={
              <ProtectedRoute>
                <ConfigManagementPage />
              </ProtectedRoute>
            } />
            {/* 捕获所有未匹配的路由，重定向到首页 */}
            <Route path="*" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
