import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  Lightbulb, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  Plus,
  Clock
} from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    projects: 0,
    ideas: 0,
    tasks: 0,
    completedTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, ideasRes] = await Promise.all([
        api.get('/projects'),
        api.get('/ideas')
      ]);

      const projects = projectsRes.data.projects || [];
      const ideas = ideasRes.data.ideas || [];

      let totalTasks = 0;
      let completedTasks = 0;
      projects.forEach(p => {
        totalTasks += p.taskCount || 0;
        completedTasks += p.completedTasks || 0;
      });

      setStats({
        projects: projects.length,
        ideas: ideas.length,
        tasks: totalTasks,
        completedTasks
      });

      setRecentProjects(projects.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Projets', 
      value: stats.projects, 
      icon: FolderOpen, 
      color: 'bg-blue-500',
      link: '/projects'
    },
    { 
      title: 'Idées sauvegardées', 
      value: stats.ideas, 
      icon: Lightbulb, 
      color: 'bg-yellow-500',
      link: '/ideas'
    },
    { 
      title: 'Tâches complétées', 
      value: `${stats.completedTasks}/${stats.tasks}`, 
      icon: CheckCircle, 
      color: 'bg-green-500',
      link: '/projects'
    },
    { 
      title: 'Progression', 
      value: stats.tasks > 0 ? `${Math.round((stats.completedTasks / stats.tasks) * 100)}%` : '0%', 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      link: '/projects'
    }
  ];

  const quickActions = [
    { title: 'Générer une idée', icon: Lightbulb, href: '/ideas', color: 'text-yellow-600 bg-yellow-100' },
    { title: 'Nouveau projet', icon: Plus, href: '/projects', color: 'text-blue-600 bg-blue-100' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bonjour, {user?.firstName} ! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de vos projets et activités.
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          {quickActions.map((action, i) => (
            <Link key={i} to={action.href} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${action.color} font-medium`}>
              <action.icon className="w-5 h-5" />
              <span>{action.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.link}
            className="card-hover"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Projets récents</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            Voir tous
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Link key={project.id} to={`/projects/${project.id}`} className="card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className={`badge ${
                    project.stage === 'idea' ? 'badge-info' :
                    project.stage === 'development' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {project.stage === 'idea' ? 'Idée' :
                     project.stage === 'development' ? 'Développement' : 'Lancé'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{project.description || 'Aucune description'}</p>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Modifié {new Date(project.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
            <p className="text-gray-600 mb-4">Créez votre premier projet pour commencer.</p>
            <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un projet
            </Link>
          </div>
        )}
      </div>

      {/* Getting Started Guide */}
      {stats.projects === 0 && (
        <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border-0">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Guide de démarrage</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Générez une idée', desc: 'Utilisez notre générateur d\'idées' },
              { step: 2, title: 'Créez un projet', desc: 'Transformez votre idée en projet' },
              { step: 3, title: 'Business Model', desc: 'Définissez votre modèle économique' },
              { step: 4, title: 'Business Plan', desc: 'Créez votre plan d\'affaires' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
