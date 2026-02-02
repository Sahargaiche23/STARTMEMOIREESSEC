import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, ChevronLeft, ChevronRight, Presentation, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PitchDeck = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [pitchDeck, setPitchDeck] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [editingSlide, setEditingSlide] = useState(null);
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, deckRes, templatesRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/pitch-deck/project/${projectId}`),
        api.get('/pitch-deck/templates')
      ]);

      setProject(projectRes.data.project);
      setTemplates(templatesRes.data.templates || []);

      if (deckRes.data.pitchDeck) {
        setPitchDeck(deckRes.data.pitchDeck);
        setSlides(deckRes.data.pitchDeck.slides || []);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (template) => {
    try {
      const response = await api.post(`/pitch-deck/project/${projectId}/create`, { template });
      setPitchDeck(response.data.pitchDeck);
      setSlides(response.data.pitchDeck.slides || []);
      toast.success('Pitch deck créé !');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/pitch-deck/project/${projectId}/slides`, { slides });
      toast.success('Pitch deck sauvegardé');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) {
      toast.error('Vous devez garder au moins une slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
    }
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now(),
      type: 'custom',
      title: 'Nouvelle slide',
      content: ''
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!pitchDeck) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${projectId}`} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pitch Deck</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>

        <div className="card text-center py-12">
          <Presentation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Créer votre Pitch Deck</h2>
          <p className="text-gray-600 mb-8">Choisissez un template pour commencer</p>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => createDeck(template.id)}
                className="card-hover text-left"
              >
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <span className="badge-info">{template.slideCount} slides</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPresenting) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-4xl aspect-video bg-white rounded-2xl shadow-2xl p-12 flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {slides[currentSlide]?.title}
            </h1>
            <div className="text-xl text-gray-600 whitespace-pre-wrap">
              {slides[currentSlide]?.content}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex items-center justify-between bg-gray-800">
          <button
            onClick={() => setIsPresenting(false)}
            className="text-white hover:text-gray-300"
          >
            Quitter
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 text-white hover:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 text-white hover:bg-gray-700 rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div></div>
        </div>
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pitch Deck</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsPresenting(true)} className="btn-secondary flex items-center gap-2">
            <Presentation className="w-5 h-5" />
            Présenter
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Slides List */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Slides</h3>
              <button onClick={addSlide} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id || index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    currentSlide === index 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">Slide {index + 1}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{slide.title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Editor */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Slide {currentSlide + 1} - {slides[currentSlide]?.type || 'custom'}
              </h3>
              <button
                onClick={() => deleteSlide(currentSlide)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={slides[currentSlide]?.title || ''}
                  onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                  className="input-field"
                  placeholder="Titre de la slide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu
                </label>
                <textarea
                  value={slides[currentSlide]?.content || ''}
                  onChange={(e) => updateSlide(currentSlide, 'content', e.target.value)}
                  className="input-field resize-none min-h-[200px]"
                  placeholder="Contenu de la slide..."
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Aperçu</h4>
              <div className="aspect-video bg-white border-2 border-gray-200 rounded-xl p-8 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {slides[currentSlide]?.title || 'Titre'}
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {slides[currentSlide]?.content || 'Contenu de la slide'}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
              <span className="text-gray-500">
                {currentSlide + 1} / {slides.length}
              </span>
              <button
                onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                disabled={currentSlide === slides.length - 1}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;
