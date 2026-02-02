import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import IdeaGenerator from './pages/IdeaGenerator';
import BusinessModel from './pages/BusinessModel';
import Branding from './pages/Branding';
import BusinessPlan from './pages/BusinessPlan';
import PitchDeck from './pages/PitchDeck';
import TaskManager from './pages/TaskManager';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import GoogleCallback from './pages/GoogleCallback';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/ideas" element={
          <ProtectedRoute>
            <Layout>
              <IdeaGenerator />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/business-model/:projectId" element={
          <ProtectedRoute>
            <Layout>
              <BusinessModel />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/branding/:projectId" element={
          <ProtectedRoute>
            <Layout>
              <Branding />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/business-plan/:projectId" element={
          <ProtectedRoute>
            <Layout>
              <BusinessPlan />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/pitch-deck/:projectId" element={
          <ProtectedRoute>
            <Layout>
              <PitchDeck />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tasks/:projectId" element={
          <ProtectedRoute>
            <Layout>
              <TaskManager />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
