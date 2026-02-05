import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  FolderOpen, 
  Search, 
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Users,
  CheckCircle,
  X,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { canCreateProject, getPlanLimits } from '../utils/subscription';

const Projects = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    stage: 'idea'
  });

  const userPlan = user?.subscription || 'free';
  const limits = getPlanLimits(userPlan);
  const canCreate = canCreateProject(userPlan, projects.length);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
        toast.success('Projet mis à jour');
      } else {
        await api.post('/projects', formData);
        toast.success('Projet créé avec succès');
      }
      fetchProjects();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Projet supprimé');
      fetchProjects();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || '',
        industry: project.industry || '',
        stage: project.stage || 'idea'
      });
    } else {
      setEditingProject(null);
      setFormData({ name: '', description: '', industry: '', stage: 'idea' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setFormData({ name: '', description: '', industry: '', stage: 'idea' });
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const industries = [
    { value: 'tech', label: 'Technologie' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'fintech', label: 'Fintech' },
    { value: 'health', label: 'Santé' },
    { value: 'food', label: 'Agroalimentaire' },
    { value: 'services', label: 'Services' },
    { value: 'education', label: 'Éducation' },
    { value: 'other', label: 'Autre' }
  ];

  const stages = [
    { value: 'idea', label: 'Idée', color: 'badge-info' },
    { value: 'validation', label: 'Validation', color: 'badge-warning' },
    { value: 'development', label: 'Développement', color: 'badge-info' },
    { value: 'launch', label: 'Lancement', color: 'badge-success' },
    { value: 'growth', label: 'Croissance', color: 'badge-success' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600">
            Gérez tous vos projets de startup en un seul endroit.
            {limits.projects !== -1 && (
              <span className="ml-2 text-sm">
                ({projects.length}/{limits.projects} projets)
              </span>
            )}
          </p>
        </div>
        {canCreate ? (
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouveau projet
          </button>
        ) : (
          <Link to="/pricing" className="btn-secondary flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Limite atteinte - Upgrader
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="card group relative">
              {project.role === 'owner' && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openModal(project)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <Link to={`/projects/${project.id}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.role !== 'owner' ? 'bg-indigo-100' : 'bg-primary-100'}`}>
                    {project.role !== 'owner' ? (
                      <Users className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${stages.find(s => s.value === project.stage)?.color || 'badge-info'}`}>
                        {stages.find(s => s.value === project.stage)?.label || project.stage}
                      </span>
                      {project.role !== 'owner' && (
                        <span className="badge bg-indigo-100 text-indigo-700">
                          {project.role === 'admin' ? 'Admin' : project.role === 'member' ? 'Membre' : 'Lecteur'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {project.description || 'Aucune description'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>{project.completedTasks || 0}/{project.taskCount || 0} tâches</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(project.updatedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'Aucun projet trouvé' : 'Aucun projet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Essayez avec d\'autres termes.' : 'Créez votre premier projet pour commencer.'}
          </p>
          {!searchQuery && (
            <button onClick={() => openModal()} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un projet
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingProject ? 'Modifier le projet' : 'Nouveau projet'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ma super startup"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Décrivez brièvement votre projet..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur d'activité
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Sélectionner...</option>
                    {industries.map(ind => (
                      <option key={ind.value} value={ind.value}>{ind.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Étape
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="input-field"
                  >
                    {stages.map(stage => (
                      <option key={stage.value} value={stage.value}>{stage.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingProject ? 'Enregistrer' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
