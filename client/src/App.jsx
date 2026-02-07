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
import PitchDeckEditor from './pages/PitchDeckEditor';
import TaskManager from './pages/TaskManager';
import TeamMembers from './pages/TeamMembers';
import InviteRegister from './pages/InviteRegister';
import ProductsSolutions from './pages/ProductsSolutions';
import MySubscriptions from './pages/MySubscriptions';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import GoogleCallback from './pages/GoogleCallback';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminProjects from './pages/admin/AdminProjects';
import AdminProducts from './pages/admin/AdminProducts';
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import AccountingTransactions from './pages/accounting/AccountingTransactions';
import AccountingBilan from './pages/accounting/AccountingBilan';
import AccountingTVA from './pages/accounting/AccountingTVA';
import AccountingExport from './pages/accounting/AccountingExport';
import SharedAccountingData from './pages/accounting/SharedAccountingData';
import ProductDemo from './pages/ProductDemo';

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

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, token } = useAuthStore();
  
  // Check if user is admin (either by role or by checking token)
  const isAdmin = user?.role === 'admin' || (token && user?.email === 'admin@startuplab.com');
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
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
        <Route path="/invite/:token" element={<InviteRegister />} />
        
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
            <PitchDeckEditor />
          </ProtectedRoute>
        } />
        <Route path="/pitch-deck-old/:projectId" element={
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
        <Route path="/team/:id" element={
          <ProtectedRoute>
            <Layout>
              <TeamMembers />
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
        <Route path="/entreprise/produits-solutions" element={
          <ProtectedRoute>
            <Layout>
              <ProductsSolutions />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/produit/demo/:slug" element={
          <ProtectedRoute>
            <Layout>
              <ProductDemo />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/mes-offres" element={
          <ProtectedRoute>
            <Layout>
              <MySubscriptions />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Accounting Routes */}
        <Route path="/comptabilite" element={
          <ProtectedRoute>
            <Layout>
              <AccountingDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/comptabilite/transactions" element={
          <ProtectedRoute>
            <Layout>
              <AccountingTransactions />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/comptabilite/bilan" element={
          <ProtectedRoute>
            <Layout>
              <AccountingBilan />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/comptabilite/tva" element={
          <ProtectedRoute>
            <Layout>
              <AccountingTVA />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/comptabilite/export" element={
          <ProtectedRoute>
            <Layout>
              <AccountingExport />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/comptabilite/shared/:token" element={<SharedAccountingData />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />
        <Route path="/admin/users" element={
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        } />
        <Route path="/admin/payments" element={
          <AdminLayout>
            <AdminPayments />
          </AdminLayout>
        } />
        <Route path="/admin/projects" element={
          <AdminLayout>
            <AdminProjects />
          </AdminLayout>
        } />
        <Route path="/admin/products" element={
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
