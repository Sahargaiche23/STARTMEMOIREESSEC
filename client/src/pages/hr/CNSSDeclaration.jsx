import { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Download, FileText, RefreshCw, 
  Check, Clock, AlertTriangle, Send, Calculator, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CNSSDeclaration = () => {
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));

  const quarters = [
    { value: 1, label: 'T1 (Jan-Mar)', months: 'Janvier - Mars' },
    { value: 2, label: 'T2 (Avr-Jun)', months: 'Avril - Juin' },
    { value: 3, label: 'T3 (Jul-Sep)', months: 'Juillet - Septembre' },
    { value: 4, label: 'T4 (Oct-Déc)', months: 'Octobre - Décembre' }
  ];

  useEffect(() => {
    fetchDeclarations();
  }, []);

  const fetchDeclarations = async () => {
    try {
      const res = await api.get('/hr/cnss');
      setDeclarations(res.data.declarations || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/hr/cnss/generate', {
        quarter: selectedQuarter,
        year: selectedYear
      });
      toast.success(res.data.message);
      fetchDeclarations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (id) => {
    try {
      const res = await api.post(`/hr/cnss/${id}/submit`);
      toast.success(`Déclaration soumise - Réf: ${res.data.referenceNumber}`);
      fetchDeclarations();
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Soumise</span>;
      case 'paid':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Payée</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Brouillon</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Get current quarter declaration if exists
  const currentDeclaration = declarations.find(d => d.year === selectedYear && d.quarter === selectedQuarter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Déclaration CNSS</h1>
          <p className="text-gray-600">Déclarations trimestrielles des cotisations sociales</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">Taux de cotisation CNSS Tunisie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-white/80 text-sm">Part salariale</p>
                <p className="text-2xl font-bold">9.18%</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Part patronale</p>
                <p className="text-2xl font-bold">16.57%</p>
              </div>
              <div>
                <p className="text-white/80 text-sm">Total</p>
                <p className="text-2xl font-bold">25.75%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate New Declaration */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Générer une déclaration</h2>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Trimestre</label>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(Number(e.target.value))}
              className="input w-full"
            >
              {quarters.map(q => (
                <option key={q.value} value={q.value}>{q.label} - {q.months}</option>
              ))}
            </select>
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input w-full"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || currentDeclaration}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {generating ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Calculator className="w-5 h-5" />
            )}
            {currentDeclaration ? 'Déjà générée' : 'Générer'}
          </button>
        </div>
        
        {currentDeclaration && (
          <div className="mt-4 p-4 bg-green-50 rounded-xl">
            <p className="text-green-700 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Une déclaration existe déjà pour {quarters[selectedQuarter - 1].label} {selectedYear}
            </p>
          </div>
        )}
      </div>

      {/* Declarations List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Historique des déclarations</h2>
        
        {declarations.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune déclaration CNSS</p>
          </div>
        ) : (
          <div className="space-y-4">
            {declarations.map((decl) => (
              <div key={decl.id} className="border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {quarters[decl.quarter - 1]?.label} {decl.year}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {decl.totalEmployees} employés • Échéance: {decl.dueDate ? new Date(decl.dueDate).toLocaleDateString('fr-FR') : '-'}
                      </p>
                      {decl.referenceNumber && (
                        <p className="text-xs text-gray-500 mt-1">Réf: {decl.referenceNumber}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(decl.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Masse salariale</p>
                    <p className="font-semibold">{formatCurrency(decl.totalGrossSalary)} TND</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Part salariale</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(decl.cnssEmployeeTotal)} TND</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Part patronale</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(decl.cnssEmployerTotal)} TND</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total à payer</p>
                    <p className="font-bold text-amber-700">{formatCurrency(decl.totalContributions)} TND</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {decl.status === 'draft' && (
                    <button
                      onClick={() => handleSubmit(decl.id)}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Soumettre
                    </button>
                  )}
                  <button className="btn-secondary text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Formulaire DS
                  </button>
                  <button className="btn-secondary text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Liste nominative
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="card bg-blue-50">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Rappel des échéances
        </h3>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg">
            <p className="font-medium text-blue-800">T1 (Jan-Mar)</p>
            <p className="text-gray-600">Échéance: 15 Avril</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="font-medium text-blue-800">T2 (Avr-Jun)</p>
            <p className="text-gray-600">Échéance: 15 Juillet</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="font-medium text-blue-800">T3 (Jul-Sep)</p>
            <p className="text-gray-600">Échéance: 15 Octobre</p>
          </div>
          <div className="bg-white p-3 rounded-lg">
            <p className="font-medium text-blue-800">T4 (Oct-Déc)</p>
            <p className="text-gray-600">Échéance: 15 Janvier</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CNSSDeclaration;
