import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Download, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const BusinessPlan = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState(null);
  const [businessPlan, setBusinessPlan] = useState({
    executiveSummary: '',
    companyDescription: '',
    marketAnalysis: '',
    organization: '',
    productLine: '',
    marketing: '',
    fundingRequest: '',
    financialProjections: '',
    appendix: ''
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, planRes, templateRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/business-plan/project/${projectId}`),
        api.get('/business-plan/template')
      ]);

      setProject(projectRes.data.project);

      if (planRes.data.businessPlan) {
        setBusinessPlan(planRes.data.businessPlan);
      } else if (templateRes.data.template) {
        setBusinessPlan(templateRes.data.template);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/business-plan/project/${projectId}`, businessPlan);
      toast.success('Business Plan sauvegardé');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      await api.post(`/business-plan/project/${projectId}`, businessPlan);
      const response = await api.post(`/business-plan/project/${projectId}/pdf`);
      toast.success('PDF généré avec succès !');
      
      window.open(`http://localhost:5000${response.data.pdfUrl}`, '_blank');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setGenerating(false);
    }
  };

  const sections = [
    { key: 'executiveSummary', title: 'Résumé Exécutif', icon: '📋' },
    { key: 'companyDescription', title: 'Description de l\'Entreprise', icon: '🏢' },
    { key: 'marketAnalysis', title: 'Analyse de Marché', icon: '📊' },
    { key: 'organization', title: 'Organisation et Gestion', icon: '👥' },
    { key: 'productLine', title: 'Produits et Services', icon: '📦' },
    { key: 'marketing', title: 'Stratégie Marketing', icon: '📣' },
    { key: 'fundingRequest', title: 'Demande de Financement', icon: '💰' },
    { key: 'financialProjections', title: 'Projections Financières', icon: '📈' },
    { key: 'appendix', title: 'Annexes', icon: '📎' }
  ];

  const [activeSection, setActiveSection] = useState('executiveSummary');

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Business Plan</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button onClick={generatePDF} disabled={generating} className="btn-primary flex items-center gap-2">
            <Download className="w-5 h-5" />
            {generating ? 'Génération...' : 'Générer PDF'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Sections
            </h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                    activeSection === section.key 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                  {businessPlan[section.key] && businessPlan[section.key].length > 50 && (
                    <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {sections.map((section) => (
            <div 
              key={section.key}
              className={activeSection === section.key ? 'block' : 'hidden'}
            >
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{section.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                </div>
                <textarea
                  value={businessPlan[section.key]}
                  onChange={(e) => setBusinessPlan({ ...businessPlan, [section.key]: e.target.value })}
                  className="input-field resize-none min-h-[400px]"
                  placeholder={`Rédigez votre ${section.title.toLowerCase()} ici...`}
                />
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {businessPlan[section.key]?.length || 0} caractères
                  </p>
                  <div className="flex gap-2">
                    {sections.findIndex(s => s.key === activeSection) > 0 && (
                      <button
                        onClick={() => setActiveSection(sections[sections.findIndex(s => s.key === activeSection) - 1].key)}
                        className="btn-secondary text-sm"
                      >
                        ← Précédent
                      </button>
                    )}
                    {sections.findIndex(s => s.key === activeSection) < sections.length - 1 && (
                      <button
                        onClick={() => setActiveSection(sections[sections.findIndex(s => s.key === activeSection) + 1].key)}
                        className="btn-primary text-sm"
                      >
                        Suivant →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Progression</h3>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {sections.map((section) => {
            const hasContent = businessPlan[section.key] && businessPlan[section.key].length > 50;
            return (
              <div 
                key={section.key}
                className={`p-2 rounded-lg text-center ${hasContent ? 'bg-green-100' : 'bg-gray-100'}`}
              >
                <span className="text-lg">{section.icon}</span>
                <p className={`text-xs mt-1 ${hasContent ? 'text-green-700' : 'text-gray-500'}`}>
                  {hasContent ? '✓' : '-'}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-gray-600 mt-4">
          {sections.filter(s => businessPlan[s.key] && businessPlan[s.key].length > 50).length} / {sections.length} sections complétées
        </p>
      </div>
    </div>
  );
};

export default BusinessPlan;
