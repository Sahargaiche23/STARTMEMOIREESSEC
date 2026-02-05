import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, FolderKanban, Lightbulb, CreditCard, TrendingUp, 
  Activity, Settings, Shield, UserCheck, UserX, DollarSign
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/activity')
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data.activities);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Projets', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'bg-purple-500', link: '/admin/projects' },
    { title: 'Idées', value: stats?.totalIdeas || 0, icon: Lightbulb, color: 'bg-yellow-500' },
    { title: 'Abonnements actifs', value: stats?.activeSubscriptions || 0, icon: UserCheck, color: 'bg-green-500' },
    { title: 'Nouveaux (7j)', value: stats?.recentUsers || 0, icon: TrendingUp, color: 'bg-cyan-500' },
    { title: 'Revenus total', value: `${stats?.totalRevenue || 0} TND`, icon: DollarSign, color: 'bg-emerald-500', link: '/admin/payments' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-600" />
            Administration
          </h1>
          <p className="text-gray-600 mt-1">Gérez votre plateforme StartUpLab</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            {card.link ? (
              <Link to={card.link} className="block">
                <StatCard {...card} />
              </Link>
            ) : (
              <StatCard {...card} />
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscriptions by Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            Répartition des abonnements
          </h3>
          <div className="space-y-3">
            {stats?.usersByPlan?.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="capitalize font-medium">{plan.plan}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        plan.plan === 'premium' ? 'bg-purple-500' : 
                        plan.plan === 'pro' ? 'bg-cyan-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${(plan.count / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-10 text-right">{plan.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Revenus ce mois
          </h3>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-green-600">{stats?.monthlyRevenue || 0} TND</p>
            <p className="text-gray-500 mt-2">Revenus des 30 derniers jours</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-500" />
          Activité récente
        </h3>
        <div className="space-y-4">
          {activity.map((item, index) => (
            <ActivityItem key={index} item={item} />
          ))}
          {activity.length === 0 && (
            <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow"
        >
          <Users className="w-6 h-6" />
          <span className="font-medium">Gérer les utilisateurs</span>
        </Link>
        <Link
          to="/admin/projects"
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow"
        >
          <FolderKanban className="w-6 h-6" />
          <span className="font-medium">Voir les projets</span>
        </Link>
        <Link
          to="/admin/payments"
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 flex items-center gap-3 hover:shadow-lg transition-shadow"
        >
          <CreditCard className="w-6 h-6" />
          <span className="font-medium">Gérer les paiements</span>
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-xl`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </>
);

const ActivityItem = ({ item }) => {
  const getIcon = () => {
    switch (item.type) {
      case 'registration': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'project': return <FolderKanban className="w-4 h-4 text-purple-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMessage = () => {
    switch (item.type) {
      case 'registration':
        return `${item.firstName} ${item.lastName} s'est inscrit`;
      case 'project':
        return `Nouveau projet "${item.name}" par ${item.userEmail}`;
      case 'payment':
        return `Paiement de ${item.amount} TND par ${item.userEmail}`;
      default:
        return 'Activité';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      {getIcon()}
      <div className="flex-1">
        <p className="text-sm">{getMessage()}</p>
        <p className="text-xs text-gray-500">
          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
