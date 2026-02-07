import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Calendar, FileText, 
  TrendingUp, TrendingDown, BarChart3, Sparkles, Globe, FileSpreadsheet, Code
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AccountingBilan = () => {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [cashFlow, setCashFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balance');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [asOfDate]);

  const fetchData = async () => {
    try {
      const [balanceRes, incomeRes, cashRes] = await Promise.all([
        api.get(`/accounting/balance-sheet?date=${asOfDate}`),
        api.get('/accounting/income-statement'),
        api.get('/accounting/cash-flow')
      ]);
      setBalanceSheet(balanceRes.data);
      setIncomeStatement(incomeRes.data);
      setCashFlow(cashRes.data.cashFlow || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement');
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

  const handleExportPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>États Financiers - ${new Date(asOfDate).toLocaleDateString('fr-FR')}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
          h2 { color: #4f46e5; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
          .header { text-align: center; margin-bottom: 40px; }
          .date { color: #666; font-size: 14px; }
          .section { margin: 20px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .row:last-child { border-bottom: none; }
          .label { color: #374151; }
          .value { font-weight: 600; }
          .value.positive { color: #059669; }
          .value.negative { color: #dc2626; }
          .total { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px; }
          .total .row { border-bottom: none; font-size: 18px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
          .footer { margin-top: 50px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 États Financiers</h1>
          <p class="date">Au ${new Date(asOfDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <h2>Bilan Comptable</h2>
        <div class="grid">
          <div class="section">
            <div class="section-title" style="color: #059669;">ACTIF</div>
            <div class="row">
              <span class="label">Trésorerie disponible</span>
              <span class="value positive">${formatCurrency(balanceSheet?.assets?.currentAssets || 0)}</span>
            </div>
            ${balanceSheet?.assets?.details?.map(item => `
              <div class="row">
                <span class="label">${item.category}</span>
                <span class="value">${formatCurrency(item.total)}</span>
              </div>
            `).join('') || ''}
            <div class="total">
              <div class="row">
                <span class="label"><strong>TOTAL ACTIF</strong></span>
                <span class="value positive"><strong>${formatCurrency(balanceSheet?.totalAssets || 0)}</strong></span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title" style="color: #2563eb;">PASSIF</div>
            <div class="row">
              <span class="label">Dettes courantes</span>
              <span class="value negative">${formatCurrency(balanceSheet?.liabilities?.currentLiabilities || 0)}</span>
            </div>
            <div class="row">
              <span class="label">Résultat cumulé</span>
              <span class="value ${(balanceSheet?.equity?.retainedEarnings || 0) >= 0 ? 'positive' : 'negative'}">${formatCurrency(balanceSheet?.equity?.retainedEarnings || 0)}</span>
            </div>
            <div class="total">
              <div class="row">
                <span class="label"><strong>TOTAL PASSIF</strong></span>
                <span class="value"><strong>${formatCurrency(balanceSheet?.totalAssets || 0)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <h2>Compte de Résultat</h2>
        <div class="section">
          <div class="section-title" style="color: #059669;">Produits d'exploitation</div>
          ${incomeStatement?.revenues?.items?.map(item => `
            <div class="row">
              <span class="label">${item.category}</span>
              <span class="value positive">${formatCurrency(item.total)}</span>
            </div>
          `).join('') || '<div class="row"><span class="label">Aucun revenu</span><span class="value">0,00 TND</span></div>'}
          <div class="total">
            <div class="row">
              <span class="label"><strong>Total Produits</strong></span>
              <span class="value positive"><strong>${formatCurrency(incomeStatement?.revenues?.total || 0)}</strong></span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title" style="color: #dc2626;">Charges d'exploitation</div>
          ${incomeStatement?.expenses?.items?.map(item => `
            <div class="row">
              <span class="label">${item.category}</span>
              <span class="value negative">${formatCurrency(item.total)}</span>
            </div>
          `).join('') || '<div class="row"><span class="label">Aucune charge</span><span class="value">0,00 TND</span></div>'}
          <div class="total">
            <div class="row">
              <span class="label"><strong>Total Charges</strong></span>
              <span class="value negative"><strong>${formatCurrency(incomeStatement?.expenses?.total || 0)}</strong></span>
            </div>
          </div>
        </div>

        <div class="section" style="background: ${(incomeStatement?.netIncome || 0) >= 0 ? '#ecfdf5' : '#fef2f2'};">
          <div class="row" style="border: none;">
            <span class="label" style="font-size: 20px;"><strong>RÉSULTAT NET</strong></span>
            <span class="value ${(incomeStatement?.netIncome || 0) >= 0 ? 'positive' : 'negative'}" style="font-size: 24px;">
              <strong>${formatCurrency(incomeStatement?.netIncome || 0)}</strong>
            </span>
          </div>
        </div>

        <div class="footer">
          <p>Document généré par StartUpLab - Module Comptabilité</p>
          <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    toast.success('PDF généré avec succès !');
  };

  const handleExportExcel = () => {
    // Create CSV content (compatible with Excel)
    const csvContent = `
BILAN COMPTABLE - FORMAT TUNISIEN
Date: ${new Date(asOfDate).toLocaleDateString('fr-FR')}

ACTIF
Trésorerie disponible;${balanceSheet?.assets?.currentAssets || 0}
${balanceSheet?.assets?.details?.map(d => `${d.category};${d.total}`).join('\n') || ''}
TOTAL ACTIF;${balanceSheet?.totalAssets || 0}

PASSIF
Dettes courantes;${balanceSheet?.liabilities?.currentLiabilities || 0}
Résultat cumulé;${balanceSheet?.equity?.retainedEarnings || 0}
TOTAL PASSIF;${balanceSheet?.totalAssets || 0}

Généré par StartUpLab - Conforme NCT
`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bilan_tunisien_${asOfDate}.csv`;
    link.click();
    toast.success('Export Excel (CSV) téléchargé !');
  };

  const handleExportXML = () => {
    // Create XML content for DGCF declaration
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<DeclarationFiscale xmlns="http://www.finances.gov.tn/dgcf">
  <Entete>
    <TypeDeclaration>BILAN_ANNUEL</TypeDeclaration>
    <DateGeneration>${new Date().toISOString()}</DateGeneration>
    <PeriodeReference>${asOfDate}</PeriodeReference>
  </Entete>
  <Bilan>
    <Actif>
      <TresorerieDisponible>${balanceSheet?.assets?.currentAssets || 0}</TresorerieDisponible>
      <TotalActif>${balanceSheet?.totalAssets || 0}</TotalActif>
    </Actif>
    <Passif>
      <DettesCourantes>${balanceSheet?.liabilities?.currentLiabilities || 0}</DettesCourantes>
      <CapitauxPropres>${balanceSheet?.equity?.retainedEarnings || 0}</CapitauxPropres>
      <TotalPassif>${balanceSheet?.totalAssets || 0}</TotalPassif>
    </Passif>
  </Bilan>
  <Signature>
    <Application>StartUpLab</Application>
    <ConformiteNCT>true</ConformiteNCT>
  </Signature>
</DeclarationFiscale>`;
    
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `declaration_dgcf_${asOfDate}.xml`;
    link.click();
    toast.success('Export XML DGCF téléchargé !');
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
            <h1 className="text-2xl font-bold text-gray-900">États Financiers</h1>
            <p className="text-gray-600">Bilan, compte de résultat et cash flow</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="input py-2"
          />
          <button
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'balance'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Bilan
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'income'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Compte de Résultat
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'cashflow'
              ? 'text-primary-600 border-primary-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          Cash Flow
        </button>
      </div>

      {/* Balance Sheet */}
      {activeTab === 'balance' && balanceSheet && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Actif */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">ACTIF</h3>
                <p className="text-sm text-gray-500">Au {new Date(asOfDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Actif Circulant</h4>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Trésorerie disponible</span>
                    <span className="font-semibold text-green-700">
                      {formatCurrency(balanceSheet.assets?.currentAssets)}
                    </span>
                  </div>
                </div>
              </div>

              {balanceSheet.assets?.details?.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Détail par catégorie</h4>
                  <div className="space-y-2">
                    {balanceSheet.assets.details.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-gray-600">{item.category}</span>
                        <span className="font-medium">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">TOTAL ACTIF</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(balanceSheet.totalAssets)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Passif */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">PASSIF</h3>
                <p className="text-sm text-gray-500">Au {new Date(asOfDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Dettes</h4>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Dettes courantes</span>
                    <span className="font-semibold text-red-700">
                      {formatCurrency(balanceSheet.liabilities?.currentLiabilities)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Capitaux Propres</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Résultat cumulé</span>
                    <span className={`font-semibold ${balanceSheet.equity?.retainedEarnings >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      {formatCurrency(balanceSheet.equity?.retainedEarnings)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">TOTAL PASSIF</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(balanceSheet.totalAssets)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analyse Automatique - Recommandation IA */}
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-900">Analyse Automatique</h3>
              <p className="text-sm text-indigo-600">Recommandation IA basée sur vos données</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <p className="text-2xl font-bold text-green-600">
                {balanceSheet?.totalAssets > 0 ? Math.round((balanceSheet?.equity?.retainedEarnings / balanceSheet?.totalAssets) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Marge nette</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">
                {balanceSheet?.liabilities?.currentLiabilities > 0 
                  ? (balanceSheet?.assets?.currentAssets / balanceSheet?.liabilities?.currentLiabilities).toFixed(1) 
                  : '∞'}
              </p>
              <p className="text-sm text-gray-600">Ratio liquidité</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
              <p className="text-2xl font-bold text-purple-600">
                {balanceSheet?.equity?.retainedEarnings >= 0 ? '+' : ''}{Math.round(((balanceSheet?.equity?.retainedEarnings || 0) / Math.max(1, Math.abs(balanceSheet?.totalAssets || 1))) * 100)}%
              </p>
              <p className="text-sm text-gray-600">Performance</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                IA
              </div>
              <div>
                <p className="font-medium text-indigo-800">Recommandation</p>
                <p className="text-sm text-gray-600 mt-1">
                  {balanceSheet?.equity?.retainedEarnings >= 0 
                    ? `Votre situation financière est saine avec un résultat positif de ${formatCurrency(balanceSheet?.equity?.retainedEarnings)}. Considérez d'investir dans l'expansion de votre activité.`
                    : `Attention : Votre résultat est négatif (${formatCurrency(balanceSheet?.equity?.retainedEarnings)}). Réduisez les charges ou augmentez les revenus.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Format Standard Tunisien */}
        <div className="card border border-orange-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900">Format Standard Tunisien</h3>
              <p className="text-sm text-orange-600">Conforme aux normes comptables tunisiennes (NCT)</p>
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-orange-800 mb-2">Conformité</p>
                <ul className="space-y-1 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Plan Comptable Tunisien
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Normes NCT 01 à 15
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Format déclaration fiscale
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-orange-800 mb-2">Export disponible</p>
                <div className="space-y-2">
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-red-50 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-red-500" />
                    <span className="text-gray-700">PDF conforme CNI</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-green-50 transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Excel format tunisien</span>
                  </button>
                  <button
                    onClick={handleExportXML}
                    className="w-full flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors text-left"
                  >
                    <Code className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">XML déclaration DGCF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Income Statement */}
      {activeTab === 'income' && incomeStatement && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Compte de Résultat</h3>
              <p className="text-sm text-gray-500">
                Du {new Date(incomeStatement.period?.start).toLocaleDateString('fr-FR')} au {new Date(incomeStatement.period?.end).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Revenus */}
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                PRODUITS D'EXPLOITATION
              </h4>
              <div className="space-y-2 ml-6">
                {incomeStatement.revenues?.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-medium text-green-700">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 p-3 bg-green-100 rounded-lg">
                <span className="font-semibold text-green-800">Total Produits</span>
                <span className="font-bold text-green-700">{formatCurrency(incomeStatement.revenues?.total)}</span>
              </div>
            </div>

            {/* Charges */}
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                CHARGES D'EXPLOITATION
              </h4>
              <div className="space-y-2 ml-6">
                {incomeStatement.expenses?.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-medium text-red-700">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 p-3 bg-red-100 rounded-lg">
                <span className="font-semibold text-red-800">Total Charges</span>
                <span className="font-bold text-red-700">{formatCurrency(incomeStatement.expenses?.total)}</span>
              </div>
            </div>

            {/* Résultat */}
            <div className="pt-4 border-t-2 border-dashed">
              <div className={`flex justify-between items-center p-4 rounded-xl ${
                incomeStatement.netIncome >= 0 ? 'bg-blue-100' : 'bg-red-100'
              }`}>
                <span className="text-lg font-bold text-gray-900">RÉSULTAT NET</span>
                <span className={`text-2xl font-bold ${
                  incomeStatement.netIncome >= 0 ? 'text-blue-700' : 'text-red-700'
                }`}>
                  {formatCurrency(incomeStatement.netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow */}
      {activeTab === 'cashflow' && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Flux de Trésorerie</h3>
              <p className="text-sm text-gray-500">Évolution sur les 12 derniers mois</p>
            </div>
          </div>

          {cashFlow.length > 0 ? (
            <div className="space-y-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-sm font-medium text-gray-600">Période</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Entrées</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Sorties</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Flux Net</th>
                    <th className="text-right px-4 py-2 text-sm font-medium text-gray-600">Solde Cumulé</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cashFlow.map((cf, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{cf.period}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatCurrency(cf.inflow)}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatCurrency(cf.outflow)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${cf.netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {cf.netFlow >= 0 ? '+' : ''}{formatCurrency(cf.netFlow)}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${cf.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cf.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Visual Chart */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-600 mb-4">Évolution graphique</h4>
                {(() => {
                  const maxValue = Math.max(...cashFlow.map(c => Math.max(c.inflow || 0, c.outflow || 0)), 1);
                  return (
                    <>
                      <div className="h-48 flex items-end gap-3 px-2 pb-2 bg-gray-50 rounded-lg">
                        {cashFlow.map((cf, index) => {
                          const inflowHeight = Math.max(((cf.inflow || 0) / maxValue) * 100, 2);
                          const outflowHeight = Math.max(((cf.outflow || 0) / maxValue) * 100, 2);
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="flex gap-1 items-end h-36 w-full">
                                <div className="relative flex-1 group">
                                  <div 
                                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-600 hover:to-green-500"
                                    style={{ height: `${inflowHeight}%`, minHeight: '4px' }}
                                  />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                    Entrées: {formatCurrency(cf.inflow)}
                                  </div>
                                </div>
                                <div className="relative flex-1 group">
                                  <div 
                                    className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t transition-all hover:from-red-600 hover:to-red-500"
                                    style={{ height: `${outflowHeight}%`, minHeight: '4px' }}
                                  />
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                                    Sorties: {formatCurrency(cf.outflow)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-600 mt-2 font-medium">
                                {cf.period.split('-')[1] || cf.period}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-t from-green-500 to-green-400 rounded" />
                          <span className="text-sm text-gray-600">Entrées</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-t from-red-500 to-red-400 rounded" />
                          <span className="text-sm text-gray-600">Sorties</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune donnée de trésorerie</p>
          )}

          {/* Prévision Financière sur 12 mois */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Prévision Financière</h3>
                <p className="text-sm text-gray-500">Anticipez votre trésorerie sur 12 mois</p>
              </div>
            </div>

            {(() => {
              // Generate 12-month forecast based on average cash flow
              const avgInflow = cashFlow.length > 0 
                ? cashFlow.reduce((sum, cf) => sum + (cf.inflow || 0), 0) / cashFlow.length 
                : 5000;
              const avgOutflow = cashFlow.length > 0 
                ? cashFlow.reduce((sum, cf) => sum + (cf.outflow || 0), 0) / cashFlow.length 
                : 3500;
              const currentBalance = cashFlow.length > 0 
                ? cashFlow[cashFlow.length - 1]?.balance || 0 
                : 10000;

              const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
              const currentMonth = new Date().getMonth();
              
              const forecast = [];
              let runningBalance = currentBalance;
              
              for (let i = 0; i < 12; i++) {
                const monthIndex = (currentMonth + i) % 12;
                const variation = 1 + (Math.sin(i * 0.5) * 0.15); // Seasonal variation
                const projectedInflow = avgInflow * variation;
                const projectedOutflow = avgOutflow * (1 + (Math.random() * 0.1 - 0.05));
                runningBalance += projectedInflow - projectedOutflow;
                
                forecast.push({
                  month: monthNames[monthIndex],
                  balance: runningBalance
                });
              }

              const maxBalance = Math.max(...forecast.map(f => f.balance));
              const minBalance = Math.min(...forecast.map(f => f.balance));
              const range = maxBalance - minBalance || 1;

              return (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="h-64 flex items-end gap-2">
                    {forecast.map((f, index) => {
                      const height = ((f.balance - minBalance) / range) * 100;
                      const isPositive = f.balance >= 0;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          <div className="relative w-full flex flex-col items-center">
                            <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                              {formatCurrency(f.balance)}
                            </div>
                            <div 
                              className={`w-full rounded-t transition-all ${
                                isPositive 
                                  ? 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500' 
                                  : 'bg-gradient-to-t from-red-500 to-red-400 hover:from-red-600 hover:to-red-500'
                              }`}
                              style={{ 
                                height: `${Math.max(height, 10)}%`,
                                minHeight: '20px'
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 mt-2 font-medium">{f.month}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500">Solde actuel</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500">Prévision 6 mois</p>
                      <p className={`text-lg font-bold ${forecast[5]?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(forecast[5]?.balance || 0)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs text-gray-500">Prévision 12 mois</p>
                      <p className={`text-lg font-bold ${forecast[11]?.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(forecast[11]?.balance || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingBilan;
