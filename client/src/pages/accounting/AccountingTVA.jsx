import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calculator, Download, Calendar, 
  FileText, CheckCircle, Clock, AlertTriangle, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AccountingTVA = () => {
  const [vatSummary, setVatSummary] = useState(null);
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [vatRate, setVatRate] = useState(19);
  const [customRate, setCustomRate] = useState(false);
  const [salesHT, setSalesHT] = useState(0);
  const [purchasesHT, setPurchasesHT] = useState(0);

  const months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      const [summaryRes, declarationsRes] = await Promise.all([
        api.get(`/accounting/vat/summary?year=${selectedYear}&month=${selectedMonth}`),
        api.get('/accounting/vat/declarations')
      ]);
      setVatSummary(summaryRes.data);
      setDeclarations(declarationsRes.data.declarations || []);
    } catch (error) {
      console.error('Error fetching VAT data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDeclaration = async () => {
    try {
      await api.post('/accounting/vat/declarations', {
        year: selectedYear,
        month: selectedMonth,
        salesAmount: displaySalesTTC,
        purchasesAmount: displayPurchasesTTC,
        vatCollected: calculatedVatCollected,
        vatDeductible: calculatedVatDeductible,
        vatDue: calculatedVatDue,
        vatRate: vatRate
      });
      toast.success('Déclaration TVA enregistrée !');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDeleteDeclaration = async (id) => {
    if (!confirm('Supprimer cette déclaration ?')) return;
    try {
      await api.delete(`/accounting/vat/declarations/${id}`);
      toast.success('Déclaration supprimée !');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(amount || 0) + ' TND';
  };

  // Calculate TVA based on custom rate
  const calculatedVatCollected = (salesHT || vatSummary?.salesHT || 0) * (vatRate / 100);
  const calculatedVatDeductible = (purchasesHT || vatSummary?.purchasesHT || 0) * (vatRate / 100);
  const calculatedVatDue = calculatedVatCollected - calculatedVatDeductible;

  // Use calculated values or API values
  const displaySalesHT = salesHT || vatSummary?.salesHT || 0;
  const displayPurchasesHT = purchasesHT || vatSummary?.purchasesHT || 0;
  const displaySalesTTC = displaySalesHT * (1 + vatRate / 100);
  const displayPurchasesTTC = displayPurchasesHT * (1 + vatRate / 100);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/comptabilite" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TVA Tunisie</h1>
            <p className="text-gray-600">Calcul et déclaration de TVA automatisés</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input py-2"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input py-2"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TVA Summary Card */}
      <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Déclaration TVA</h2>
            <p className="text-orange-600">
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ventes */}
          <div className="bg-white rounded-xl p-5 border border-orange-200">
            <h3 className="text-sm font-medium text-gray-500 mb-4">VENTES / PRESTATIONS</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chiffre d'affaires HT</span>
                <span className="font-medium">{formatCurrency(displaySalesHT)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chiffre d'affaires TTC</span>
                <span className="font-medium">{formatCurrency(displaySalesTTC)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-medium text-orange-700">TVA Collectée ({vatRate}%)</span>
                <span className="font-bold text-orange-600">{formatCurrency(calculatedVatCollected)}</span>
              </div>
            </div>
          </div>

          {/* Achats */}
          <div className="bg-white rounded-xl p-5 border border-orange-200">
            <h3 className="text-sm font-medium text-gray-500 mb-4">ACHATS / CHARGES</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total achats HT</span>
                <span className="font-medium">{formatCurrency(displayPurchasesHT)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total achats TTC</span>
                <span className="font-medium">{formatCurrency(displayPurchasesTTC)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-medium text-green-700">TVA Déductible ({vatRate}%)</span>
                <span className="font-bold text-green-600">{formatCurrency(calculatedVatDeductible)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TVA Due */}
        <div className={`mt-6 p-5 rounded-xl ${
          calculatedVatDue >= 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {calculatedVatDue >= 0 ? 'TVA à payer' : 'Crédit de TVA'}
              </p>
              <p className={`text-3xl font-bold ${
                calculatedVatDue >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(Math.abs(calculatedVatDue))}
              </p>
            </div>
            <button
              onClick={handleSaveDeclaration}
              className="btn-primary flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              Enregistrer la déclaration
            </button>
          </div>
        </div>
      </div>

      {/* TVA Rate Selector */}
      <div className="card border-2 border-primary-200 bg-gradient-to-r from-primary-50 to-indigo-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration du taux TVA</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => { setVatRate(19); setCustomRate(false); }}
            className={`p-4 rounded-xl border-2 transition-all ${
              vatRate === 19 && !customRate
                ? 'border-primary-500 bg-primary-100'
                : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Standard</p>
                <p className="text-xl font-bold text-gray-900">19%</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => { setVatRate(7); setCustomRate(false); }}
            className={`p-4 rounded-xl border-2 transition-all ${
              vatRate === 7 && !customRate
                ? 'border-primary-500 bg-primary-100'
                : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Réduit</p>
                <p className="text-xl font-bold text-gray-900">7%</p>
              </div>
            </div>
          </button>
          <div className={`p-4 rounded-xl border-2 transition-all ${
            customRate ? 'border-primary-500 bg-primary-100' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-gray-500">Personnalisé</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={customRate ? vatRate : ''}
                    onChange={(e) => { 
                      setCustomRate(true);
                      setVatRate(parseFloat(e.target.value) || 0);
                    }}
                    placeholder="Taux"
                    className="w-16 px-2 py-1 border rounded text-lg font-bold"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                  <span className="text-xl font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border-2 border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Échéance</p>
                <p className="text-xl font-bold text-gray-900">28 du mois</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Entry Section */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Saisie manuelle (optionnel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ventes HT (TND)</label>
            <input
              type="number"
              value={salesHT || ''}
              onChange={(e) => setSalesHT(parseFloat(e.target.value) || 0)}
              placeholder={vatSummary?.salesHT?.toString() || '0'}
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              TVA calculée: {formatCurrency(salesHT * vatRate / 100)} ({vatRate}%)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Achats HT (TND)</label>
            <input
              type="number"
              value={purchasesHT || ''}
              onChange={(e) => setPurchasesHT(parseFloat(e.target.value) || 0)}
              placeholder={vatSummary?.purchasesHT?.toString() || '0'}
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              TVA déductible: {formatCurrency(purchasesHT * vatRate / 100)} ({vatRate}%)
            </p>
          </div>
        </div>
      </div>

      {/* Previous Declarations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des déclarations</h3>
        
        {declarations.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Période</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">CA TTC</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">TVA Collectée</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">TVA Déductible</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">TVA Due</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {declarations.map((decl) => (
                <tr key={decl.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{decl.period}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(decl.salesAmount)}</td>
                  <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(decl.vatCollected)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatCurrency(decl.vatDeductible)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${decl.vatDue >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(decl.vatDue)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {decl.status === 'submitted' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Soumise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteDeclaration(decl.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune déclaration enregistrée</p>
        )}
      </div>
    </div>
  );
};

export default AccountingTVA;
