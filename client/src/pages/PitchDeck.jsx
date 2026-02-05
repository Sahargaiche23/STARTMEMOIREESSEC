import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, ChevronLeft, ChevronRight, Presentation, 
  Image, Video, Smile, Type, Layout, Palette, Upload, X, Sparkles,
  Square, Circle, Triangle, Star, Heart, Zap, Award, Target, Rocket
} from 'lucide-react';
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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showMediaPanel, setShowMediaPanel] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState('images');
  const fileInputRef = useRef(null);

  // Creative slide templates
  const slideTemplates = [
    { id: 'minimal', name: 'Minimal', colors: { bg: '#FFFFFF', text: '#1F2937', accent: '#6366F1' } },
    { id: 'dark', name: 'Sombre', colors: { bg: '#1F2937', text: '#FFFFFF', accent: '#F59E0B' } },
    { id: 'gradient-blue', name: 'Dégradé Bleu', colors: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#FFFFFF', accent: '#FBBF24' } },
    { id: 'gradient-sunset', name: 'Coucher de soleil', colors: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#FFFFFF', accent: '#FDE68A' } },
    { id: 'gradient-ocean', name: 'Océan', colors: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#FFFFFF', accent: '#1E3A8A' } },
    { id: 'gradient-forest', name: 'Forêt', colors: { bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', text: '#FFFFFF', accent: '#064E3B' } },
    { id: 'corporate', name: 'Corporate', colors: { bg: '#F3F4F6', text: '#111827', accent: '#2563EB' } },
    { id: 'creative', name: 'Créatif', colors: { bg: '#FDF4FF', text: '#701A75', accent: '#D946EF' } },
  ];

  // Stickers/Icons
  const stickers = [
    { id: 'rocket', icon: Rocket, label: 'Fusée' },
    { id: 'star', icon: Star, label: 'Étoile' },
    { id: 'heart', icon: Heart, label: 'Cœur' },
    { id: 'zap', icon: Zap, label: 'Éclair' },
    { id: 'award', icon: Award, label: 'Trophée' },
    { id: 'target', icon: Target, label: 'Cible' },
  ];

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPresenting) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        setIsPresenting(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, slides.length]);

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
      content: '',
      template: selectedTemplate || 'minimal',
      media: [],
      stickers: []
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia = {
          id: Date.now(),
          type: 'image',
          url: reader.result,
          name: file.name
        };
        updateSlide(currentSlide, 'media', [...(slides[currentSlide]?.media || []), newMedia]);
        toast.success('Image ajoutée !');
      };
      reader.readAsDataURL(file);
    }
  };

  const addVideoEmbed = () => {
    const url = prompt('Entrez l\'URL de la vidéo YouTube ou Vimeo:');
    if (url) {
      let embedUrl = url;
      if (url.includes('youtube.com/watch')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      const newMedia = {
        id: Date.now(),
        type: 'video',
        url: embedUrl,
        originalUrl: url
      };
      updateSlide(currentSlide, 'media', [...(slides[currentSlide]?.media || []), newMedia]);
      toast.success('Vidéo ajoutée !');
    }
  };

  const addSticker = (sticker) => {
    const newSticker = {
      id: Date.now(),
      stickerId: sticker.id,
      x: 50,
      y: 50
    };
    updateSlide(currentSlide, 'stickers', [...(slides[currentSlide]?.stickers || []), newSticker]);
    toast.success('Autocollant ajouté !');
  };

  const removeMedia = (mediaId) => {
    const newMedia = slides[currentSlide]?.media?.filter(m => m.id !== mediaId) || [];
    updateSlide(currentSlide, 'media', newMedia);
  };

  const applyTemplate = (template) => {
    setSelectedTemplate(template.id);
    updateSlide(currentSlide, 'template', template.id);
    toast.success(`Template "${template.name}" appliqué !`);
  };

  const getTemplateStyles = (templateId) => {
    const template = slideTemplates.find(t => t.id === templateId) || slideTemplates[0];
    return template.colors;
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
    const currentStyles = getTemplateStyles(slides[currentSlide]?.template);
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div 
            className="w-full max-w-5xl aspect-video rounded-2xl shadow-2xl p-8 md:p-12 relative overflow-hidden"
            style={{ 
              background: currentStyles.bg,
              color: currentStyles.text
            }}
          >
            {/* Stickers */}
            {slides[currentSlide]?.stickers?.map((sticker) => {
              const stickerData = stickers.find(s => s.id === sticker.stickerId);
              const Icon = stickerData?.icon || Star;
              return (
                <div 
                  key={sticker.id}
                  className="absolute animate-pulse"
                  style={{ 
                    left: `${sticker.x}%`, 
                    top: `${sticker.y}%`, 
                    transform: 'translate(-50%, -50%)' 
                  }}
                >
                  <Icon className="w-16 h-16 md:w-20 md:h-20" style={{ color: currentStyles.accent }} />
                </div>
              );
            })}

            <div className="flex h-full gap-8">
              {/* Content */}
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-6" style={{ color: currentStyles.text }}>
                  {slides[currentSlide]?.title}
                </h1>
                <div className="text-lg md:text-2xl whitespace-pre-wrap opacity-90">
                  {slides[currentSlide]?.content}
                </div>
              </div>

              {/* Media */}
              {slides[currentSlide]?.media?.length > 0 && (
                <div className="w-2/5 flex flex-col justify-center gap-4">
                  {slides[currentSlide].media.map((media) => (
                    media.type === 'image' ? (
                      <img 
                        key={media.id} 
                        src={media.url} 
                        alt="" 
                        className="w-full max-h-64 object-contain rounded-xl shadow-lg"
                      />
                    ) : (
                      <div key={media.id} className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src={media.url}
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 flex items-center justify-between bg-gray-800/90 backdrop-blur">
          <button
            onClick={() => setIsPresenting(false)}
            className="px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Quitter
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white font-medium">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="text-white/50 text-sm">
            Utilisez ← → pour naviguer
          </div>
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
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="card !p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Ajouter:</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Image className="w-4 h-4" />
                Photo
              </button>
              <button
                onClick={addVideoEmbed}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Video className="w-4 h-4" />
                Vidéo
              </button>
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Smile className="w-4 h-4" />
                  Autocollants
                </button>
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hidden group-hover:grid grid-cols-3 gap-1 z-10 min-w-[150px]">
                  {stickers.map((sticker) => {
                    const Icon = sticker.icon;
                    return (
                      <button
                        key={sticker.id}
                        onClick={() => addSticker(sticker)}
                        className="p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center gap-1"
                        title={sticker.label}
                      >
                        <Icon className="w-5 h-5 text-primary-600" />
                        <span className="text-xs text-gray-500">{sticker.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="h-6 w-px bg-gray-300 mx-2" />
              <span className="text-sm font-medium text-gray-700 mr-2">Template:</span>
              <div className="flex gap-1">
                {slideTemplates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      slides[currentSlide]?.template === template.id
                        ? 'border-primary-500 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ background: template.colors.bg }}
                    title={template.name}
                  />
                ))}
                <div className="relative group">
                  <button className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center text-xs text-gray-500">
                    +
                  </button>
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-2 hidden group-hover:grid grid-cols-4 gap-1 z-10">
                    {slideTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className={`w-8 h-8 rounded border-2 transition-all ${
                          slides[currentSlide]?.template === template.id
                            ? 'border-primary-500'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ background: template.colors.bg }}
                        title={template.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={slides[currentSlide]?.title || ''}
                  onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                  className="input-field"
                  placeholder="Titre de la slide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                <textarea
                  value={slides[currentSlide]?.content || ''}
                  onChange={(e) => updateSlide(currentSlide, 'content', e.target.value)}
                  className="input-field resize-none min-h-[150px]"
                  placeholder="Contenu de la slide..."
                />
              </div>

              {/* Media Preview */}
              {(slides[currentSlide]?.media?.length > 0 || slides[currentSlide]?.stickers?.length > 0) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Médias ajoutés</label>
                  <div className="flex flex-wrap gap-2">
                    {slides[currentSlide]?.media?.map((media) => (
                      <div key={media.id} className="relative group">
                        {media.type === 'image' ? (
                          <img src={media.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => removeMedia(media.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {slides[currentSlide]?.stickers?.map((sticker) => {
                      const stickerData = stickers.find(s => s.id === sticker.stickerId);
                      const Icon = stickerData?.icon || Star;
                      return (
                        <div key={sticker.id} className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-600" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Aperçu</h4>
              {(() => {
                const styles = getTemplateStyles(slides[currentSlide]?.template);
                return (
                  <div 
                    className="aspect-video rounded-xl p-8 flex flex-col justify-center relative overflow-hidden"
                    style={{ 
                      background: styles.bg,
                      color: styles.text
                    }}
                  >
                    {/* Stickers */}
                    {slides[currentSlide]?.stickers?.map((sticker) => {
                      const stickerData = stickers.find(s => s.id === sticker.stickerId);
                      const Icon = stickerData?.icon || Star;
                      return (
                        <div 
                          key={sticker.id}
                          className="absolute"
                          style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <Icon className="w-12 h-12" style={{ color: styles.accent }} />
                        </div>
                      );
                    })}
                    
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-4" style={{ color: styles.text }}>
                          {slides[currentSlide]?.title || 'Titre'}
                        </h2>
                        <p className="whitespace-pre-wrap opacity-90">
                          {slides[currentSlide]?.content || 'Contenu de la slide'}
                        </p>
                      </div>
                      
                      {/* Media in preview */}
                      {slides[currentSlide]?.media?.length > 0 && (
                        <div className="w-1/3 flex flex-col gap-2">
                          {slides[currentSlide].media.slice(0, 2).map((media) => (
                            media.type === 'image' ? (
                              <img 
                                key={media.id} 
                                src={media.url} 
                                alt="" 
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ) : (
                              <div key={media.id} className="w-full h-24 bg-black/20 rounded-lg flex items-center justify-center">
                                <Video className="w-8 h-8 opacity-50" />
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
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
