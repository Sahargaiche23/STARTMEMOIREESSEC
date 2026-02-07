import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, FileText, FileSpreadsheet, 
  Share2, Mail, Calendar, CheckCircle, X, Send, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AccountingExport = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exportData, setExportData] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [accountantEmail, setAccountantEmail] = useState('');
  const [accountantName, setAccountantName] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const handleExportFEC = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounting/export/fec?startDate=${startDate}&endDate=${endDate}`);
      setExportData(res.data);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FEC_${startDate}_${endDate}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export FEC téléchargé !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const handleExportSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounting/export/summary?startDate=${startDate}&endDate=${endDate}`);
      
      // Create PDF-like HTML content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapport Comptable</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1a1a1a; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
            h2 { color: #4f46e5; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f3f4f6; font-weight: 600; }
            .total { font-weight: bold; background: #f0fdf4; }
            .profit { font-size: 24px; color: ${res.data.netProfit >= 0 ? '#16a34a' : '#dc2626'}; }
            .header-info { margin-bottom: 30px; color: #666; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Rapport Comptable</h1>
          <div class="header-info">
            <p><strong>Entreprise:</strong> ${res.data.company}</p>
            <p><strong>Période:</strong> Du ${new Date(res.data.period.start).toLocaleDateString('fr-FR')} au ${new Date(res.data.period.end).toLocaleDateString('fr-FR')}</p>
            <p><strong>Généré le:</strong> ${new Date(res.data.generatedAt).toLocaleDateString('fr-FR')}</p>
          </div>
          
          <h2>Revenus</h2>
          <table>
            <tr><th>Catégorie</th><th>Transactions</th><th>Montant</th></tr>
            ${res.data.revenues.items.map(r => `<tr><td>${r.category}</td><td>${r.count}</td><td>${r.total.toFixed(2)} TND</td></tr>`).join('')}
            <tr class="total"><td>TOTAL REVENUS</td><td></td><td>${res.data.revenues.total.toFixed(2)} TND</td></tr>
          </table>
          
          <h2>Dépenses</h2>
          <table>
            <tr><th>Catégorie</th><th>Transactions</th><th>Montant</th></tr>
            ${res.data.expenses.items.map(e => `<tr><td>${e.category}</td><td>${e.count}</td><td>${e.total.toFixed(2)} TND</td></tr>`).join('')}
            <tr class="total"><td>TOTAL DÉPENSES</td><td></td><td>${res.data.expenses.total.toFixed(2)} TND</td></tr>
          </table>
          
          <h2>Résultat</h2>
          <p class="profit">Bénéfice Net: ${res.data.netProfit.toFixed(2)} TND (Marge: ${res.data.profitMargin}%)</p>
          
          <div class="footer">
            <p>Document généré par StartUpLab - Module Comptabilité</p>
          </div>
        </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      
      toast.success('Rapport généré !');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounting/transactions?startDate=${startDate}&endDate=${endDate}`);
      
      // Convert to CSV
      const headers = ['Date', 'Type', 'Catégorie', 'Description', 'Montant', 'Mode de paiement', 'Référence'];
      const rows = res.data.transactions.map(t => [
        t.date,
        t.type === 'revenue' ? 'Revenu' : 'Dépense',
        t.category,
        t.description || '',
        t.amount,
        t.paymentMethod || '',
        t.reference || ''
      ]);
      
      const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Transactions_${startDate}_${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Export Excel téléchargé !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!accountantEmail) {
      toast.error('Veuillez entrer l\'email du comptable');
      return;
    }
    
    setSendingInvite(true);
    try {
      await api.post('/accounting/share/invite', {
        email: accountantEmail,
        name: accountantName,
        startDate,
        endDate
      });
      toast.success(`Invitation envoyée à ${accountantEmail} !`);
      setShowInviteModal(false);
      setAccountantEmail('');
      setAccountantName('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/comptabilite" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export & Partage</h1>
          <p className="text-gray-600">Exportez vos données pour votre expert-comptable</p>
        </div>
      </div>

      {/* Date Range */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Période d'export</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FEC Export */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Export FEC</h3>
              <p className="text-sm text-gray-500">Format standard comptable</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Fichier des Écritures Comptables au format standard. Compatible avec tous les logiciels de comptabilité.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Format légal français
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Compatible tous logiciels
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Audit trail complet
            </li>
          </ul>
          <button
            onClick={handleExportFEC}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger FEC
          </button>
        </div>

        {/* PDF Export */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Rapport PDF</h3>
              <p className="text-sm text-gray-500">Synthèse comptable</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Rapport de synthèse avec revenus, dépenses et bénéfice net. Idéal pour les réunions et présentations.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Synthèse par catégorie
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Calcul automatique
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Prêt à imprimer
            </li>
          </ul>
          <button
            onClick={handleExportSummary}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Générer PDF
          </button>
        </div>

        {/* Excel Export */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Export Excel</h3>
              <p className="text-sm text-gray-500">Données brutes</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Export CSV de toutes les transactions. Ouvrable avec Excel, Google Sheets ou LibreOffice.
          </p>
          <ul className="text-sm text-gray-500 space-y-1 mb-4">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Toutes les transactions
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Format CSV universel
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Modifiable
            </li>
          </ul>
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Télécharger Excel
          </button>
        </div>
      </div>

      {/* Share with Accountant */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Partager avec votre expert-comptable</h3>
            <p className="text-gray-600">Envoyez un accès sécurisé à votre comptable pour qu'il puisse consulter vos données</p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            Inviter
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Inviter un expert-comptable</h3>
                  <p className="text-sm text-gray-500">Envoi par email sécurisé</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du comptable (optionnel)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={accountantName}
                    onChange={(e) => setAccountantName(e.target.value)}
                    placeholder="M. Dupont"
                    className="input pl-10 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email du comptable *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={accountantEmail}
                    onChange={(e) => setAccountantEmail(e.target.value)}
                    placeholder="comptable@cabinet.com"
                    className="input pl-10 w-full"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Données partagées :</strong>
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Période : {new Date(startDate).toLocaleDateString('fr-FR')} - {new Date(endDate).toLocaleDateString('fr-FR')}</li>
                  <li>• Fichier FEC (écritures comptables)</li>
                  <li>• Rapport de synthèse (revenus/dépenses)</li>
                  <li>• Export des transactions</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={sendingInvite || !accountantEmail}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {sendingInvite ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingExport;
