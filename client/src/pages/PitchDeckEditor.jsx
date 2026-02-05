import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, ChevronLeft, ChevronRight, Presentation, 
  Image, Video, Smile, Type, Layout, Palette, Upload, X, Sparkles,
  Square, Circle, Star, Heart, Zap, Award, Target, Rocket,
  Layers, Grid3X3, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, List, Link2, Undo, Redo, Download, Share2, Play,
  MousePointer, Hand, Wand2, MessageSquare, Settings, Eye, Copy,
  // Additional icons for expanded library
  Triangle, Hexagon, Pentagon, Octagon, Diamond,
  ArrowRight, ArrowUp, ArrowDown, TrendingUp, TrendingDown,
  CheckCircle, XCircle, AlertCircle, Info, HelpCircle,
  User, Users, UserPlus, Building, Briefcase, Calendar,
  Clock, Timer, Bell, Mail, Phone, MapPin, Globe,
  Lightbulb, Brain, Cpu, Database, Cloud, Server,
  Lock, Unlock, Shield, Key, Fingerprint,
  Camera, Mic, Music, Headphones, Speaker,
  Bookmark, Flag, Tag, Hash, AtSign,
  BarChart2, PieChart, LineChart, Activity,
  Folder, FileText, File, Archive, Paperclip,
  Send, Inbox, MessageCircle, ThumbsUp, ThumbsDown,
  Gift, ShoppingCart, CreditCard, DollarSign, Percent,
  Sun, Moon, CloudRain, Snowflake, Wind,
  Leaf, Flower2, TreePine, Mountain, Waves,
  Car, Plane, Train, Ship, Bike,
  Home, Building2, Store, Factory, Landmark,
  Gamepad2, Trophy, Medal, Crown, Gem,
  Coffee, UtensilsCrossed, Wine, Cake, Pizza,
  Dumbbell, HeartPulse, Stethoscope, Pill, Syringe,
  GraduationCap, BookOpen, Library, Pencil, Ruler,
  Palette as PaletteIcon, Brush, Scissors, Eraser, PenTool,
  Monitor, Smartphone, Tablet, Laptop, Watch,
  Wifi, Bluetooth, Radio, Podcast, Rss,
  Github, Linkedin, Twitter, Facebook, Instagram
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PitchDeckEditor = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState(null);
  const [pitchDeck, setPitchDeck] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeTool, setActiveTool] = useState('design');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [selectedMediaId, setSelectedMediaId] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [editingTextId, setEditingTextId] = useState(null);
  const [textEditProps, setTextEditProps] = useState({ fontSize: 16, fontFamily: 'Inter', color: '#000000', fontWeight: 'normal' });
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editingTextContent, setEditingTextContent] = useState('');
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [dragType, setDragType] = useState(null); // 'media' | 'element'
  const [aiSuggestions, setAiSuggestions] = useState(null); // AI generated suggestions
  const [designTab, setDesignTab] = useState('templates'); // 'templates' | 'styles'
  const [textToolTab, setTextToolTab] = useState('style'); // 'style' | 'effects' | 'animate' | 'position'
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingSlideField, setEditingSlideField] = useState(null); // 'title' | 'content' | null

  // Available fonts - expanded
  const fonts = [
    { id: 'Inter', name: 'Inter', category: 'Sans-serif' },
    { id: 'Arial', name: 'Arial', category: 'Sans-serif' },
    { id: 'Helvetica', name: 'Helvetica', category: 'Sans-serif' },
    { id: 'Roboto', name: 'Roboto', category: 'Sans-serif' },
    { id: 'Open Sans', name: 'Open Sans', category: 'Sans-serif' },
    { id: 'Montserrat', name: 'Montserrat', category: 'Sans-serif' },
    { id: 'Georgia', name: 'Georgia', category: 'Serif' },
    { id: 'Times New Roman', name: 'Times New Roman', category: 'Serif' },
    { id: 'Playfair Display', name: 'Playfair Display', category: 'Serif' },
    { id: 'Merriweather', name: 'Merriweather', category: 'Serif' },
    { id: 'Courier New', name: 'Courier New', category: 'Mono' },
    { id: 'Verdana', name: 'Verdana', category: 'Sans-serif' },
    { id: 'Trebuchet MS', name: 'Trebuchet MS', category: 'Sans-serif' },
    { id: 'Comic Sans MS', name: 'Comic Sans MS', category: 'Display' },
    { id: 'Impact', name: 'Impact', category: 'Display' },
  ];

  // Text effects
  const textEffects = [
    { id: 'none', name: 'Aucun', style: {} },
    { id: 'shadow', name: 'Ombre', style: { textShadow: '2px 2px 4px rgba(0,0,0,0.3)' } },
    { id: 'shadow-hard', name: 'Ombre dure', style: { textShadow: '3px 3px 0px rgba(0,0,0,0.5)' } },
    { id: 'glow', name: 'Lueur', style: { textShadow: '0 0 10px currentColor, 0 0 20px currentColor' } },
    { id: 'neon', name: 'Néon', style: { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px currentColor, 0 0 20px currentColor' } },
    { id: 'outline', name: 'Contour', style: { WebkitTextStroke: '1px currentColor', WebkitTextFillColor: 'transparent' } },
    { id: 'emboss', name: 'Relief', style: { textShadow: '-1px -1px 0 rgba(255,255,255,0.5), 1px 1px 0 rgba(0,0,0,0.3)' } },
    { id: 'retro', name: 'Rétro', style: { textShadow: '3px 3px 0 #ff6b6b, 6px 6px 0 #ffd93d' } },
  ];

  // Text animations
  const textAnimations = [
    { id: 'none', name: 'Aucune', class: '' },
    { id: 'fade-in', name: 'Fondu', class: 'animate-fadeIn' },
    { id: 'slide-up', name: 'Glisser haut', class: 'animate-slideUp' },
    { id: 'slide-down', name: 'Glisser bas', class: 'animate-slideDown' },
    { id: 'zoom', name: 'Zoom', class: 'animate-zoom' },
    { id: 'bounce', name: 'Rebond', class: 'animate-bounce' },
    { id: 'pulse', name: 'Pulsation', class: 'animate-pulse' },
    { id: 'shake', name: 'Secouer', class: 'animate-shake' },
  ];

  // Preset colors
  const presetColors = [
    '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
    '#ff0000', '#ff6b6b', '#ff9500', '#ffd93d', '#00ff00', '#00d084',
    '#0693e3', '#00d4ff', '#6b5bff', '#9b59b6', '#ff69b4', '#eb144c',
  ];

  // Modern design templates like Canva
  const designTemplates = [
    { 
      id: 'modern-beige', 
      name: 'Élégant Beige',
      category: 'Business',
      colors: { bg: 'linear-gradient(180deg, #f5f0e8 0%, #e8dfd3 100%)', text: '#3d3d3d', accent: '#8b7355' },
      previewBg: 'linear-gradient(180deg, #f5f0e8 0%, #e8dfd3 100%)',
      previewElements: ['title-center', 'subtitle-elegant']
    },
    { 
      id: 'startup-purple', 
      name: 'Startup Moderne',
      category: 'Tech',
      colors: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#fbbf24' },
      previewBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      previewElements: ['title-bold', 'icons']
    },
    { 
      id: 'minimal-clean', 
      name: 'Minimal Clean',
      category: 'Présentation',
      colors: { bg: '#ffffff', text: '#1a1a1a', accent: '#0066ff' },
      previewBg: '#ffffff',
      previewElements: ['title-left', 'line-accent']
    },
    { 
      id: 'dark-premium', 
      name: 'Dark Premium',
      category: 'Luxe',
      colors: { bg: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)', text: '#ffffff', accent: '#c9a962' },
      previewBg: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
      previewElements: ['title-gold', 'border-gold']
    },
    { 
      id: 'nature-green', 
      name: 'Nature Fresh',
      category: 'Nature',
      colors: { bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)', text: '#2e7d32', accent: '#1b5e20' },
      previewBg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      previewElements: ['title-nature', 'leaf-icon']
    },
    { 
      id: 'ocean-blue', 
      name: 'Océan Calme',
      category: 'Créatif',
      colors: { bg: 'linear-gradient(180deg, #e3f2fd 0%, #90caf9 100%)', text: '#0d47a1', accent: '#1565c0' },
      previewBg: 'linear-gradient(180deg, #e3f2fd 0%, #90caf9 100%)',
      previewElements: ['title-wave', 'wave-decoration']
    },
    { 
      id: 'sunset-warm', 
      name: 'Coucher Soleil',
      category: 'Créatif',
      colors: { bg: 'linear-gradient(135deg, #fff3e0 0%, #ffccbc 100%)', text: '#bf360c', accent: '#e65100' },
      previewBg: 'linear-gradient(135deg, #fff3e0 0%, #ffccbc 100%)',
      previewElements: ['title-warm', 'sun-icon']
    },
    { 
      id: 'corporate-navy', 
      name: 'Corporate Pro',
      category: 'Business',
      colors: { bg: '#f8fafc', text: '#1e3a5f', accent: '#2563eb' },
      previewBg: '#f8fafc',
      previewElements: ['title-corporate', 'chart-icon']
    },
    { 
      id: 'creative-gradient', 
      name: 'Créatif Vibrant',
      category: 'Créatif',
      colors: { bg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)', text: '#ffffff', accent: '#ffffff' },
      previewBg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
      previewElements: ['title-vibrant', 'shapes']
    },
    { 
      id: 'photo-overlay', 
      name: 'Photo Moderne',
      category: 'Photo',
      colors: { bg: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)', text: '#ffffff', accent: '#ffffff' },
      previewBg: 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)',
      previewElements: ['title-photo', 'overlay']
    },
    { 
      id: 'pastel-pink', 
      name: 'Pastel Doux',
      category: 'Créatif',
      colors: { bg: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd9 100%)', text: '#880e4f', accent: '#ad1457' },
      previewBg: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd9 100%)',
      previewElements: ['title-soft', 'hearts']
    },
    { 
      id: 'tech-cyber', 
      name: 'Tech Cyber',
      category: 'Tech',
      colors: { bg: '#0a0a0f', text: '#00ff88', accent: '#00d4ff' },
      previewBg: '#0a0a0f',
      previewElements: ['title-cyber', 'grid-lines']
    },
  ];

  // Elements library - expanded like Canva
  const elementsLibrary = {
    shapes: [
      { id: 'rect', icon: Square, name: 'Rectangle' },
      { id: 'circle', icon: Circle, name: 'Cercle' },
      { id: 'triangle', icon: Triangle, name: 'Triangle' },
      { id: 'star', icon: Star, name: 'Étoile' },
      { id: 'heart', icon: Heart, name: 'Cœur' },
      { id: 'diamond', icon: Diamond, name: 'Losange' },
      { id: 'hexagon', icon: Hexagon, name: 'Hexagone' },
      { id: 'octagon', icon: Octagon, name: 'Octogone' },
    ],
    arrows: [
      { id: 'arrow-right', icon: ArrowRight, name: 'Flèche droite' },
      { id: 'arrow-up', icon: ArrowUp, name: 'Flèche haut' },
      { id: 'arrow-down', icon: ArrowDown, name: 'Flèche bas' },
      { id: 'trending-up', icon: TrendingUp, name: 'Tendance +' },
      { id: 'trending-down', icon: TrendingDown, name: 'Tendance -' },
    ],
    business: [
      { id: 'briefcase', icon: Briefcase, name: 'Business' },
      { id: 'building', icon: Building, name: 'Entreprise' },
      { id: 'chart', icon: BarChart2, name: 'Graphique' },
      { id: 'pie', icon: PieChart, name: 'Camembert' },
      { id: 'line-chart', icon: LineChart, name: 'Courbe' },
      { id: 'dollar', icon: DollarSign, name: 'Dollar' },
      { id: 'target', icon: Target, name: 'Objectif' },
      { id: 'trophy', icon: Trophy, name: 'Trophée' },
    ],
    tech: [
      { id: 'cpu', icon: Cpu, name: 'CPU' },
      { id: 'database', icon: Database, name: 'Database' },
      { id: 'cloud', icon: Cloud, name: 'Cloud' },
      { id: 'server', icon: Server, name: 'Serveur' },
      { id: 'globe', icon: Globe, name: 'Web' },
      { id: 'smartphone', icon: Smartphone, name: 'Mobile' },
      { id: 'laptop', icon: Laptop, name: 'Laptop' },
      { id: 'wifi', icon: Wifi, name: 'Wifi' },
    ],
    people: [
      { id: 'user', icon: User, name: 'Utilisateur' },
      { id: 'users', icon: Users, name: 'Équipe' },
      { id: 'user-plus', icon: UserPlus, name: 'Ajouter' },
      { id: 'brain', icon: Brain, name: 'Intelligence' },
      { id: 'graduation', icon: GraduationCap, name: 'Éducation' },
    ],
    communication: [
      { id: 'mail', icon: Mail, name: 'Email' },
      { id: 'phone', icon: Phone, name: 'Téléphone' },
      { id: 'message', icon: MessageCircle, name: 'Message' },
      { id: 'send', icon: Send, name: 'Envoyer' },
      { id: 'bell', icon: Bell, name: 'Notification' },
    ],
    status: [
      { id: 'check', icon: CheckCircle, name: 'Validé' },
      { id: 'x-circle', icon: XCircle, name: 'Refusé' },
      { id: 'alert', icon: AlertCircle, name: 'Attention' },
      { id: 'info', icon: Info, name: 'Info' },
      { id: 'lightbulb', icon: Lightbulb, name: 'Idée' },
    ],
    misc: [
      { id: 'rocket', icon: Rocket, name: 'Fusée' },
      { id: 'zap', icon: Zap, name: 'Éclair' },
      { id: 'award', icon: Award, name: 'Récompense' },
      { id: 'gem', icon: Gem, name: 'Premium' },
      { id: 'crown', icon: Crown, name: 'Couronne' },
      { id: 'gift', icon: Gift, name: 'Cadeau' },
      { id: 'flag', icon: Flag, name: 'Drapeau' },
      { id: 'bookmark', icon: Bookmark, name: 'Signet' },
    ],
    social: [
      { id: 'thumbs-up', icon: ThumbsUp, name: 'Like' },
      { id: 'thumbs-down', icon: ThumbsDown, name: 'Dislike' },
      { id: 'github', icon: Github, name: 'GitHub' },
      { id: 'linkedin', icon: Linkedin, name: 'LinkedIn' },
      { id: 'twitter', icon: Twitter, name: 'Twitter' },
    ],
  };

  // Element categories for UI
  const elementCategories = [
    { id: 'shapes', name: 'Formes', icon: Square },
    { id: 'arrows', name: 'Flèches', icon: ArrowRight },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'tech', name: 'Tech', icon: Cpu },
    { id: 'people', name: 'Personnes', icon: Users },
    { id: 'communication', name: 'Communication', icon: MessageCircle },
    { id: 'status', name: 'Statuts', icon: CheckCircle },
    { id: 'misc', name: 'Divers', icon: Sparkles },
    { id: 'social', name: 'Social', icon: ThumbsUp },
  ];

  const [activeElementCategory, setActiveElementCategory] = useState('shapes');

  // Helper to get all elements from all categories
  const getAllElements = () => {
    return Object.values(elementsLibrary).flat();
  };

  // Sidebar tools
  const sidebarTools = [
    { id: 'design', icon: Layout, label: 'Design' },
    { id: 'elements', icon: Grid3X3, label: 'Éléments' },
    { id: 'text', icon: Type, label: 'Texte' },
    { id: 'images', icon: Image, label: 'Images' },
    { id: 'videos', icon: Video, label: 'Vidéos' },
    { id: 'ai', icon: Wand2, label: 'IA' },
  ];

  useEffect(() => {
    fetchData();
  }, [projectId]);

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

  // Auto-save when slides change (debounced)
  const [hasChanges, setHasChanges] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (initialLoad) return;
    setHasChanges(true);
  }, [slides]);

  useEffect(() => {
    if (!hasChanges || initialLoad || loading) return;
    
    const autoSaveTimer = setTimeout(async () => {
      try {
        if (!pitchDeck) {
          const response = await api.post(`/pitch-deck/project/${projectId}/create`, { 
            template: 'custom',
            slides 
          });
          setPitchDeck(response.data.pitchDeck);
        } else {
          await api.put(`/pitch-deck/project/${projectId}/slides`, { slides });
        }
        setHasChanges(false);
        console.log('Auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1500); // Auto-save after 1.5 seconds of no changes

    return () => clearTimeout(autoSaveTimer);
  }, [hasChanges, slides, pitchDeck, projectId, initialLoad, loading]);

  const fetchData = async () => {
    try {
      const [projectRes, deckRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/pitch-deck/project/${projectId}`)
      ]);
      setProject(projectRes.data.project);
      if (deckRes.data.pitchDeck) {
        setPitchDeck(deckRes.data.pitchDeck);
        setSlides(deckRes.data.pitchDeck.slides || getDefaultSlides());
      } else {
        setSlides(getDefaultSlides());
      }
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
      // Mark initial load as complete after a short delay
      setTimeout(() => setInitialLoad(false), 500);
    }
  };

  const getDefaultSlides = () => [
    { id: 1, type: 'title', title: 'Ma Présentation', content: 'Sous-titre de votre présentation', template: 'modern-beige', media: [], elements: [] },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!pitchDeck) {
        const response = await api.post(`/pitch-deck/project/${projectId}/create`, { 
          template: 'custom',
          slides 
        });
        setPitchDeck(response.data.pitchDeck);
      } else {
        await api.put(`/pitch-deck/project/${projectId}/slides`, { slides });
      }
      toast.success('Sauvegardé !');
    } catch (error) {
      toast.error('Erreur de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const addSlide = () => {
    const currentTemplate = slides[currentSlide]?.template || 'minimal-white';
    const newSlide = {
      id: Date.now(),
      type: 'content',
      title: 'Nouveau slide',
      content: '',
      template: currentTemplate,
      media: [],
      elements: []
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
  };

  const duplicateSlide = () => {
    const newSlide = { ...slides[currentSlide], id: Date.now() };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
    toast.success('Slide dupliqué');
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      toast.error('Gardez au moins un slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== currentSlide);
    setSlides(newSlides);
    setCurrentSlide(Math.max(0, currentSlide - 1));
  };

  const applyTemplate = (template) => {
    updateSlide(currentSlide, 'template', template.id);
    // If template has custom colors, apply them directly
    if (template.colors) {
      updateSlide(currentSlide, 'customColors', template.colors);
    }
    toast.success(`Template "${template.name}" appliqué`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia = { id: Date.now(), type: 'image', url: reader.result, x: 60, y: 30, width: 35, height: 40 };
        updateSlide(currentSlide, 'media', [...(slides[currentSlide]?.media || []), newMedia]);
        toast.success('Image ajoutée');
      };
      reader.readAsDataURL(file);
    }
  };

  const addVideoFromUrl = () => {
    if (!videoUrl.trim()) {
      toast.error('Entrez une URL');
      return;
    }
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      embedUrl = `https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0]}`;
    } else if (videoUrl.includes('youtu.be/')) {
      embedUrl = `https://www.youtube.com/embed/${videoUrl.split('youtu.be/')[1]?.split('?')[0]}`;
    } else if (videoUrl.includes('vimeo.com/')) {
      embedUrl = `https://player.vimeo.com/video/${videoUrl.split('vimeo.com/')[1]?.split('?')[0]}`;
    }
    const newMedia = { id: Date.now(), type: 'video', url: embedUrl, isEmbed: true, x: 55, y: 25, width: 40, height: 45 };
    updateSlide(currentSlide, 'media', [...(slides[currentSlide]?.media || []), newMedia]);
    setVideoUrl('');
    setShowVideoModal(false);
    toast.success('Vidéo ajoutée');
  };

  const handleLocalVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Vidéo trop lourde (max 50MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMedia = { id: Date.now(), type: 'video', url: reader.result, isLocal: true, x: 55, y: 25, width: 40, height: 45 };
        updateSlide(currentSlide, 'media', [...(slides[currentSlide]?.media || []), newMedia]);
        toast.success('Vidéo locale ajoutée');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateMediaSize = (mediaId, deltaWidth, deltaHeight) => {
    const media = slides[currentSlide]?.media || [];
    const updatedMedia = media.map(m => {
      if (m.id === mediaId) {
        return {
          ...m,
          width: Math.max(10, Math.min(90, m.width + deltaWidth)),
          height: Math.max(10, Math.min(90, m.height + deltaHeight))
        };
      }
      return m;
    });
    updateSlide(currentSlide, 'media', updatedMedia);
  };

  const updateMediaPosition = (mediaId, x, y) => {
    const media = slides[currentSlide]?.media || [];
    const updatedMedia = media.map(m => {
      if (m.id === mediaId) {
        return { ...m, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
      }
      return m;
    });
    updateSlide(currentSlide, 'media', updatedMedia);
  };

  const deleteMedia = (mediaId) => {
    const media = slides[currentSlide]?.media?.filter(m => m.id !== mediaId) || [];
    updateSlide(currentSlide, 'media', media);
    setSelectedMediaId(null);
    toast.success('Média supprimé');
  };

  const updateTextElement = (elementId, props) => {
    const elements = slides[currentSlide]?.elements || [];
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return { ...el, ...props };
      }
      return el;
    });
    updateSlide(currentSlide, 'elements', updatedElements);
  };

  const deleteElement = (elementId) => {
    const elements = slides[currentSlide]?.elements?.filter(el => el.id !== elementId) || [];
    updateSlide(currentSlide, 'elements', elements);
    setEditingTextId(null);
    toast.success('Élément supprimé');
  };

  // Universal drag handler for media and elements
  const handleDragStart = (e, id, type, action = 'drag') => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setDragStart({ 
      x: e.clientX, 
      y: e.clientY,
      canvasWidth: rect.width,
      canvasHeight: rect.height
    });
    
    setDragType(type);
    if (type === 'media') {
      setSelectedMediaId(id);
      setSelectedElementId(null);
    } else {
      setSelectedElementId(id);
      setSelectedMediaId(null);
    }
    
    if (action === 'resize') {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;
    
    const deltaX = ((e.clientX - dragStart.x) / canvasWidth) * 100;
    const deltaY = ((e.clientY - dragStart.y) / canvasHeight) * 100;
    
    if (dragType === 'media' && selectedMediaId) {
      const media = slides[currentSlide]?.media?.find(m => m.id === selectedMediaId);
      if (!media) return;

      if (isResizing) {
        updateMediaSize(selectedMediaId, deltaX, deltaY);
      } else if (isDragging) {
        const newX = Math.max(0, Math.min(100 - media.width, media.x + deltaX));
        const newY = Math.max(0, Math.min(100 - media.height, media.y + deltaY));
        updateMediaPosition(selectedMediaId, newX, newY);
      }
    } else if (dragType === 'element' && selectedElementId) {
      const element = slides[currentSlide]?.elements?.find(el => el.id === selectedElementId);
      if (!element) return;

      if (element.type === 'text') {
        // Handle text element dragging
        if (isDragging) {
          const newX = Math.max(0, Math.min(90, element.x + deltaX));
          const newY = Math.max(0, Math.min(90, element.y + deltaY));
          updateTextElement(selectedElementId, { x: newX, y: newY });
        }
      } else if (isResizing && element.size !== undefined) {
        const newSize = Math.max(16, Math.min(200, element.size + deltaX));
        updateElementProps(selectedElementId, { size: newSize });
      } else if (isDragging) {
        const newX = Math.max(0, Math.min(90, element.x + deltaX));
        const newY = Math.max(0, Math.min(90, element.y + deltaY));
        updateElementProps(selectedElementId, { x: newX, y: newY });
      }
    } else if (dragType === 'slideTitle' && isDragging) {
      // Drag slide title
      const currentStyle = slides[currentSlide]?.titleStyle || {};
      const newX = Math.max(0, Math.min(90, (currentStyle.x || 5) + deltaX));
      const newY = Math.max(0, Math.min(90, (currentStyle.y || 10) + deltaY));
      updateSlide(currentSlide, 'titleStyle', { ...currentStyle, x: newX, y: newY });
    } else if (dragType === 'slideContent' && isDragging) {
      // Drag slide content
      const currentStyle = slides[currentSlide]?.contentStyle || {};
      const newX = Math.max(0, Math.min(90, (currentStyle.x || 5) + deltaX));
      const newY = Math.max(0, Math.min(90, (currentStyle.y || 30) + deltaY));
      updateSlide(currentSlide, 'contentStyle', { ...currentStyle, x: newX, y: newY });
    } else if (dragType === 'textResize' && isResizing && selectedElementId) {
      // Resize text element (change font size)
      const element = slides[currentSlide]?.elements?.find(el => el.id === selectedElementId);
      if (element) {
        const newFontSize = Math.max(8, Math.min(200, (element.fontSize || 16) + deltaX * 0.5));
        updateTextElement(selectedElementId, { fontSize: Math.round(newFontSize) });
      }
    }
    
    // Update drag start position for continuous dragging
    setDragStart(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setDragType(null);
  };

  // Update element properties (position, size, etc.)
  const updateElementProps = (elementId, props) => {
    const elements = slides[currentSlide]?.elements || [];
    const updatedElements = elements.map(el => {
      if (el.id === elementId) {
        return { ...el, ...props };
      }
      return el;
    });
    updateSlide(currentSlide, 'elements', updatedElements);
  };

  // Drag handler for text elements - uses universal handler
  const handleTextMouseDown = (e, elementId) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e, elementId, 'element', 'drag');
    setEditingTextId(elementId);
    setActiveTool('text');
  };

  // Double click to edit text
  const handleTextDoubleClick = (e, element) => {
    e.stopPropagation();
    setEditingTextId(element.id);
    setEditingTextContent(element.text);
    setActiveTool('text');
  };

  const handleTextContentChange = (e) => {
    setEditingTextContent(e.target.value);
    updateTextElement(editingTextId, { text: e.target.value });
  };

  const addElement = (element, type) => {
    const newElement = { 
      id: Date.now(), 
      elementId: element.id, 
      type,
      x: 50 + Math.random() * 20, 
      y: 50 + Math.random() * 20,
      size: 48,
      color: getTemplateColors(slides[currentSlide]?.template).accent
    };
    updateSlide(currentSlide, 'elements', [...(slides[currentSlide]?.elements || []), newElement]);
    toast.success(`${element.name} ajouté`);
  };

  const addTextBlock = (preset) => {
    const newElement = {
      id: Date.now(),
      type: 'text',
      text: preset.text,
      x: 10,
      y: slides[currentSlide]?.elements?.length ? 60 : 40,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      color: getTemplateColors(slides[currentSlide]?.template).text
    };
    updateSlide(currentSlide, 'elements', [...(slides[currentSlide]?.elements || []), newElement]);
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Décrivez votre présentation');
      return;
    }
    setAiGenerating(true);
    try {
      // Simulate AI generation - generate multiple options for user to choose
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate 3 different presentation options
      const suggestions = [
        {
          id: 'option-1',
          name: 'Pitch Investisseur',
          description: 'Structure classique pour lever des fonds',
          template: 'startup-purple',
          slides: [
            { id: 1, type: 'title', title: aiPrompt.split(' ').slice(0, 5).join(' '), content: 'Révolutionnez votre industrie', template: 'startup-purple', media: [], elements: [] },
            { id: 2, type: 'content', title: '🎯 Le Problème', content: '• Douleur client identifiée\n• Impact économique\n• Urgence de la solution', template: 'startup-purple', media: [], elements: [] },
            { id: 3, type: 'content', title: '💡 Notre Solution', content: '• Innovation unique\n• Avantage concurrentiel\n• Technologie propriétaire', template: 'startup-purple', media: [], elements: [] },
            { id: 4, type: 'content', title: '📊 Le Marché', content: '• TAM: €XX milliards\n• SAM: €XX millions\n• SOM: €XX millions', template: 'startup-purple', media: [], elements: [] },
            { id: 5, type: 'content', title: '💰 Business Model', content: '• Revenue SaaS\n• Marge: XX%\n• LTV/CAC: X:1', template: 'startup-purple', media: [], elements: [] },
            { id: 6, type: 'content', title: '🚀 Traction', content: '• X utilisateurs actifs\n• +XX% MoM\n• Clients références', template: 'startup-purple', media: [], elements: [] },
            { id: 7, type: 'content', title: '👥 L\'Équipe', content: '• CEO - Vision & Strategy\n• CTO - Tech & Product\n• CMO - Growth', template: 'startup-purple', media: [], elements: [] },
            { id: 8, type: 'content', title: '🎯 Ask', content: '• Levée: €X millions\n• Utilisation: Produit, Équipe, Marketing\n• Contact: hello@startup.com', template: 'startup-purple', media: [], elements: [] },
          ]
        },
        {
          id: 'option-2',
          name: 'Présentation Produit',
          description: 'Focus sur les fonctionnalités et bénéfices',
          template: 'modern-beige',
          slides: [
            { id: 1, type: 'title', title: aiPrompt.split(' ').slice(0, 5).join(' '), content: 'La solution qui change tout', template: 'modern-beige', media: [], elements: [] },
            { id: 2, type: 'content', title: 'Pourquoi nous?', content: '• Simplicité d\'utilisation\n• Résultats prouvés\n• Support dédié', template: 'modern-beige', media: [], elements: [] },
            { id: 3, type: 'content', title: 'Fonctionnalités clés', content: '• Feature 1 - Gain de temps\n• Feature 2 - Automatisation\n• Feature 3 - Analytics', template: 'modern-beige', media: [], elements: [] },
            { id: 4, type: 'content', title: 'Comment ça marche', content: '1. Inscrivez-vous\n2. Configurez\n3. Profitez des résultats', template: 'modern-beige', media: [], elements: [] },
            { id: 5, type: 'content', title: 'Témoignages', content: '"Incroyable!" - Client A\n"Indispensable" - Client B', template: 'modern-beige', media: [], elements: [] },
            { id: 6, type: 'content', title: 'Tarifs', content: '• Starter: Gratuit\n• Pro: €XX/mois\n• Enterprise: Sur devis', template: 'modern-beige', media: [], elements: [] },
          ]
        },
        {
          id: 'option-3',
          name: 'Story Telling',
          description: 'Narrative immersive et émotionnelle',
          template: 'dark-premium',
          slides: [
            { id: 1, type: 'title', title: aiPrompt.split(' ').slice(0, 5).join(' '), content: 'Une histoire qui inspire', template: 'dark-premium', media: [], elements: [] },
            { id: 2, type: 'content', title: 'Il était une fois...', content: 'Un problème que tout le monde connaît mais que personne n\'osait résoudre.', template: 'dark-premium', media: [], elements: [] },
            { id: 3, type: 'content', title: 'Le déclic', content: 'C\'est alors que nous avons eu une idée folle...', template: 'dark-premium', media: [], elements: [] },
            { id: 4, type: 'content', title: 'La transformation', content: 'Aujourd\'hui, des milliers de personnes vivent mieux grâce à nous.', template: 'dark-premium', media: [], elements: [] },
            { id: 5, type: 'content', title: 'Rejoignez l\'aventure', content: 'Ensemble, écrivons la suite de cette histoire.', template: 'dark-premium', media: [], elements: [] },
          ]
        }
      ];
      
      setAiSuggestions(suggestions);
      toast.success('3 options générées ! Choisissez celle qui vous convient.');
    } catch (error) {
      toast.error('Erreur de génération');
    } finally {
      setAiGenerating(false);
    }
  };

  // Apply selected AI suggestion
  const applyAiSuggestion = (suggestion) => {
    setSlides(suggestion.slides);
    setCurrentSlide(0);
    setAiSuggestions(null);
    setShowAIPanel(false);
    toast.success(`"${suggestion.name}" appliqué !`);
  };

  const getTemplateColors = (templateId, slideIndex = currentSlide) => {
    // Check if slide has custom colors (from palette)
    const slide = slides[slideIndex];
    if (slide?.customColors) {
      return slide.customColors;
    }
    // Otherwise use template colors
    const template = designTemplates.find(t => t.id === templateId) || designTemplates[0];
    return template.colors;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  // Presentation mode
  if (isPresenting) {
    const colors = getTemplateColors(slides[currentSlide]?.template);
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-6xl aspect-video rounded-lg shadow-2xl p-12 relative overflow-hidden"
            style={{ background: colors.bg, color: colors.text }}
          >
            {/* Elements */}
            {slides[currentSlide]?.elements?.map((el) => {
              if (el.type === 'text') {
                return (
                  <div key={el.id} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, fontSize: el.fontSize, fontWeight: el.fontWeight, color: el.color }}>
                    {el.text}
                  </div>
                );
              }
              const iconData = getAllElements().find(i => i.id === el.elementId);
              if (iconData) {
                const Icon = iconData.icon;
                return (
                  <div key={el.id} style={{ position: 'absolute', left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}>
                    <Icon size={el.size * 1.5} style={{ color: el.color }} />
                  </div>
                );
              }
              return null;
            })}

            <div className="flex h-full gap-8">
              <div className="flex-1 flex flex-col justify-center">
                <h1 
                  className="mb-6"
                  style={{
                    fontSize: `${slides[currentSlide]?.titleStyle?.fontSize || 48}px`,
                    fontWeight: slides[currentSlide]?.titleStyle?.fontWeight || 'bold',
                    fontFamily: slides[currentSlide]?.titleStyle?.fontFamily || 'Inter',
                    color: slides[currentSlide]?.titleStyle?.color || colors.text,
                    fontStyle: slides[currentSlide]?.titleStyle?.italic ? 'italic' : 'normal',
                    textDecoration: `${slides[currentSlide]?.titleStyle?.underline ? 'underline' : ''} ${slides[currentSlide]?.titleStyle?.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                    textAlign: slides[currentSlide]?.titleStyle?.align || 'left',
                  }}
                >
                  {slides[currentSlide]?.title}
                </h1>
                <div 
                  className="whitespace-pre-wrap"
                  style={{
                    fontSize: `${slides[currentSlide]?.contentStyle?.fontSize || 24}px`,
                    fontWeight: slides[currentSlide]?.contentStyle?.fontWeight || 'normal',
                    fontFamily: slides[currentSlide]?.contentStyle?.fontFamily || 'Inter',
                    color: slides[currentSlide]?.contentStyle?.color || colors.text,
                    fontStyle: slides[currentSlide]?.contentStyle?.italic ? 'italic' : 'normal',
                    textDecoration: `${slides[currentSlide]?.contentStyle?.underline ? 'underline' : ''} ${slides[currentSlide]?.contentStyle?.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                    textAlign: slides[currentSlide]?.contentStyle?.align || 'left',
                    opacity: 0.9,
                  }}
                >
                  {slides[currentSlide]?.content}
                </div>
              </div>
              {slides[currentSlide]?.media?.length > 0 && (
                <div className="w-2/5 flex flex-col justify-center gap-4">
                  {slides[currentSlide].media.map((m) => (
                    m.type === 'image' ? (
                      <img key={m.id} src={m.url} alt="" className="max-h-80 object-contain rounded-xl" />
                    ) : (
                      <iframe key={m.id} src={m.url} className="w-full aspect-video rounded-xl" frameBorder="0" allowFullScreen />
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 flex items-center justify-between bg-gray-800/90">
          <button onClick={() => setIsPresenting(false)} className="px-4 py-2 text-white hover:bg-white/10 rounded-lg">Quitter</button>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white">{currentSlide + 1} / {slides.length}</span>
            <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1} className="p-2 text-white hover:bg-white/10 rounded-lg disabled:opacity-50">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          <div className="text-white/50 text-sm">← → pour naviguer • Esc pour quitter</div>
        </div>
      </div>
    );
  }

  const currentColors = getTemplateColors(slides[currentSlide]?.template);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to={`/projects/${projectId}`} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-semibold text-gray-900">{project?.name || 'Pitch Deck'}</h1>
            <p className="text-xs text-gray-500">Éditeur de présentation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Undo className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"><Redo className="w-5 h-5" /></button>
          <div className="h-6 w-px bg-gray-300 mx-2" />
          <select value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="text-sm border rounded-lg px-2 py-1">
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={100}>100%</option>
            <option value={125}>125%</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsPresenting(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
            <Play className="w-4 h-4" />
            Présenter
          </button>
          {hasChanges && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Sauvegarde auto...
            </span>
          )}
          {!hasChanges && !initialLoad && (
            <span className="text-xs text-green-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Sauvegardé
            </span>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-16 bg-gray-900 flex flex-col items-center py-4 gap-1">
          {sidebarTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-colors ${
                  activeTool === tool.id ? 'bg-primary-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1">{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Left Panel - Tool Content */}
        <div className="w-72 bg-white border-r overflow-y-auto">
          <div className="p-4">
            {/* AI Tool */}
            {activeTool === 'ai' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary-600" />
                  Assistant IA
                </h3>
                
                {!aiSuggestions ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">Décrivez votre présentation et l'IA génèrera plusieurs options à choisir.</p>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ex: Une présentation pour lever des fonds pour une app de livraison écologique..."
                      className="w-full h-32 p-3 border rounded-lg resize-none text-sm"
                    />
                    <button
                      onClick={generateWithAI}
                      disabled={aiGenerating}
                      className="w-full mt-3 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      {aiGenerating ? 'Génération en cours...' : 'Générer des options'}
                    </button>
                    
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-700">
                        <strong>💡 Style Gamma :</strong> L'IA génère 3 versions différentes. Vous choisissez celle qui vous convient !
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600 mb-4">Choisissez la présentation qui vous convient :</p>
                    
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion) => {
                        const templateColors = getTemplateColors(suggestion.template);
                        return (
                          <div
                            key={suggestion.id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => applyAiSuggestion(suggestion)}
                          >
                            {/* Mini preview */}
                            <div 
                              className="h-20 p-3 flex flex-col justify-center"
                              style={{ background: templateColors.bg, color: templateColors.text }}
                            >
                              <div className="text-xs font-bold truncate">{suggestion.slides[0]?.title}</div>
                              <div className="text-[10px] opacity-70 truncate">{suggestion.slides[0]?.content}</div>
                            </div>
                            <div className="p-3 bg-white">
                              <h4 className="font-semibold text-sm text-gray-900">{suggestion.name}</h4>
                              <p className="text-xs text-gray-500">{suggestion.description}</p>
                              <p className="text-xs text-gray-400 mt-1">{suggestion.slides.length} slides</p>
                            </div>
                            <div className="px-3 pb-3">
                              <button className="w-full py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                Utiliser ce modèle
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setAiSuggestions(null)}
                      className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
                    >
                      ← Générer de nouvelles options
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Design Templates & Styles */}
            {activeTool === 'design' && (
              <div>
                {/* Tabs like Canva */}
                <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setDesignTab('templates')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      designTab === 'templates' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Modèles
                  </button>
                  <button
                    onClick={() => setDesignTab('styles')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      designTab === 'styles' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Styles
                  </button>
                </div>

                {designTab === 'templates' && (
                  <>
                    <p className="text-xs text-gray-500 mb-3">Cliquez pour appliquer au slide actuel</p>
                    <div className="grid grid-cols-2 gap-3">
                      {designTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className={`rounded-lg overflow-hidden transition-all hover:scale-105 ${
                        slides[currentSlide]?.template === template.id
                          ? 'ring-2 ring-primary-500 ring-offset-2'
                          : 'hover:shadow-lg'
                      }`}
                    >
                      {/* Mini slide preview */}
                      <div 
                        className="w-full aspect-video p-2 flex flex-col justify-center"
                        style={{ background: template.previewBg || template.colors.bg }}
                      >
                        {/* Mini title */}
                        <div 
                          className="h-2 w-3/4 rounded mb-1"
                          style={{ backgroundColor: template.colors.text, opacity: 0.9 }}
                        />
                        {/* Mini subtitle */}
                        <div 
                          className="h-1.5 w-1/2 rounded mb-2"
                          style={{ backgroundColor: template.colors.text, opacity: 0.5 }}
                        />
                        {/* Mini content lines */}
                        <div className="space-y-1">
                          <div 
                            className="h-1 w-full rounded"
                            style={{ backgroundColor: template.colors.text, opacity: 0.3 }}
                          />
                          <div 
                            className="h-1 w-4/5 rounded"
                            style={{ backgroundColor: template.colors.text, opacity: 0.3 }}
                          />
                        </div>
                      </div>
                      <div className="bg-white px-2 py-1.5 border-t">
                          <p className="text-xs font-medium text-gray-800 truncate">{template.name}</p>
                          <p className="text-[10px] text-gray-400">{template.category}</p>
                        </div>
                      </button>
                    ))}
                    </div>
                  </>
                )}

                {designTab === 'styles' && (
                  <>
                    <p className="text-xs text-gray-500 mb-3">Palettes de couleurs et polices</p>
                    
                    {/* Color palettes - FUNCTIONAL */}
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Palettes de couleurs</h4>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { id: 'warm', colors: ['#FF6B6B', '#FFA500', '#FFD93D'], name: 'Chaud', bg: '#FFF5F5', text: '#C41E3A' },
                        { id: 'cool', colors: ['#6B5BFF', '#00D4FF', '#00FF88'], name: 'Froid', bg: '#F0F4FF', text: '#1E3A8A' },
                        { id: 'earth', colors: ['#8B4513', '#DAA520', '#228B22'], name: 'Terre', bg: '#FAF5EF', text: '#5D4037' },
                        { id: 'ocean', colors: ['#1E90FF', '#00CED1', '#20B2AA'], name: 'Océan', bg: '#E0F7FA', text: '#006064' },
                        { id: 'sunset', colors: ['#FF4500', '#FF6347', '#FFB6C1'], name: 'Coucher', bg: '#FFF3E0', text: '#E65100' },
                        { id: 'mono', colors: ['#2C3E50', '#7F8C8D', '#ECF0F1'], name: 'Mono', bg: '#FFFFFF', text: '#2C3E50' },
                        { id: 'purple', colors: ['#9B59B6', '#8E44AD', '#E8DAEF'], name: 'Violet', bg: '#F5EEF8', text: '#6C3483' },
                        { id: 'green', colors: ['#27AE60', '#2ECC71', '#D5F5E3'], name: 'Vert', bg: '#E8F8F5', text: '#1E8449' },
                        { id: 'dark', colors: ['#1A1A2E', '#16213E', '#E94560'], name: 'Sombre', bg: '#1A1A2E', text: '#FFFFFF' },
                      ].map((palette) => (
                        <button
                          key={palette.id}
                          onClick={() => {
                            // Apply custom palette colors to current slide
                            const customTemplate = {
                              id: `custom-${palette.id}`,
                              name: palette.name,
                              colors: { bg: palette.bg, text: palette.text, accent: palette.colors[0] }
                            };
                            applyTemplate(customTemplate);
                            toast.success(`Palette "${palette.name}" appliquée !`);
                          }}
                          className="p-2 rounded-lg border hover:border-primary-500 hover:shadow transition-all hover:scale-105"
                        >
                          <div className="flex gap-0.5 mb-1">
                            {palette.colors.map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-600">{palette.name}</p>
                        </button>
                      ))}
                    </div>

                    {/* Font combinations - FUNCTIONAL */}
                    <h4 className="font-medium text-gray-900 text-sm mb-2">Combinaisons de polices</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'modern', title: 'Inter', body: 'Inter', label: 'Moderne' },
                        { id: 'classic', title: 'Georgia', body: 'Arial', label: 'Classique' },
                        { id: 'elegant', title: 'Playfair Display', body: 'Georgia', label: 'Élégant' },
                        { id: 'tech', title: 'Courier New', body: 'Verdana', label: 'Tech' },
                        { id: 'bold', title: 'Impact', body: 'Arial', label: 'Audacieux' },
                        { id: 'friendly', title: 'Comic Sans MS', body: 'Verdana', label: 'Amical' },
                      ].map((combo) => (
                        <button
                          key={combo.id}
                          onClick={() => {
                            // Apply font to slide title
                            const currentTitleStyle = slides[currentSlide]?.titleStyle || {};
                            updateSlide(currentSlide, 'titleStyle', { ...currentTitleStyle, fontFamily: combo.title });
                            
                            // Apply font to slide content
                            const currentContentStyle = slides[currentSlide]?.contentStyle || {};
                            updateSlide(currentSlide, 'contentStyle', { ...currentContentStyle, fontFamily: combo.body });
                            
                            // Apply font to all text elements in current slide
                            const elements = slides[currentSlide]?.elements || [];
                            const updatedElements = elements.map(el => 
                              el.type === 'text' ? { ...el, fontFamily: el.fontSize > 20 ? combo.title : combo.body } : el
                            );
                            updateSlide(currentSlide, 'elements', updatedElements);
                            toast.success(`Police "${combo.label}" appliquée !`);
                          }}
                          className="w-full p-3 border rounded-lg hover:border-primary-500 hover:shadow text-left transition-all hover:scale-[1.02]"
                        >
                          <p className="font-bold text-sm" style={{ fontFamily: combo.title }}>{combo.label}</p>
                          <p className="text-xs text-gray-500" style={{ fontFamily: combo.body }}>Texte de paragraphe</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Elements */}
            {activeTool === 'elements' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Éléments</h3>
                
                {/* Category tabs */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {elementCategories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveElementCategory(cat.id)}
                        className={`px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                          activeElementCategory === cat.id 
                            ? 'bg-primary-100 text-primary-700 font-medium' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <CatIcon className="w-3 h-3" />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>

                {/* Elements grid */}
                <div className="grid grid-cols-4 gap-2">
                  {elementsLibrary[activeElementCategory]?.map((element) => {
                    const Icon = element.icon;
                    return (
                      <button
                        key={element.id}
                        onClick={() => addElement(element, 'icon')}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg group relative"
                        title={element.name}
                      >
                        <Icon className="w-6 h-6 mx-auto text-gray-700 group-hover:text-primary-600 transition-colors" />
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 whitespace-nowrap">
                          {element.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick tip */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                  <p><strong>Astuce :</strong> Cliquez sur un élément pour l'ajouter au slide. Glissez pour le déplacer, utilisez les poignées pour redimensionner.</p>
                </div>
              </div>
            )}

            {/* Text */}
            {activeTool === 'text' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Ajouter du texte</h3>
                <div className="space-y-2 mb-4">
                  <button onClick={() => addTextBlock({ text: 'Titre', fontSize: 32, fontWeight: 'bold', fontFamily: 'Inter', italic: false, underline: false, strikethrough: false, effect: 'none', animation: 'none', align: 'left' })} className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left">
                    <span className="text-xl font-bold">Ajouter un titre</span>
                  </button>
                  <button onClick={() => addTextBlock({ text: 'Sous-titre', fontSize: 24, fontWeight: '600', fontFamily: 'Inter', italic: false, underline: false, strikethrough: false, effect: 'none', animation: 'none', align: 'left' })} className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left">
                    <span className="text-lg font-semibold">Ajouter un sous-titre</span>
                  </button>
                  <button onClick={() => addTextBlock({ text: 'Corps de texte', fontSize: 16, fontWeight: 'normal', fontFamily: 'Inter', italic: false, underline: false, strikethrough: false, effect: 'none', animation: 'none', align: 'left' })} className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left">
                    <span className="text-sm">Ajouter du texte</span>
                  </button>
                </div>

                {/* Slide Title/Content editing panel */}
                {editingSlideField && !editingTextId && (() => {
                  const fieldKey = editingSlideField === 'title' ? 'titleStyle' : 'contentStyle';
                  const currentStyle = slides[currentSlide]?.[fieldKey] || {};
                  const defaultFontSize = editingSlideField === 'title' ? 32 : 18;
                  const defaultWeight = editingSlideField === 'title' ? 'bold' : 'normal';
                  
                  const updateFieldStyle = (props) => {
                    const newStyle = { ...currentStyle, ...props };
                    updateSlide(currentSlide, fieldKey, newStyle);
                  };

                  return (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {editingSlideField === 'title' ? '📝 Modifier le titre' : '📄 Modifier le contenu'}
                        </h4>
                        <button 
                          onClick={() => setEditingSlideField(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Font Family */}
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">Police</label>
                        <select 
                          value={currentStyle.fontFamily || 'Inter'}
                          onChange={(e) => updateFieldStyle({ fontFamily: e.target.value })}
                          className="w-full border rounded-lg px-2 py-2 text-sm"
                          style={{ fontFamily: currentStyle.fontFamily || 'Inter' }}
                        >
                          {fonts.map(f => (
                            <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Font Size */}
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">Taille</label>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => updateFieldStyle({ fontSize: Math.max(8, (currentStyle.fontSize || defaultFontSize) - 2) })}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >−</button>
                          <input 
                            type="number" 
                            min="8" 
                            max="200"
                            value={currentStyle.fontSize || defaultFontSize}
                            onChange={(e) => updateFieldStyle({ fontSize: parseInt(e.target.value) || defaultFontSize })}
                            className="flex-1 border rounded-lg px-2 py-2 text-sm text-center"
                          />
                          <button 
                            onClick={() => updateFieldStyle({ fontSize: Math.min(200, (currentStyle.fontSize || defaultFontSize) + 2) })}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >+</button>
                        </div>
                      </div>

                      {/* Text Color */}
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">Couleur</label>
                        <div className="grid grid-cols-6 gap-1 mb-2">
                          {presetColors.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateFieldStyle({ color })}
                              className={`w-7 h-7 rounded-md border-2 transition-all ${
                                currentStyle.color === color ? 'border-primary-500 scale-110' : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={currentStyle.color || '#000000'}
                            onChange={(e) => updateFieldStyle({ color: e.target.value })}
                            className="w-10 h-10 border rounded-lg cursor-pointer"
                          />
                          <input 
                            type="text"
                            value={currentStyle.color || '#000000'}
                            onChange={(e) => updateFieldStyle({ color: e.target.value })}
                            className="flex-1 border rounded-lg px-2 text-sm font-mono"
                          />
                        </div>
                      </div>

                      {/* Text Style Buttons */}
                      <div className="mb-3">
                        <label className="text-xs text-gray-500 mb-1 block">Style</label>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => updateFieldStyle({ fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold' })}
                            className={`p-2.5 rounded-lg flex-1 ${(currentStyle.fontWeight || defaultWeight) === 'bold' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <Bold className="w-4 h-4 mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateFieldStyle({ italic: !currentStyle.italic })}
                            className={`p-2.5 rounded-lg flex-1 ${currentStyle.italic ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <Italic className="w-4 h-4 mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateFieldStyle({ underline: !currentStyle.underline })}
                            className={`p-2.5 rounded-lg flex-1 ${currentStyle.underline ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <Underline className="w-4 h-4 mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateFieldStyle({ strikethrough: !currentStyle.strikethrough })}
                            className={`p-2.5 rounded-lg flex-1 ${currentStyle.strikethrough ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <span className="text-sm font-medium line-through">S</span>
                          </button>
                        </div>
                      </div>

                      {/* Text Alignment */}
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Alignement</label>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => updateFieldStyle({ align: 'left' })}
                            className={`p-2.5 rounded-lg flex-1 ${(currentStyle.align || 'left') === 'left' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <AlignLeft className="w-4 h-4 mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateFieldStyle({ align: 'center' })}
                            className={`p-2.5 rounded-lg flex-1 ${currentStyle.align === 'center' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <AlignCenter className="w-4 h-4 mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateFieldStyle({ align: 'right' })}
                            className={`p-2.5 rounded-lg flex-1 ${currentStyle.align === 'right' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            <AlignRight className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Complete Text editing panel like Canva */}
                {editingTextId && (() => {
                  const currentElement = slides[currentSlide]?.elements?.find(e => e.id === editingTextId);
                  if (!currentElement) return null;
                  
                  return (
                    <div className="border-t pt-4">
                      {/* Toolbar tabs */}
                      <div className="flex gap-1 mb-4 text-xs">
                        {[
                          { id: 'style', label: 'Style' },
                          { id: 'effects', label: 'Effets' },
                          { id: 'animate', label: 'Animer' },
                          { id: 'position', label: 'Position' },
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setTextToolTab(tab.id)}
                            className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all ${
                              textToolTab === tab.id 
                                ? 'bg-primary-100 text-primary-700' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Style Tab */}
                      {textToolTab === 'style' && (
                        <div className="space-y-4">
                          {/* Font Family */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Police</label>
                            <select 
                              value={currentElement.fontFamily || 'Inter'}
                              onChange={(e) => updateTextElement(editingTextId, { fontFamily: e.target.value })}
                              className="w-full border rounded-lg px-2 py-2 text-sm"
                              style={{ fontFamily: currentElement.fontFamily }}
                            >
                              {fonts.map(f => (
                                <option key={f.id} value={f.id} style={{ fontFamily: f.id }}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Font Size */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Taille</label>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => updateTextElement(editingTextId, { fontSize: Math.max(8, (currentElement.fontSize || 16) - 2) })}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                              >−</button>
                              <input 
                                type="number" 
                                min="8" 
                                max="200"
                                value={currentElement.fontSize || 16}
                                onChange={(e) => updateTextElement(editingTextId, { fontSize: parseInt(e.target.value) || 16 })}
                                className="flex-1 border rounded-lg px-2 py-2 text-sm text-center"
                              />
                              <button 
                                onClick={() => updateTextElement(editingTextId, { fontSize: Math.min(200, (currentElement.fontSize || 16) + 2) })}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                              >+</button>
                            </div>
                          </div>

                          {/* Text Color */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Couleur du texte</label>
                            <div className="grid grid-cols-6 gap-1 mb-2">
                              {presetColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => updateTextElement(editingTextId, { color })}
                                  className={`w-7 h-7 rounded-md border-2 transition-all ${
                                    currentElement.color === color ? 'border-primary-500 scale-110' : 'border-transparent hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="color"
                                value={currentElement.color || '#000000'}
                                onChange={(e) => updateTextElement(editingTextId, { color: e.target.value })}
                                className="w-10 h-10 border rounded-lg cursor-pointer"
                              />
                              <input 
                                type="text"
                                value={currentElement.color || '#000000'}
                                onChange={(e) => updateTextElement(editingTextId, { color: e.target.value })}
                                className="flex-1 border rounded-lg px-2 text-sm font-mono"
                                placeholder="#000000"
                              />
                            </div>
                          </div>

                          {/* Text Style Buttons */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Style</label>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => updateTextElement(editingTextId, { fontWeight: currentElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.fontWeight === 'bold' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                                title="Gras"
                              >
                                <Bold className="w-4 h-4 mx-auto" />
                              </button>
                              <button 
                                onClick={() => updateTextElement(editingTextId, { italic: !currentElement.italic })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.italic ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                                title="Italique"
                              >
                                <Italic className="w-4 h-4 mx-auto" />
                              </button>
                              <button 
                                onClick={() => updateTextElement(editingTextId, { underline: !currentElement.underline })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.underline ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                                title="Souligné"
                              >
                                <Underline className="w-4 h-4 mx-auto" />
                              </button>
                              <button 
                                onClick={() => updateTextElement(editingTextId, { strikethrough: !currentElement.strikethrough })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.strikethrough ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                                title="Barré"
                              >
                                <span className="text-sm font-medium line-through">S</span>
                              </button>
                            </div>
                          </div>

                          {/* Text Alignment */}
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Alignement</label>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => updateTextElement(editingTextId, { align: 'left' })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.align === 'left' || !currentElement.align ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                              >
                                <AlignLeft className="w-4 h-4 mx-auto" />
                              </button>
                              <button 
                                onClick={() => updateTextElement(editingTextId, { align: 'center' })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.align === 'center' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                              >
                                <AlignCenter className="w-4 h-4 mx-auto" />
                              </button>
                              <button 
                                onClick={() => updateTextElement(editingTextId, { align: 'right' })}
                                className={`p-2.5 rounded-lg flex-1 ${currentElement.align === 'right' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                              >
                                <AlignRight className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Effects Tab */}
                      {textToolTab === 'effects' && (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">Choisissez un effet pour votre texte</p>
                          <div className="grid grid-cols-2 gap-2">
                            {textEffects.map((effect) => (
                              <button
                                key={effect.id}
                                onClick={() => updateTextElement(editingTextId, { effect: effect.id })}
                                className={`p-3 rounded-lg border-2 text-left transition-all ${
                                  currentElement.effect === effect.id 
                                    ? 'border-primary-500 bg-primary-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <span 
                                  className="text-lg font-bold block"
                                  style={{ ...effect.style, color: currentElement.color || '#000' }}
                                >
                                  Ag
                                </span>
                                <span className="text-xs text-gray-500">{effect.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Animate Tab */}
                      {textToolTab === 'animate' && (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">Ajoutez une animation à votre texte</p>
                          <div className="grid grid-cols-2 gap-2">
                            {textAnimations.map((anim) => (
                              <button
                                key={anim.id}
                                onClick={() => updateTextElement(editingTextId, { animation: anim.id })}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${
                                  currentElement.animation === anim.id 
                                    ? 'border-primary-500 bg-primary-50' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className={`text-2xl mb-1 ${anim.class}`}>✨</div>
                                <span className="text-xs text-gray-600">{anim.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Position Tab */}
                      {textToolTab === 'position' && (
                        <div className="space-y-4">
                          {/* Quick alignment */}
                          <div>
                            <label className="text-xs text-gray-500 mb-2 block">Aligner sur la page</label>
                            <div className="grid grid-cols-3 gap-1">
                              <button onClick={() => updateTextElement(editingTextId, { x: 5, y: 5 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">↖ Haut-G</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 50, y: 5 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">↑ Haut</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 85, y: 5 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">↗ Haut-D</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 5, y: 45 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">← Gauche</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 50, y: 45 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">⊙ Centre</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 85, y: 45 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">→ Droite</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 5, y: 85 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">↙ Bas-G</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 50, y: 85 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">↓ Bas</button>
                              <button onClick={() => updateTextElement(editingTextId, { x: 85, y: 85 })} className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-xs">↘ Bas-D</button>
                            </div>
                          </div>

                          {/* Precise position */}
                          <div>
                            <label className="text-xs text-gray-500 mb-2 block">Position précise</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-gray-400">X (%)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  value={Math.round(currentElement.x || 0)}
                                  onChange={(e) => updateTextElement(editingTextId, { x: parseFloat(e.target.value) || 0 })}
                                  className="w-full border rounded px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-400">Y (%)</label>
                                <input 
                                  type="number" 
                                  min="0" 
                                  max="100"
                                  value={Math.round(currentElement.y || 0)}
                                  onChange={(e) => updateTextElement(editingTextId, { y: parseFloat(e.target.value) || 0 })}
                                  className="w-full border rounded px-2 py-1.5 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Rotation */}
                          <div>
                            <label className="text-xs text-gray-500 mb-2 block">Rotation</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="range" 
                                min="-180" 
                                max="180"
                                value={currentElement.rotation || 0}
                                onChange={(e) => updateTextElement(editingTextId, { rotation: parseInt(e.target.value) })}
                                className="flex-1"
                              />
                              <span className="text-xs text-gray-600 w-12 text-right">{currentElement.rotation || 0}°</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Delete button */}
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteElement(editingTextId); }}
                        className="w-full mt-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm"
                      >
                        Supprimer le texte
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Images */}
            {activeTool === 'images' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Images</h3>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                >
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Importer une image</p>
                </button>

                {/* Selected image controls */}
                {selectedMediaId && slides[currentSlide]?.media?.find(m => m.id === selectedMediaId && m.type === 'image') && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Modifier l'image</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Taille</label>
                        <div className="flex gap-2">
                          <button onClick={() => updateMediaSize(selectedMediaId, -5, -5)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">- Petit</button>
                          <button onClick={() => updateMediaSize(selectedMediaId, 5, 5)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">+ Grand</button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Taille précise</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            value={slides[currentSlide]?.media?.find(m => m.id === selectedMediaId)?.width || 35}
                            onChange={(e) => {
                              const media = slides[currentSlide]?.media || [];
                              const updatedMedia = media.map(m => m.id === selectedMediaId ? {...m, width: parseInt(e.target.value)} : m);
                              updateSlide(currentSlide, 'media', updatedMedia);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                            placeholder="Largeur %"
                          />
                          <input 
                            type="number"
                            value={slides[currentSlide]?.media?.find(m => m.id === selectedMediaId)?.height || 40}
                            onChange={(e) => {
                              const media = slides[currentSlide]?.media || [];
                              const updatedMedia = media.map(m => m.id === selectedMediaId ? {...m, height: parseInt(e.target.value)} : m);
                              updateSlide(currentSlide, 'media', updatedMedia);
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                            placeholder="Hauteur %"
                          />
                        </div>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMedia(selectedMediaId); }} className="w-full py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm">
                        Supprimer l'image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Videos */}
            {activeTool === 'videos' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Vidéos</h3>
                <input type="file" ref={videoInputRef} onChange={handleLocalVideoUpload} accept="video/*" className="hidden" />
                
                <div className="space-y-3">
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Importer vidéo locale</p>
                    <p className="text-xs text-gray-400 mt-1">Max 50MB</p>
                  </button>

                  <div className="text-center text-gray-400 text-sm">ou</div>

                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <Link2 className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Lien YouTube/Vimeo</p>
                  </button>
                </div>

                {/* Selected media controls */}
                {selectedMediaId && slides[currentSlide]?.media?.find(m => m.id === selectedMediaId) && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Modifier le média</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Taille</label>
                        <div className="flex gap-2">
                          <button onClick={() => updateMediaSize(selectedMediaId, -5, -5)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">- Petit</button>
                          <button onClick={() => updateMediaSize(selectedMediaId, 5, 5)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">+ Grand</button>
                        </div>
                      </div>
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMedia(selectedMediaId); }} className="w-full py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm">
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div 
          className="flex-1 bg-gray-200 p-8 overflow-auto flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            ref={canvasRef}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
            style={{ 
              width: `${(16 * zoom / 100) * 40}px`,
              aspectRatio: '16/9'
            }}
          >
            <div 
              className="w-full h-full p-8 relative select-none"
              style={{ 
                background: currentColors.bg,
                color: currentColors.text
              }}
              onClick={() => { setSelectedMediaId(null); setEditingTextId(null); setSelectedElementId(null); setEditingSlideField(null); }}
            >
              {/* Slide Elements */}
              {slides[currentSlide]?.elements?.map((el) => {
                if (el.type === 'text') {
                  const isEditing = editingTextId === el.id;
                  const effect = textEffects.find(e => e.id === el.effect) || textEffects[0];
                  const animation = textAnimations.find(a => a.id === el.animation) || textAnimations[0];
                  
                  return (
                    <div 
                      key={el.id} 
                      onMouseDown={(e) => handleTextMouseDown(e, el.id)}
                      onDoubleClick={(e) => handleTextDoubleClick(e, el)}
                      className={`absolute cursor-move hover:outline hover:outline-2 hover:outline-primary-300 ${isEditing ? 'outline outline-2 outline-primary-500' : ''} ${animation.class}`}
                      style={{ 
                        left: `${el.x}%`, 
                        top: `${el.y}%`, 
                        fontSize: el.fontSize * zoom / 100, 
                        fontWeight: el.fontWeight, 
                        fontFamily: el.fontFamily || 'Inter',
                        color: el.color,
                        fontStyle: el.italic ? 'italic' : 'normal',
                        textDecoration: `${el.underline ? 'underline' : ''} ${el.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                        textAlign: el.align || 'left',
                        transform: el.rotation ? `rotate(${el.rotation}deg)` : 'none',
                        minWidth: '50px',
                        ...effect.style
                      }}
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          value={el.text}
                          onChange={(e) => updateTextElement(el.id, { text: e.target.value })}
                          className="bg-transparent border-none outline-none w-full"
                          style={{ 
                            fontSize: 'inherit', 
                            fontWeight: 'inherit', 
                            fontFamily: 'inherit',
                            fontStyle: 'inherit',
                            textDecoration: 'inherit',
                            textAlign: 'inherit',
                            color: 'inherit'
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        el.text
                      )}
                      {isEditing && (
                        <>
                          {/* Resize handle for text - bottom right */}
                          <div 
                            className="absolute -right-2 -bottom-2 w-4 h-4 bg-primary-500 rounded-full cursor-se-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const canvas = canvasRef.current;
                              if (!canvas) return;
                              const rect = canvas.getBoundingClientRect();
                              setDragStart({ x: e.clientX, y: e.clientY, canvasWidth: rect.width, canvasHeight: rect.height });
                              setIsResizing(true);
                              setDragType('textResize');
                              setSelectedElementId(el.id);
                            }}
                          />
                          {/* Delete button */}
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteElement(el.id); }}
                            className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {/* Size indicator */}
                          <div className="absolute -bottom-5 left-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                            {el.fontSize}px
                          </div>
                        </>
                      )}
                    </div>
                  );
                }
                const iconData = getAllElements().find(i => i.id === el.elementId);
                if (iconData) {
                  const Icon = iconData.icon;
                  const isSelected = selectedElementId === el.id;
                  return (
                    <div 
                      key={el.id}
                      onMouseDown={(e) => handleDragStart(e, el.id, 'element', 'drag')}
                      onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                      className={`absolute cursor-move ${isSelected ? 'outline outline-2 outline-primary-500' : 'hover:outline hover:outline-2 hover:outline-primary-300'}`}
                      style={{ left: `${el.x}%`, top: `${el.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <Icon size={el.size * zoom / 100} style={{ color: el.color }} />
                      {/* Resize handles for shapes/icons */}
                      {isSelected && (
                        <>
                          <div 
                            className="absolute -right-2 -bottom-2 w-4 h-4 bg-primary-500 rounded-full cursor-se-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10" 
                            onMouseDown={(e) => handleDragStart(e, el.id, 'element', 'resize')}
                          />
                          <div 
                            className="absolute -left-2 -top-2 w-4 h-4 bg-primary-500 rounded-full cursor-nw-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10"
                            onMouseDown={(e) => handleDragStart(e, el.id, 'element', 'resize')}
                          />
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteElement(el.id); }}
                            className="absolute -top-4 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                            {Math.round(el.size)}px
                          </div>
                        </>
                      )}
                    </div>
                  );
                }
                return null;
              })}

              {/* Media */}
              {slides[currentSlide]?.media?.map((m) => (
                <div 
                  key={m.id}
                  onMouseDown={(e) => handleDragStart(e, m.id, 'media', 'drag')}
                  onClick={(e) => { e.stopPropagation(); setSelectedMediaId(m.id); setSelectedElementId(null); setActiveTool(m.type === 'image' ? 'images' : 'videos'); }}
                  className={`absolute cursor-move group ${selectedMediaId === m.id ? 'outline outline-2 outline-primary-500' : 'hover:outline hover:outline-2 hover:outline-primary-300'}`}
                  style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.width}%`, height: `${m.height}%` }}
                >
                  {m.type === 'image' ? (
                    <img src={m.url} alt="" className="w-full h-full object-contain rounded-lg pointer-events-none" draggable={false} />
                  ) : m.isLocal ? (
                    <video src={m.url} className="w-full h-full object-contain rounded-lg" controls />
                  ) : (
                    <iframe src={m.url} className="w-full h-full rounded-lg pointer-events-none" frameBorder="0" />
                  )}
                  {/* Resize handles - drag to resize */}
                  {selectedMediaId === m.id && (
                    <>
                      {/* Bottom-right corner - resize larger */}
                      <div 
                        className="absolute -right-2 -bottom-2 w-4 h-4 bg-primary-500 rounded-full cursor-se-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10" 
                        onMouseDown={(e) => handleDragStart(e, m.id, 'media', 'resize')}
                      />
                      {/* Top-left corner - resize smaller */}
                      <div 
                        className="absolute -left-2 -top-2 w-4 h-4 bg-primary-500 rounded-full cursor-nw-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10"
                        onMouseDown={(e) => handleDragStart(e, m.id, 'media', 'resize')}
                      />
                      {/* Top-right corner - resize */}
                      <div 
                        className="absolute -right-2 -top-2 w-4 h-4 bg-primary-500 rounded-full cursor-ne-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10"
                        onMouseDown={(e) => handleDragStart(e, m.id, 'media', 'resize')}
                      />
                      {/* Bottom-left corner - resize */}
                      <div 
                        className="absolute -left-2 -bottom-2 w-4 h-4 bg-primary-500 rounded-full cursor-sw-resize hover:bg-primary-600 hover:scale-110 transition-transform z-10"
                        onMouseDown={(e) => handleDragStart(e, m.id, 'media', 'resize')}
                      />
                      {/* Delete button */}
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMedia(m.id); }}
                        className="absolute -top-4 right-1/2 translate-x-1/2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {/* Size indicator */}
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded z-10">
                        {Math.round(m.width)}% × {Math.round(m.height)}%
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Title - Draggable */}
              <div 
                onMouseDown={(e) => {
                  if (e.target.tagName === 'INPUT') return;
                  e.preventDefault();
                  e.stopPropagation();
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  setDragStart({ x: e.clientX, y: e.clientY, canvasWidth: rect.width, canvasHeight: rect.height });
                  setEditingSlideField('title');
                  setIsDragging(true);
                  setDragType('slideTitle');
                }}
                onClick={(e) => { e.stopPropagation(); setEditingSlideField('title'); setEditingTextId(null); setActiveTool('text'); }}
                className={`absolute cursor-move rounded-lg transition-all ${editingSlideField === 'title' ? 'ring-2 ring-primary-500 bg-white/10' : 'hover:bg-white/5'}`}
                style={{
                  left: `${slides[currentSlide]?.titleStyle?.x || 5}%`,
                  top: `${slides[currentSlide]?.titleStyle?.y || 10}%`,
                  maxWidth: '90%',
                }}
              >
                <input
                  type="text"
                  value={slides[currentSlide]?.title || ''}
                  onChange={(e) => updateSlide(currentSlide, 'title', e.target.value)}
                  className="bg-transparent border-none outline-none px-2 py-1 cursor-text"
                  style={{ 
                    color: slides[currentSlide]?.titleStyle?.color || currentColors.text,
                    fontSize: `${(slides[currentSlide]?.titleStyle?.fontSize || 32) * zoom / 100}px`,
                    fontWeight: slides[currentSlide]?.titleStyle?.fontWeight || 'bold',
                    fontFamily: slides[currentSlide]?.titleStyle?.fontFamily || 'Inter',
                    fontStyle: slides[currentSlide]?.titleStyle?.italic ? 'italic' : 'normal',
                    textDecoration: `${slides[currentSlide]?.titleStyle?.underline ? 'underline' : ''} ${slides[currentSlide]?.titleStyle?.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                    textAlign: slides[currentSlide]?.titleStyle?.align || 'left',
                    minWidth: '100px',
                  }}
                  placeholder="Titre"
                />
              </div>

              {/* Content - Draggable */}
              <div 
                onMouseDown={(e) => {
                  if (e.target.tagName === 'TEXTAREA') return;
                  e.preventDefault();
                  e.stopPropagation();
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  setDragStart({ x: e.clientX, y: e.clientY, canvasWidth: rect.width, canvasHeight: rect.height });
                  setEditingSlideField('content');
                  setIsDragging(true);
                  setDragType('slideContent');
                }}
                onClick={(e) => { e.stopPropagation(); setEditingSlideField('content'); setEditingTextId(null); setActiveTool('text'); }}
                className={`absolute cursor-move rounded-lg transition-all ${editingSlideField === 'content' ? 'ring-2 ring-primary-500 bg-white/10' : 'hover:bg-white/5'}`}
                style={{
                  left: `${slides[currentSlide]?.contentStyle?.x || 5}%`,
                  top: `${slides[currentSlide]?.contentStyle?.y || 30}%`,
                  maxWidth: '90%',
                }}
              >
                <textarea
                  value={slides[currentSlide]?.content || ''}
                  onChange={(e) => updateSlide(currentSlide, 'content', e.target.value)}
                  className="bg-transparent border-none outline-none resize-none min-h-[60px] px-2 py-1 cursor-text"
                    style={{ 
                      color: slides[currentSlide]?.contentStyle?.color || currentColors.text,
                      fontSize: `${(slides[currentSlide]?.contentStyle?.fontSize || 18) * zoom / 100}px`,
                      fontWeight: slides[currentSlide]?.contentStyle?.fontWeight || 'normal',
                      fontFamily: slides[currentSlide]?.contentStyle?.fontFamily || 'Inter',
                      fontStyle: slides[currentSlide]?.contentStyle?.italic ? 'italic' : 'normal',
                      textDecoration: `${slides[currentSlide]?.contentStyle?.underline ? 'underline' : ''} ${slides[currentSlide]?.contentStyle?.strikethrough ? 'line-through' : ''}`.trim() || 'none',
                      textAlign: slides[currentSlide]?.contentStyle?.align || 'left',
                    }}
                    placeholder="Contenu..."
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Slides */}
        <div className="w-48 bg-gray-900 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-sm font-medium">Slides</span>
            <button onClick={addSlide} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {slides.map((slide, index) => {
              const colors = getTemplateColors(slide.template);
              return (
                <button
                  key={slide.id || index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-full rounded-lg overflow-hidden border-2 transition-all ${
                    currentSlide === index ? 'border-primary-500' : 'border-transparent hover:border-gray-600'
                  }`}
                >
                  <div 
                    className="aspect-video p-2 text-left"
                    style={{ background: colors.bg, color: colors.text }}
                  >
                    <p className="text-[8px] font-bold truncate">{slide.title}</p>
                    <p className="text-[6px] opacity-70 truncate">{slide.content?.substring(0, 30)}</p>
                  </div>
                  <div className="bg-gray-800 px-2 py-1 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">{index + 1}</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); duplicateSlide(); }} className="p-0.5 hover:bg-gray-700 rounded">
                        <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSlide(); }} className="p-0.5 hover:bg-gray-700 rounded">
                        <Trash2 className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Video URL Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une vidéo</h3>
            <p className="text-sm text-gray-600 mb-4">Collez l'URL YouTube ou Vimeo</p>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border rounded-lg px-3 py-2 mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowVideoModal(false); setVideoUrl(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={addVideoFromUrl}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchDeckEditor;
