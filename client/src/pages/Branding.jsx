import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Palette, Type, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Branding = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [generatedNames, setGeneratedNames] = useState([]);
  const [generatedSlogans, setGeneratedSlogans] = useState([]);
  const [logoSuggestions, setLogoSuggestions] = useState([]);
  const [colorPalettes, setColorPalettes] = useState([]);
  const [branding, setBranding] = useState({
    companyName: '',
    slogan: '',
    logoUrl: '',
    logoStyle: null,
    primaryColor: '#0ea5e9',
    secondaryColor: '#d946ef',
    fontFamily: 'Inter',
    brandVoice: ''
  });
  const [selectedLogo, setSelectedLogo] = useState(null);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const [projectRes, brandingRes, colorsRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/branding/project/${projectId}`),
        api.get('/branding/colors')
      ]);

      setProject(projectRes.data.project);
      setColorPalettes(colorsRes.data.colorPalettes || []);

      if (brandingRes.data.branding) {
        setBranding(brandingRes.data.branding);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const generateNames = async () => {
    try {
      const response = await api.post('/branding/generate-names', {
        industry: project?.industry,
        keywords: branding.companyName
      });
      setGeneratedNames(response.data.names || []);
      toast.success('Noms générés !');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const generateSlogans = async () => {
    if (!branding.companyName) {
      toast.error('Entrez d\'abord un nom d\'entreprise');
      return;
    }
    try {
      const response = await api.post('/branding/generate-slogans', {
        companyName: branding.companyName,
        industry: project?.industry
      });
      setGeneratedSlogans(response.data.slogans || []);
      toast.success('Slogans générés !');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const generateLogo = async () => {
    if (!branding.companyName) {
      toast.error('Entrez d\'abord un nom d\'entreprise');
      return;
    }
    try {
      const response = await api.post('/branding/generate-logo', {
        companyName: branding.companyName,
        industry: project?.industry
      });
      setLogoSuggestions(response.data.logoSuggestions || []);
      toast.success('Suggestions de logo générées !');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/branding/project/${projectId}`, branding);
      toast.success('Branding sauvegardé');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const fonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Raleway', 'Playfair Display', 'Merriweather'
  ];

  // Render different logo styles based on suggestion type
  const renderLogoPreview = (suggestion, companyName) => {
    const initials = companyName?.substring(0, 2).toUpperCase() || 'SU';
    const firstLetter = companyName?.charAt(0).toUpperCase() || 'S';
    
    switch (suggestion.logoType) {
      case 'monogram':
        return (
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: suggestion.colors.primary }}
          >
            {initials}
          </div>
        );
      case 'abstract':
        return (
          <div className="w-16 h-16 mx-auto mb-3 relative">
            <div 
              className="absolute inset-0 rounded-full opacity-80"
              style={{ backgroundColor: suggestion.colors.primary }}
            />
            <div 
              className="absolute inset-2 rounded-full"
              style={{ backgroundColor: suggestion.colors.secondary }}
            />
            <div 
              className="absolute inset-4 rounded-full bg-white flex items-center justify-center font-bold"
              style={{ color: suggestion.colors.primary }}
            >
              {firstLetter}
            </div>
          </div>
        );
      case 'geometric':
        return (
          <div className="w-16 h-16 mx-auto mb-3 relative flex items-center justify-center">
            <div 
              className="absolute w-12 h-12 rotate-45"
              style={{ backgroundColor: suggestion.colors.primary }}
            />
            <span className="relative z-10 text-white font-bold text-xl">{firstLetter}</span>
          </div>
        );
      case 'gradient':
        return (
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${suggestion.colors.primary}, ${suggestion.colors.secondary})` 
            }}
          >
            {initials}
          </div>
        );
      case 'outline':
        return (
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center font-bold text-2xl border-4"
            style={{ 
              borderColor: suggestion.colors.primary,
              color: suggestion.colors.primary
            }}
          >
            {initials}
          </div>
        );
      case 'circle':
        return (
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: suggestion.colors.primary }}
          >
            {initials}
          </div>
        );
      case 'hexagon':
        return (
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon 
                points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
                fill={suggestion.colors.primary}
              />
              <text x="50" y="58" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
                {initials}
              </text>
            </svg>
          </div>
        );
      case 'shield':
        return (
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <path 
                d="M50,5 L95,20 L95,60 Q95,100 50,115 Q5,100 5,60 L5,20 Z" 
                fill={suggestion.colors.primary}
              />
              <text x="50" y="70" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
                {initials}
              </text>
            </svg>
          </div>
        );
      case 'wave':
        return (
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-white font-bold text-2xl overflow-hidden relative"
            style={{ backgroundColor: suggestion.colors.primary }}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 h-6 opacity-50"
              style={{ 
                backgroundColor: suggestion.colors.secondary,
                borderRadius: '100% 100% 0 0'
              }}
            />
            <span className="relative z-10">{initials}</span>
          </div>
        );
      case 'minimal':
        return (
          <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <span 
              className="text-4xl font-light"
              style={{ color: suggestion.colors.primary }}
            >
              {firstLetter}
            </span>
            <div 
              className="w-2 h-2 rounded-full ml-1"
              style={{ backgroundColor: suggestion.colors.secondary }}
            />
          </div>
        );
      default:
        return (
          <div 
            className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
            style={{ backgroundColor: suggestion.colors.primary }}
          >
            {initials}
          </div>
        );
    }
  };

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Branding</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-5 h-5" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Nom de l'entreprise</h2>
          </div>
          
          <input
            type="text"
            value={branding.companyName}
            onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
            className="input-field mb-4"
            placeholder="Nom de votre startup"
          />

          <button onClick={generateNames} className="btn-secondary flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            Générer des suggestions
          </button>

          {generatedNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {generatedNames.map((name, i) => (
                <button
                  key={i}
                  onClick={() => setBranding({ ...branding, companyName: name })}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-full text-sm transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Slogan */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Slogan</h2>
          </div>
          
          <input
            type="text"
            value={branding.slogan}
            onChange={(e) => setBranding({ ...branding, slogan: e.target.value })}
            className="input-field mb-4"
            placeholder="Votre slogan accrocheur"
          />

          <button onClick={generateSlogans} className="btn-secondary flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4" />
            Générer des slogans
          </button>

          {generatedSlogans.length > 0 && (
            <div className="space-y-2">
              {generatedSlogans.map((slogan, i) => (
                <button
                  key={i}
                  onClick={() => setBranding({ ...branding, slogan })}
                  className="block w-full text-left px-3 py-2 bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-lg text-sm transition-colors"
                >
                  {slogan}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colors */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Couleurs</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur principale
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  className="input-field flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur secondaire
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  className="input-field flex-1"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-3">Palettes suggérées:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {colorPalettes.map((palette, i) => (
              <button
                key={i}
                onClick={() => setBranding({ 
                  ...branding, 
                  primaryColor: palette.primary, 
                  secondaryColor: palette.secondary 
                })}
                className="p-2 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
              >
                <div className="flex gap-1 mb-1">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: palette.primary }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: palette.secondary }}></div>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: palette.accent }}></div>
                </div>
                <p className="text-xs text-gray-600">{palette.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Typography */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Typographie</h2>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Police principale
          </label>
          <select
            value={branding.fontFamily}
            onChange={(e) => setBranding({ ...branding, fontFamily: e.target.value })}
            className="input-field mb-4"
          >
            {fonts.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>

          <div 
            className="p-4 bg-gray-50 rounded-lg"
            style={{ fontFamily: branding.fontFamily }}
          >
            <p className="text-2xl font-bold mb-2" style={{ color: branding.primaryColor }}>
              {branding.companyName || 'Votre Startup'}
            </p>
            <p className="text-gray-600">{branding.slogan || 'Votre slogan ici'}</p>
          </div>
        </div>

        {/* Logo Suggestions */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Suggestions de Logo</h2>
            <button onClick={generateLogo} className="btn-secondary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Générer des idées
            </button>
          </div>

          {logoSuggestions.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {logoSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedLogo(i);
                    setBranding({ 
                      ...branding, 
                      logoStyle: suggestion,
                      primaryColor: suggestion.colors.primary,
                      secondaryColor: suggestion.colors.secondary
                    });
                    toast.success(`Style "${suggestion.type}" sélectionné !`);
                  }}
                  className={`p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-105 h-40 flex flex-col items-center justify-center ${
                    selectedLogo === i 
                      ? 'ring-2 ring-primary-500 bg-primary-50 shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex-1 flex items-center justify-center w-full">
                    {renderLogoPreview(suggestion, branding.companyName)}
                  </div>
                  <div className="mt-auto pt-2">
                    <p className="font-medium text-gray-900 text-sm">{suggestion.type}</p>
                    <p className="text-xs text-gray-500">{suggestion.style}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Cliquez sur "Générer des idées" pour obtenir des suggestions de logo</p>
            </div>
          )}
        </div>

        {/* Brand Voice */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Voix de la Marque</h2>
          <textarea
            value={branding.brandVoice}
            onChange={(e) => setBranding({ ...branding, brandVoice: e.target.value })}
            className="input-field resize-none"
            rows={4}
            placeholder="Décrivez le ton et la personnalité de votre marque. Ex: Professionnel mais accessible, innovant, proche des clients..."
          />
        </div>
      </div>

      {/* Preview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h2>
        <div 
          className="p-8 rounded-xl text-center"
          style={{ 
            background: `linear-gradient(135deg, ${branding.primaryColor}15, ${branding.secondaryColor}15)`,
            fontFamily: branding.fontFamily
          }}
        >
          <div 
            className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white font-bold text-3xl"
            style={{ backgroundColor: branding.primaryColor }}
          >
            {branding.companyName?.substring(0, 2).toUpperCase() || 'SU'}
          </div>
          <h3 className="text-3xl font-bold mb-2" style={{ color: branding.primaryColor }}>
            {branding.companyName || 'Nom de votre startup'}
          </h3>
          <p className="text-lg" style={{ color: branding.secondaryColor }}>
            {branding.slogan || 'Votre slogan accrocheur'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Branding;
