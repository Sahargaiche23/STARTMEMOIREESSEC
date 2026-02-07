import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart,
  Plus, Download, Calendar, ArrowUpRight, ArrowDownRight,
  FileText, Calculator, Receipt, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AccountingDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'revenue',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'virement',
    reference: ''
  });

  const revenueCategories = [
    'Ventes produits', 'Prestations services', 'Abonnements', 'Commissions', 'Autres revenus'
  ];

  const expenseCategories = [
    'Achats marchandises', 'Salaires', 'Loyer', 'Électricité', 'Internet/Téléphone',
    'Marketing', 'Fournitures', 'Transport', 'Assurances', 'Autres charges'
  ];

  const months = [
    { value: '', label: 'Toute l\'année' },
    { value: '1', label: 'Janvier' },
    { value: '2', label: 'Février' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'Avril' },
    { value: '5', label: 'Mai' },
    { value: '6', label: 'Juin' },
    { value: '7', label: 'Juillet' },
    { value: '8', label: 'Août' },
    { value: '9', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  useEffect(() => {
    fetchSummary();
  }, [selectedYear, selectedMonth]);

  const fetchSummary = async () => {
    try {
      const params = new URLSearchParams({ year: selectedYear });
      if (selectedMonth) params.append('month', selectedMonth);
      
      const res = await api.get(`/accounting/summary?${params}`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounting/transactions', {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      toast.success('Transaction ajoutée !');
      setShowAddModal(false);
      setNewTransaction({
        type: 'revenue',
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'virement',
        reference: ''
      });
      fetchSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(amount) + ' TND';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comptabilité</h1>
          <p className="text-gray-600">Tableau de bord financier</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input py-2"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input py-2"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Revenus</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(summary?.summary?.totalRevenues || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Dépenses</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(summary?.summary?.totalExpenses || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Bénéfice Net</p>
              <p className={`text-2xl font-bold ${(summary?.summary?.profit || 0) >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                {formatCurrency(summary?.summary?.profit || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Marge</p>
              <p className="text-2xl font-bold text-purple-700">
                {summary?.summary?.profitMargin || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/comptabilite/transactions" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Transactions</p>
              <p className="text-sm text-gray-500">Voir toutes</p>
            </div>
          </div>
        </Link>

        <Link to="/comptabilite/bilan" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Bilan</p>
              <p className="text-sm text-gray-500">Actif/Passif</p>
            </div>
          </div>
        </Link>

        <Link to="/comptabilite/tva" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Calculator className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">TVA</p>
              <p className="text-sm text-gray-500">Déclarations</p>
            </div>
          </div>
        </Link>

        <Link to="/comptabilite/export" className="card hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Export</p>
              <p className="text-sm text-gray-500">PDF/Excel</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Charts & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
          <div className="space-y-3">
            {summary?.monthlyData?.map((month) => {
              const maxValue = Math.max(...(summary?.monthlyData?.map(m => Math.max(m.revenues, m.expenses)) || [1]));
              return (
                <div key={month.month} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{months.find(m => m.value === month.month)?.label || month.month}</span>
                    <span className="font-medium">{formatCurrency(month.revenues - month.expenses)}</span>
                  </div>
                  <div className="flex gap-1 h-4">
                    <div 
                      className="bg-green-500 rounded-l"
                      style={{ width: `${(month.revenues / maxValue) * 50}%` }}
                    />
                    <div 
                      className="bg-red-500 rounded-r"
                      style={{ width: `${(month.expenses / maxValue) * 50}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {(!summary?.monthlyData || summary.monthlyData.length === 0) && (
              <p className="text-gray-500 text-center py-8">Aucune donnée pour cette période</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transactions récentes</h3>
            <Link to="/comptabilite/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {summary?.recentTransactions?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'revenue' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.category}</p>
                    <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
            {(!summary?.recentTransactions || summary.recentTransactions.length === 0) && (
              <p className="text-gray-500 text-center py-8">Aucune transaction</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par catégorie</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenues */}
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-3">Revenus</h4>
            <div className="space-y-2">
              {summary?.categoryBreakdown?.filter(c => c.type === 'revenue').map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-gray-600">{cat.category}</span>
                  <span className="font-medium text-green-600">{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Expenses */}
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-3">Dépenses</h4>
            <div className="space-y-2">
              {summary?.categoryBreakdown?.filter(c => c.type === 'expense').map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-gray-600">{cat.category}</span>
                  <span className="font-medium text-red-600">{formatCurrency(cat.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle transaction</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'revenue', category: '' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    newTransaction.type === 'revenue'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 inline mr-2" />
                  Revenu
                </button>
                <button
                  type="button"
                  onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: '' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    newTransaction.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown className="w-5 h-5 inline mr-2" />
                  Dépense
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {(newTransaction.type === 'revenue' ? revenueCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="input"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="input"
                  placeholder="Description de la transaction"
                />
              </div>

              {/* Payment Method & Reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                  <select
                    value={newTransaction.paymentMethod}
                    onChange={(e) => setNewTransaction({ ...newTransaction, paymentMethod: e.target.value })}
                    className="input"
                  >
                    <option value="virement">Virement</option>
                    <option value="especes">Espèces</option>
                    <option value="cheque">Chèque</option>
                    <option value="carte">Carte bancaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                  <input
                    type="text"
                    value={newTransaction.reference}
                    onChange={(e) => setNewTransaction({ ...newTransaction, reference: e.target.value })}
                    className="input"
                    placeholder="N° facture..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;
