import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown,
  DollarSign, AlertTriangle, CheckCircle, FileSpreadsheet,
  User, Building, Mail, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const SharedAccountingData = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedData();
  }, [token]);

  const fetchSharedData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/accounting/shared/${token}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(amount || 0) + ' TND';
  };

  const handleExportCSV = () => {
    if (!data?.transactions) return;
    
    const headers = ['Date', 'Type', 'Catégorie', 'Description', 'Montant'];
    const rows = data.transactions.map(t => [
      t.date,
      t.type === 'revenue' ? 'Revenu' : 'Dépense',
      t.category,
      t.description || '',
      t.amount
    ]);
    
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transactions_${data.owner.name.replace(/\s/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export téléchargé !');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="btn-primary inline-block">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-bold">StartUpLab</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Données Comptables Partagées</h1>
          <p className="opacity-90">Accès sécurisé aux données de {data.owner.name}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Owner Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{data.owner.name}</p>
                <p className="text-sm text-gray-500">{data.owner.email}</p>
              </div>
            </div>
            {data.owner.company && (
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="w-5 h-5" />
                <span>{data.owner.company}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>
                Du {new Date(data.period.start).toLocaleDateString('fr-FR')} au {new Date(data.period.end).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-amber-600 ml-auto">
              <Clock className="w-5 h-5" />
              <span className="text-sm">
                Expire le {new Date(data.expiresAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Revenus</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-gray-500">Dépenses</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(data.summary.totalExpense)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Bénéfice Net</span>
            </div>
            <p className={`text-2xl font-bold ${data.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.summary.netProfit)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.summary.transactionCount}</p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Exporter CSV
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          </div>
          {data.transactions.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Catégorie</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(t.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        t.type === 'revenue' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {t.type === 'revenue' ? (
                          <><TrendingUp className="w-3 h-3" /> Revenu</>
                        ) : (
                          <><TrendingDown className="w-3 h-3" /> Dépense</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.description || '-'}</td>
                    <td className={`px-6 py-4 text-sm font-medium text-right ${
                      t.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'revenue' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-8 text-center text-gray-500">Aucune transaction pour cette période</p>
          )}
        </div>

        {/* VAT Declarations */}
        {data.vatDeclarations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Déclarations TVA</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Période</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">TVA Collectée</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">TVA Déductible</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">TVA Due</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.vatDeclarations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{d.period}</td>
                    <td className="px-6 py-4 text-right text-orange-600">{formatCurrency(d.vatCollected)}</td>
                    <td className="px-6 py-4 text-right text-green-600">{formatCurrency(d.vatDeductible)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${d.vatDue >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(d.vatDue)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {d.status === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <CheckCircle className="w-3 h-3" /> Soumise
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                          <Clock className="w-3 h-3" /> Brouillon
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Données partagées via StartUpLab - Plateforme de gestion pour entrepreneurs tunisiens</p>
        </div>
      </div>
    </div>
  );
};

export default SharedAccountingData;
