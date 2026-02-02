import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const BusinessModel = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('saas');
  const [canvas, setCanvas] = useState({
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: ''
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, modelRes, templatesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/business-model/project/${projectId}`),
        api.get('/business-model/templates')
      ]);

      setProject(projectRes.data.project);
      setTemplates(templatesRes.data.templates || []);

      if (modelRes.data.businessModel) {
        setCanvas(modelRes.data.businessModel);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const generateFromTemplate = async () => {
    try {
      const response = await api.post('/business-model/generate', {
        projectId,
        template: selectedTemplate
      });
      setCanvas(response.data.businessModel);
      toast.success('Template appliqué !');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/business-model/project/${projectId}`, canvas);
      toast.success('Business Model sauvegardé');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setCanvas({ ...canvas, [field]: value });
  };

  const canvasFields = [
    { key: 'keyPartners', label: 'Partenaires Clés', description: 'Qui sont vos partenaires et fournisseurs clés ?', color: 'bg-blue-50 border-blue-200' },
    { key: 'keyActivities', label: 'Activités Clés', description: 'Quelles activités clés votre proposition de valeur requiert-elle ?', color: 'bg-green-50 border-green-200' },
    { key: 'keyResources', label: 'Ressources Clés', description: 'Quelles ressources clés votre proposition de valeur requiert-elle ?', color: 'bg-yellow-50 border-yellow-200' },
    { key: 'valuePropositions', label: 'Proposition de Valeur', description: 'Quelle valeur apportez-vous au client ?', color: 'bg-red-50 border-red-200' },
    { key: 'customerRelationships', label: 'Relations Clients', description: 'Quel type de relation chaque segment client attend-il ?', color: 'bg-purple-50 border-purple-200' },
    { key: 'channels', label: 'Canaux', description: 'Par quels canaux vos segments clients veulent-ils être atteints ?', color: 'bg-indigo-50 border-indigo-200' },
    { key: 'customerSegments', label: 'Segments Clients', description: 'Pour qui créez-vous de la valeur ?', color: 'bg-pink-50 border-pink-200' },
    { key: 'costStructure', label: 'Structure de Coûts', description: 'Quels sont les coûts les plus importants de votre modèle ?', color: 'bg-orange-50 border-orange-200' },
    { key: 'revenueStreams', label: 'Flux de Revenus', description: 'Pour quelle valeur vos clients sont-ils prêts à payer ?', color: 'bg-teal-50 border-teal-200' }
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
        <div className="flex items-center gap-4">
          <Link to={`/projects/${projectId}`} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Business Model Canvas</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Template Selector */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appliquer un template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="input-field"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generateFromTemplate}
            className="btn-secondary flex items-center gap-2 md:mt-7"
          >
            <RefreshCw className="w-5 h-5" />
            Appliquer
          </button>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Row 1 */}
        <div className={`card border-2 ${canvasFields[0].color}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[0].label}</h3>
          <p className="text-xs text-gray-500 mb-3">{canvasFields[0].description}</p>
          <textarea
            value={canvas.keyPartners}
            onChange={(e) => handleChange('keyPartners', e.target.value)}
            className="w-full h-32 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Listez vos partenaires clés..."
          />
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className={`card border-2 ${canvasFields[1].color}`}>
            <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[1].label}</h3>
            <p className="text-xs text-gray-500 mb-3">{canvasFields[1].description}</p>
            <textarea
              value={canvas.keyActivities}
              onChange={(e) => handleChange('keyActivities', e.target.value)}
              className="w-full h-20 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
              placeholder="Vos activités principales..."
            />
          </div>
          <div className={`card border-2 ${canvasFields[2].color}`}>
            <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[2].label}</h3>
            <p className="text-xs text-gray-500 mb-3">{canvasFields[2].description}</p>
            <textarea
              value={canvas.keyResources}
              onChange={(e) => handleChange('keyResources', e.target.value)}
              className="w-full h-20 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
              placeholder="Vos ressources principales..."
            />
          </div>
        </div>

        <div className={`card border-2 ${canvasFields[3].color}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[3].label}</h3>
          <p className="text-xs text-gray-500 mb-3">{canvasFields[3].description}</p>
          <textarea
            value={canvas.valuePropositions}
            onChange={(e) => handleChange('valuePropositions', e.target.value)}
            className="w-full h-32 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
            placeholder="Votre proposition de valeur..."
          />
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className={`card border-2 ${canvasFields[4].color}`}>
            <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[4].label}</h3>
            <p className="text-xs text-gray-500 mb-3">{canvasFields[4].description}</p>
            <textarea
              value={canvas.customerRelationships}
              onChange={(e) => handleChange('customerRelationships', e.target.value)}
              className="w-full h-20 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
              placeholder="Type de relations..."
            />
          </div>
          <div className={`card border-2 ${canvasFields[5].color}`}>
            <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[5].label}</h3>
            <p className="text-xs text-gray-500 mb-3">{canvasFields[5].description}</p>
            <textarea
              value={canvas.channels}
              onChange={(e) => handleChange('channels', e.target.value)}
              className="w-full h-20 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
              placeholder="Vos canaux de distribution..."
            />
          </div>
        </div>

        <div className={`card border-2 ${canvasFields[6].color}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[6].label}</h3>
          <p className="text-xs text-gray-500 mb-3">{canvasFields[6].description}</p>
          <textarea
            value={canvas.customerSegments}
            onChange={(e) => handleChange('customerSegments', e.target.value)}
            className="w-full h-32 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
            placeholder="Vos segments de clients..."
          />
        </div>

        {/* Row 2 */}
        <div className={`md:col-span-2 card border-2 ${canvasFields[7].color}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[7].label}</h3>
          <p className="text-xs text-gray-500 mb-3">{canvasFields[7].description}</p>
          <textarea
            value={canvas.costStructure}
            onChange={(e) => handleChange('costStructure', e.target.value)}
            className="w-full h-24 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
            placeholder="Vos principaux coûts..."
          />
        </div>

        <div className={`md:col-span-3 card border-2 ${canvasFields[8].color}`}>
          <h3 className="font-semibold text-gray-900 mb-1">{canvasFields[8].label}</h3>
          <p className="text-xs text-gray-500 mb-3">{canvasFields[8].description}</p>
          <textarea
            value={canvas.revenueStreams}
            onChange={(e) => handleChange('revenueStreams', e.target.value)}
            className="w-full h-24 p-2 text-sm border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500"
            placeholder="Vos sources de revenus..."
          />
        </div>
      </div>
    </div>
  );
};

export default BusinessModel;
