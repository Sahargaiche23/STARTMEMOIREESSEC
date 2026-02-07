import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Filter, TrendingUp, TrendingDown,
  Edit2, Trash2, Download, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AccountingTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCategory, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterCategory) params.append('category', filterCategory);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/accounting/transactions?${params}`);
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await api.put(`/accounting/transactions/${editingTransaction.id}`, {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        toast.success('Transaction mise à jour !');
      } else {
        await api.post('/accounting/transactions', {
          ...formData,
          amount: parseFloat(formData.amount)
        });
        toast.success('Transaction ajoutée !');
      }
      setShowAddModal(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      amount: transaction.amount.toString(),
      date: transaction.date,
      paymentMethod: transaction.paymentMethod || 'virement',
      reference: transaction.reference || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette transaction ?')) return;
    try {
      await api.delete(`/accounting/transactions/${id}`);
      toast.success('Transaction supprimée');
      fetchTransactions();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'revenue',
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'virement',
      reference: ''
    });
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
      month: 'long',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = filteredTransactions.reduce((acc, t) => {
    if (t.type === 'revenue') acc.revenues += t.amount;
    else acc.expenses += t.amount;
    return acc;
  }, { revenues: 0, expenses: 0 });

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
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">{filteredTransactions.length} transaction(s)</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setEditingTransaction(null); setShowAddModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input"
          >
            <option value="">Tous les types</option>
            <option value="revenue">Revenus</option>
            <option value="expense">Dépenses</option>
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input"
            placeholder="Date début"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input"
            placeholder="Date fin"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600">Total Revenus</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(totals.revenues)}</p>
        </div>
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-600">Total Dépenses</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-600">Solde</p>
          <p className={`text-xl font-bold ${totals.revenues - totals.expenses >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(totals.revenues - totals.expenses)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Catégorie</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Référence</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Montant</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'revenue' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type === 'revenue' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {transaction.type === 'revenue' ? 'Revenu' : 'Dépense'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{transaction.category}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{transaction.description || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{transaction.reference || '-'}</td>
                <td className={`px-4 py-3 text-sm font-semibold text-right ${
                  transaction.type === 'revenue' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'revenue' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune transaction trouvée</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {editingTransaction ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'revenue', category: '' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.type === 'revenue'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Revenu
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.type === 'expense'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Dépense
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {(formData.type === 'revenue' ? revenueCategories : expenseCategories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (TND)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingTransaction(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingTransaction ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingTransactions;
