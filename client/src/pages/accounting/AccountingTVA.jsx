import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calculator, Download, Calendar, 
  FileText, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AccountingTVA = () => {
  const [vatSummary, setVatSummary] = useState(null);
  const [declarations, setDeclarations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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
        salesAmount: vatSummary.salesTTC,
        purchasesAmount: vatSummary.purchasesTTC,
        vatCollected: vatSummary.vatCollected,
        vatDeductible: vatSummary.vatDeductible,
        vatDue: vatSummary.vatDue
      });
      toast.success('Déclaration TVA enregistrée !');
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
                <span className="font-medium">{formatCurrency(vatSummary?.salesHT)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Chiffre d'affaires TTC</span>
                <span className="font-medium">{formatCurrency(vatSummary?.salesTTC)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-medium text-orange-700">TVA Collectée ({vatSummary?.vatRate})</span>
                <span className="font-bold text-orange-600">{formatCurrency(vatSummary?.vatCollected)}</span>
              </div>
            </div>
          </div>

          {/* Achats */}
          <div className="bg-white rounded-xl p-5 border border-orange-200">
            <h3 className="text-sm font-medium text-gray-500 mb-4">ACHATS / CHARGES</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total achats HT</span>
                <span className="font-medium">{formatCurrency(vatSummary?.purchasesHT)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total achats TTC</span>
                <span className="font-medium">{formatCurrency(vatSummary?.purchasesTTC)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-medium text-green-700">TVA Déductible ({vatSummary?.vatRate})</span>
                <span className="font-bold text-green-600">{formatCurrency(vatSummary?.vatDeductible)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TVA Due */}
        <div className={`mt-6 p-5 rounded-xl ${
          (vatSummary?.vatDue || 0) >= 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {(vatSummary?.vatDue || 0) >= 0 ? 'TVA à payer' : 'Crédit de TVA'}
              </p>
              <p className={`text-3xl font-bold ${
                (vatSummary?.vatDue || 0) >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(Math.abs(vatSummary?.vatDue || 0))}
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

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taux TVA Standard</p>
              <p className="text-xl font-bold text-gray-900">19%</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taux TVA Réduit</p>
              <p className="text-xl font-bold text-gray-900">7%</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Échéance</p>
              <p className="text-xl font-bold text-gray-900">28 du mois</p>
            </div>
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
