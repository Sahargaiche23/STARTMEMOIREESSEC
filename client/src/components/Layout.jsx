import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Lightbulb, 
  FolderOpen, 
  User, 
  LogOut, 
  Menu, 
  X,
  Rocket,
  CreditCard,
  Shield,
  Package,
  Calculator,
  Receipt,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';
import api from '../utils/api';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accountingOpen, setAccountingOpen] = useState(false);
  const [activeModules, setActiveModules] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    fetchActiveModules();
    fetchActiveProducts();
  }, []);

  const fetchActiveModules = async () => {
    try {
      const res = await api.get('/accounting/my-modules');
      setActiveModules(res.data.modules || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchActiveProducts = async () => {
    try {
      const res = await api.get('/products/my-products');
      const active = (res.data.products || []).filter(p => p.status === 'active');
      setActiveProducts(active);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const accountingProducts = activeProducts.filter(p => 
    p.categoryName === 'Comptabilité & Gestion' || p.slug?.includes('comptabilite') || p.slug?.includes('pack-comptabilite')
  );
  const hasAccountingModule = activeModules.length > 0 || accountingProducts.length > 0;
  const isEnterprise = user?.subscription === 'enterprise';

  const navigation = [
    { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mes Projets', href: '/projects', icon: FolderOpen },
    { name: 'Générateur d\'idées', href: '/ideas', icon: Lightbulb },
    ...(isEnterprise ? [
      { name: 'Produits & Solutions', href: '/entreprise/produits-solutions', icon: Package },
      { name: 'Mes Offres', href: '/mes-offres', icon: CreditCard },
    ] : [
      { name: 'Abonnement', href: '/pricing', icon: CreditCard },
    ]),
    { name: 'Mon Profil', href: '/profile', icon: User },
  ];

  // Define features available per product slug
  const productFeatures = {
    'pack-comptabilite-complet': [
      { name: 'Tableau de bord', href: '/comptabilite', icon: LayoutDashboard },
      { name: 'Transactions', href: '/comptabilite/transactions', icon: Receipt },
      { name: 'Bilan & Résultat', href: '/comptabilite/bilan', icon: FileText },
      { name: 'TVA Tunisie', href: '/comptabilite/tva', icon: Calculator },
      { name: 'Export', href: '/comptabilite/export', icon: FileText },
    ],
    'comptabilite-lite': [
      { name: 'Tableau de bord', href: '/comptabilite', icon: LayoutDashboard },
      { name: 'Transactions', href: '/comptabilite/transactions', icon: Receipt },
      { name: 'Export', href: '/comptabilite/export', icon: FileText },
    ],
    'comptabilite-pro': [
      { name: 'Tableau de bord', href: '/comptabilite', icon: LayoutDashboard },
      { name: 'Transactions', href: '/comptabilite/transactions', icon: Receipt },
      { name: 'Bilan & Résultat', href: '/comptabilite/bilan', icon: FileText },
    ],
    'bilan-auto': [
      { name: 'Bilan & Résultat', href: '/comptabilite/bilan', icon: FileText },
    ],
    'tva-tunisie': [
      { name: 'TVA Tunisie', href: '/comptabilite/tva', icon: Calculator },
    ],
    'export-expert': [
      { name: 'Export', href: '/comptabilite/export', icon: FileText },
    ],
  };

  // Get unique features from all activated products
  const getAccountingNav = () => {
    const allFeatures = [];
    const seenHrefs = new Set();
    
    accountingProducts.forEach(product => {
      const features = productFeatures[product.slug] || [];
      features.forEach(feature => {
        if (!seenHrefs.has(feature.href)) {
          seenHrefs.add(feature.href);
          allFeatures.push(feature);
        }
      });
    });
    
    // Sort by a logical order
    const order = ['/comptabilite', '/comptabilite/transactions', '/comptabilite/bilan', '/comptabilite/tva', '/comptabilite/export'];
    return allFeatures.sort((a, b) => order.indexOf(a.href) - order.indexOf(b.href));
  };

  const accountingNav = getAccountingNav();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Rocket className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">StartUpLab</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Accounting Module - Only show if user has active subscription */}
            {hasAccountingModule && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setAccountingOpen(!accountingOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <span>Comptabilité</span>
                  </div>
                  {accountingOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {accountingOpen && (
                  <div className="mt-1 ml-2 space-y-1">
                    {accountingNav.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`sidebar-link text-sm ${isActive ? 'active' : ''}`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Active Products Summary */}
            {activeProducts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Offres Actives
                </p>
                <div className="space-y-1">
                  {activeProducts.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-green-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="truncate">{product.productName}</span>
                    </div>
                  ))}
                  {activeProducts.length > 3 && (
                    <Link
                      to="/mes-offres"
                      className="block px-3 py-1 text-xs text-primary-600 hover:underline"
                    >
                      +{activeProducts.length - 3} autres offres
                    </Link>
                  )}
                </div>
              </div>
            )}
            
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4 px-2">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className={`badge ${user?.subscription === 'free' ? 'badge-info' : 'badge-success'}`}>
              {user?.subscription === 'free' ? 'Plan Gratuit' : user?.subscription?.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
