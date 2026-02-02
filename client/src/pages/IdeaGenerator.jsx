import { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  Star, 
  StarOff,
  ArrowRight,
  Save,
  Trash2,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const IdeaGenerator = () => {
  const [ideas, setIdeas] = useState([]);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [formData, setFormData] = useState({
    industry: 'tech',
    interests: '',
    skills: '',
    budget: 'medium'
  });

  useEffect(() => {
    fetchSavedIdeas();
  }, []);

  const fetchSavedIdeas = async () => {
    try {
      const response = await api.get('/ideas');
      setSavedIdeas(response.data.ideas || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const generateIdeas = async () => {
    setLoading(true);
    try {
      const response = await api.post('/ideas/generate', formData);
      setIdeas(response.data.ideas || []);
      toast.success('Idées générées avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const saveIdea = async (idea) => {
    try {
      await api.post('/ideas', idea);
      toast.success('Idée sauvegardée');
      fetchSavedIdeas();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const deleteIdea = async (id) => {
    try {
      await api.delete(`/ideas/${id}`);
      toast.success('Idée supprimée');
      fetchSavedIdeas();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const toggleFavorite = async (id) => {
    try {
      await api.put(`/ideas/${id}/favorite`);
      fetchSavedIdeas();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const convertToProject = async (id) => {
    try {
      const response = await api.post(`/ideas/${id}/to-project`);
      toast.success('Projet créé avec succès !');
      fetchSavedIdeas();
    } catch (error) {
      toast.error('Erreur lors de la création du projet');
    }
  };

  const industries = [
    { value: 'tech', label: 'Technologie' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'fintech', label: 'Fintech' },
    { value: 'health', label: 'Santé' },
    { value: 'food', label: 'Agroalimentaire' },
    { value: 'services', label: 'Services' },
    { value: 'education', label: 'Éducation' }
  ];

  const budgets = [
    { value: 'low', label: 'Faible (< 10K TND)' },
    { value: 'medium', label: 'Moyen (10K - 50K TND)' },
    { value: 'high', label: 'Élevé (> 50K TND)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Générateur d'Idées</h1>
        <p className="text-gray-600">Trouvez l'idée de startup parfaite pour le marché tunisien.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'generate' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Générer des idées
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'saved' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Idées sauvegardées ({savedIdeas.length})
        </button>
      </div>

      {activeTab === 'generate' ? (
        <>
          {/* Generator Form */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de génération</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="input-field"
                >
                  {industries.map(ind => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget initial
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="input-field"
                >
                  {budgets.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vos intérêts (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="input-field"
                  placeholder="ex: innovation, durabilité, digital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vos compétences (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="input-field"
                  placeholder="ex: développement, marketing, finance"
                />
              </div>
            </div>

            <button
              onClick={generateIdeas}
              disabled={loading}
              className="btn-primary mt-6 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Générer des idées
                </>
              )}
            </button>
          </div>

          {/* Generated Ideas */}
          {ideas.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Idées générées</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {ideas.map((idea, index) => (
                  <div key={index} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <span className="font-medium text-gray-500 text-sm">Score: {idea.score}/100</span>
                      </div>
                      <button
                        onClick={() => saveIdea(idea)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{idea.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Problème:</span>
                          <p className="text-gray-600">{idea.problem}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Solution:</span>
                          <p className="text-gray-600">{idea.solution}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <span className="font-medium text-gray-700">Cible:</span>
                          <p className="text-gray-600">{idea.targetMarket}</p>
                        </div>
                      </div>
                    </div>

                    {idea.viability && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">Viabilité</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{idea.viability.market}%</div>
                            <div className="text-xs text-gray-500">Marché</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600">{idea.viability.competition}%</div>
                            <div className="text-xs text-gray-500">Concurrence</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{idea.viability.implementation}%</div>
                            <div className="text-xs text-gray-500">Faisabilité</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Saved Ideas */
        <div className="space-y-4">
          {savedIdeas.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {savedIdeas.map((idea) => (
                <div key={idea.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      {idea.projectName && (
                        <span className="badge-success">Projet: {idea.projectName}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleFavorite(idea.id)}
                        className={`p-2 rounded-lg ${idea.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      >
                        {idea.isFavorite ? <Star className="w-5 h-5 fill-current" /> : <StarOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => deleteIdea(idea.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{idea.description}</p>

                  {idea.problem && (
                    <div className="text-sm mb-2">
                      <span className="font-medium text-gray-700">Problème:</span>
                      <p className="text-gray-600">{idea.problem}</p>
                    </div>
                  )}

                  {!idea.projectId && (
                    <button
                      onClick={() => convertToProject(idea.id)}
                      className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                    >
                      Créer un projet
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune idée sauvegardée</h3>
              <p className="text-gray-600">Générez des idées et sauvegardez vos préférées.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IdeaGenerator;
