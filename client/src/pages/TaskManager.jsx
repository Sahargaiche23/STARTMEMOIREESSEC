import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Calendar,
  Flag,
  User,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TaskManager = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [columns, setColumns] = useState({
    todo: { title: 'À faire', tasks: [] },
    in_progress: { title: 'En cours', tasks: [] },
    done: { title: 'Terminé', tasks: [] }
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo'
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, kanbanRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks/project/${projectId}/kanban`)
      ]);

      setProject(projectRes.data.project);
      setColumns(kanbanRes.data.columns);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
        toast.success('Tâche mise à jour');
      } else {
        await api.post(`/tasks/project/${projectId}`, formData);
        toast.success('Tâche créée');
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Supprimer cette tâche ?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Tâche supprimée');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const openModal = (task = null, status = 'todo') => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        status: task.status
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        status
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' });
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700'
  };

  const priorityLabels = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute'
  };

  const columnColors = {
    todo: 'border-gray-300',
    in_progress: 'border-blue-400',
    done: 'border-green-400'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalTasks = Object.values(columns).reduce((acc, col) => acc + col.tasks.length, 0);
  const doneTasks = columns.done.tasks.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${projectId}`} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
            {doneTasks}/{totalTasks} tâches complétées
          </div>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nouvelle tâche
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(columns).map(([status, column]) => (
          <div key={status} className={`bg-gray-50 rounded-xl p-4 border-t-4 ${columnColors[status]}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {column.title}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({column.tasks.length})
                </span>
              </h3>
              <button 
                onClick={() => openModal(null, status)}
                className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 min-h-[200px]">
              {column.tasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(task)}
                        className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${priorityColors[task.priority]}`}>
                      <Flag className="w-3 h-3 mr-1" />
                      {priorityLabels[task.priority]}
                    </span>
                    {task.dueDate && (
                      <span className="badge bg-gray-100 text-gray-700">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>

                  {status !== 'done' && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                      {status === 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Démarrer →
                        </button>
                      )}
                      {status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'todo')}
                            className="text-xs text-gray-600 hover:underline"
                          >
                            ← À faire
                          </button>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'done')}
                            className="text-xs text-green-600 hover:underline"
                          >
                            Terminer ✓
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {column.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Aucune tâche</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Titre de la tâche"
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
                  placeholder="Description de la tâche..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date limite
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="todo">À faire</option>
                  <option value="in_progress">En cours</option>
                  <option value="done">Terminé</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Enregistrer' : 'Créer la tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
