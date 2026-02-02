import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  LayoutGrid,
  Palette,
  FileText,
  Presentation,
  ListTodo,
  Users,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, statsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/stats`)
      ]);
      setProject(projectRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  };

  const tools = [
    {
      name: 'Business Model',
      description: 'Créez votre modèle économique avec le Business Model Canvas',
      icon: LayoutGrid,
      href: `/business-model/${id}`,
      color: 'bg-blue-500',
      completed: project?.businessModel
    },
    {
      name: 'Branding',
      description: 'Générez le nom, slogan et identité visuelle',
      icon: Palette,
      href: `/branding/${id}`,
      color: 'bg-pink-500',
      completed: project?.branding
    },
    {
      name: 'Business Plan',
      description: 'Créez votre plan d\'affaires complet en PDF',
      icon: FileText,
      href: `/business-plan/${id}`,
      color: 'bg-green-500',
      completed: project?.businessPlan
    },
    {
      name: 'Pitch Deck',
      description: 'Construisez une présentation pour vos investisseurs',
      icon: Presentation,
      href: `/pitch-deck/${id}`,
      color: 'bg-purple-500',
      completed: project?.pitchDeck
    },
    {
      name: 'Gestion de Tâches',
      description: 'Gérez vos tâches avec un tableau Kanban',
      icon: ListTodo,
      href: `/tasks/${id}`,
      color: 'bg-orange-500',
      completed: false
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Projet non trouvé</h2>
        <Link to="/projects" className="text-primary-600 hover:underline mt-2 inline-block">
          Retour aux projets
        </Link>
      </div>
    );
  }

  const taskProgress = stats?.tasks?.total > 0 
    ? Math.round((stats.tasks.done / stats.tasks.total) * 100) 
    : 0;

  const completionItems = [
    { name: 'Business Model', done: stats?.completion?.businessModel },
    { name: 'Branding', done: stats?.completion?.branding },
    { name: 'Business Plan', done: stats?.completion?.businessPlan },
    { name: 'Pitch Deck', done: stats?.completion?.pitchDeck }
  ];

  const completedCount = completionItems.filter(i => i.done).length;
  const overallProgress = Math.round((completedCount / completionItems.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{project.project.name}</h1>
          <p className="text-gray-600">{project.project.description || 'Aucune description'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
              <p className="text-sm text-gray-600">Progression globale</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.tasks?.done || 0}/{stats?.tasks?.total || 0}</p>
              <p className="text-sm text-gray-600">Tâches complétées</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.teamMembers || 0}</p>
              <p className="text-sm text-gray-600">Membres d'équipe</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedCount}/4</p>
              <p className="text-sm text-gray-600">Documents créés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Progression du projet</h3>
        <div className="space-y-3">
          {completionItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                {item.done && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span className={item.done ? 'text-gray-900' : 'text-gray-500'}>{item.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progression globale</span>
            <span className="font-medium text-gray-900">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Outils du projet</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <Link 
              key={index} 
              to={tool.href}
              className="card-hover relative overflow-hidden"
            >
              {tool.completed && (
                <div className="absolute top-3 right-3">
                  <span className="badge-success">Complété</span>
                </div>
              )}
              <div className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-4`}>
                <tool.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
