import { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Users, DollarSign, 
  Calculator, RefreshCw, Check, Clock, Filter, Eye, X,
  TrendingUp, Printer
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      const [payslipsRes, employeesRes, summaryRes] = await Promise.all([
        api.get(`/hr/payslips?year=${selectedYear}&month=${selectedMonth}`),
        api.get('/hr/employees'),
        api.get(`/hr/payslips/summary?year=${selectedYear}&month=${selectedMonth}`)
      ]);
      setPayslips(payslipsRes.data.payslips || []);
      setEmployees(employeesRes.data.employees || []);
      setSummary(summaryRes.data.summary);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/hr/payslips/generate-all', {
        year: selectedYear,
        month: selectedMonth
      });
      toast.success(res.data.message);
      fetchData();
      setShowGenerateModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await api.post(`/hr/payslips/${id}/pay`);
      toast.success('Fiche de paie marquée comme payée');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const viewPayslip = (payslip) => {
    setSelectedPayslip(payslip);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString('fr-TN', { minimumFractionDigits: 2 });
  };

  const handlePrintPayslip = (payslip) => {
    const printContent = generatePayslipHTML(payslip);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleDownloadPayslipPDF = (payslip) => {
    const printContent = generatePayslipHTML(payslip);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
    toast.success('Préparation du PDF...');
  };

  const generatePayslipHTML = (payslip) => {
    const totalDeductions = Number(payslip.cnssEmployee || 0) + Number(payslip.irpp || 0) + Number(payslip.otherDeductions || 0);
    const monthName = months[payslip.month - 1] || '';
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bulletin de Paie - ${payslip.firstName} ${payslip.lastName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; max-width: 800px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
    .company-name { font-size: 24px; font-weight: bold; }
    .document-title { font-size: 18px; font-weight: bold; background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; }
    .period { font-size: 14px; opacity: 0.9; margin-top: 5px; }
    .employee-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; padding: 20px; background: #f8fafc; border-radius: 12px; }
    .info-group { }
    .info-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 14px; font-weight: 600; color: #1e293b; }
    .section { margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .section-header { background: #f1f5f9; padding: 12px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
    .section-header.gains { background: #dcfce7; color: #166534; }
    .section-header.deductions { background: #fee2e2; color: #991b1b; }
    .section-content { padding: 16px; }
    .line-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .line-item:last-child { border-bottom: none; }
    .line-item.total { border-top: 2px solid #e2e8f0; padding-top: 12px; margin-top: 8px; font-weight: bold; }
    .amount { font-weight: 600; }
    .amount.positive { color: #166534; }
    .amount.negative { color: #dc2626; }
    .net-section { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 20px; border-radius: 12px; margin: 25px 0; }
    .net-section .label { font-size: 14px; opacity: 0.9; }
    .net-section .amount { font-size: 32px; font-weight: bold; }
    .employer-charges { background: #fef3c7; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
    .employer-charges-title { font-weight: 600; color: #92400e; margin-bottom: 8px; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 30px; }
    @media print { 
      body { padding: 15px; } 
      .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .net-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-top">
      <div>
        <div class="company-name">StartUpLab SARL</div>
        <div class="period">Période: ${monthName} ${payslip.year}</div>
      </div>
      <div class="document-title">BULLETIN DE PAIE</div>
    </div>
  </div>

  <div class="employee-info">
    <div class="info-group">
      <div class="info-label">Employé</div>
      <div class="info-value">${payslip.firstName} ${payslip.lastName}</div>
    </div>
    <div class="info-group">
      <div class="info-label">Poste</div>
      <div class="info-value">${payslip.position || '-'}</div>
    </div>
    <div class="info-group">
      <div class="info-label">N° CNSS</div>
      <div class="info-value">${payslip.cnssNumber || '-'}</div>
    </div>
    <div class="info-group">
      <div class="info-label">CIN</div>
      <div class="info-value">${payslip.cin || '-'}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-header gains">💰 GAINS</div>
    <div class="section-content">
      <div class="line-item">
        <span>Salaire de base</span>
        <span class="amount positive">${formatCurrency(payslip.baseSalary)} TND</span>
      </div>
      ${payslip.transportAllowance > 0 ? `
      <div class="line-item">
        <span>Prime de transport</span>
        <span class="amount positive">${formatCurrency(payslip.transportAllowance)} TND</span>
      </div>
      ` : ''}
      ${payslip.mealAllowance > 0 ? `
      <div class="line-item">
        <span>Prime de repas</span>
        <span class="amount positive">${formatCurrency(payslip.mealAllowance)} TND</span>
      </div>
      ` : ''}
      ${payslip.bonus > 0 ? `
      <div class="line-item">
        <span>Prime / Bonus</span>
        <span class="amount positive">${formatCurrency(payslip.bonus)} TND</span>
      </div>
      ` : ''}
      ${payslip.otherAllowances > 0 ? `
      <div class="line-item">
        <span>Autres primes</span>
        <span class="amount positive">${formatCurrency(payslip.otherAllowances)} TND</span>
      </div>
      ` : ''}
      <div class="line-item total">
        <span>SALAIRE BRUT</span>
        <span class="amount positive">${formatCurrency(payslip.grossSalary)} TND</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-header deductions">📉 RETENUES</div>
    <div class="section-content">
      <div class="line-item">
        <span>CNSS salarié (9.18%)</span>
        <span class="amount negative">-${formatCurrency(payslip.cnssEmployee)} TND</span>
      </div>
      <div class="line-item">
        <span>IRPP (Impôt sur le revenu)</span>
        <span class="amount negative">-${formatCurrency(payslip.irpp)} TND</span>
      </div>
      ${payslip.otherDeductions > 0 ? `
      <div class="line-item">
        <span>Autres retenues</span>
        <span class="amount negative">-${formatCurrency(payslip.otherDeductions)} TND</span>
      </div>
      ` : ''}
      <div class="line-item total">
        <span>TOTAL RETENUES</span>
        <span class="amount negative">-${formatCurrency(totalDeductions)} TND</span>
      </div>
    </div>
  </div>

  <div class="net-section">
    <div class="label">SALAIRE NET À PAYER</div>
    <div class="amount">${formatCurrency(payslip.netSalary)} TND</div>
  </div>

  <div class="employer-charges">
    <div class="employer-charges-title">Charges patronales</div>
    <div class="line-item">
      <span>CNSS employeur (16.57%)</span>
      <span class="amount">${formatCurrency(payslip.cnssEmployer)} TND</span>
    </div>
  </div>

  <div class="footer">
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    <p>StartUpLab SARL - Gestion des Ressources Humaines</p>
    <p style="margin-top: 10px; font-size: 10px;">Ce bulletin de paie est conforme à la législation tunisienne en vigueur</p>
  </div>
</body>
</html>
    `;
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
          <h1 className="text-2xl font-bold text-gray-900">Fiches de Paie</h1>
          <p className="text-gray-600">Génération automatique avec calcul CNSS et IRPP</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Générer les fiches
        </button>
      </div>

      {/* Period Selector */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Période :</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="input w-48"
          >
            {months.map((month, i) => (
              <option key={i} value={i + 1}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input w-32"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{summary.totalPayslips || 0}</p>
                <p className="text-sm text-blue-600">Fiches générées</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-700">{formatCurrency(summary.totalGross)}</p>
                <p className="text-sm text-green-600">Masse salariale brute</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-orange-700">
                  {formatCurrency((summary.totalCnssEmployee || 0) + (summary.totalCnssEmployer || 0))}
                </p>
                <p className="text-sm text-orange-600">Total CNSS</p>
              </div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-purple-700">{formatCurrency(summary.totalNet)}</p>
                <p className="text-sm text-purple-600">Total Net à payer</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslips List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Fiches de paie - {months[selectedMonth - 1]} {selectedYear}
        </h2>
        
        {payslips.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune fiche de paie pour cette période</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Générer les fiches de paie
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employé</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Brut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">CNSS</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">IRPP</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Net</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((payslip) => (
                  <tr key={payslip.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {payslip.firstName?.[0]}{payslip.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">{payslip.firstName} {payslip.lastName}</p>
                          <p className="text-sm text-gray-500">{payslip.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">
                      {formatCurrency(payslip.grossSalary)} TND
                    </td>
                    <td className="py-4 px-4 text-right text-orange-600">
                      -{formatCurrency(payslip.cnssEmployee)} TND
                    </td>
                    <td className="py-4 px-4 text-right text-red-600">
                      -{formatCurrency(payslip.irpp)} TND
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-green-600">
                      {formatCurrency(payslip.netSalary)} TND
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payslip.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payslip.status === 'paid' ? '✓ Payée' : '⏳ En attente'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewPayslip(payslip)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPayslipPDF(payslip)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {payslip.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkPaid(payslip.id)}
                            className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                            title="Marquer comme payée"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Générer les fiches de paie</h2>
              <p className="text-gray-600">
                {months[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <h3 className="font-medium text-blue-800 mb-2">Calculs automatiques</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• CNSS salarié : 9.18% du brut</li>
                  <li>• CNSS patronal : 16.57% du brut</li>
                  <li>• IRPP selon barème tunisien 2024</li>
                </ul>
              </div>
              <p className="text-gray-600 mb-4">
                <strong>{employees.filter(e => e.status === 'active').length}</strong> employés actifs seront traités.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerateAll}
                  disabled={generating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      Générer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Fiche de Paie</h2>
                <p className="text-gray-600">
                  {selectedPayslip.firstName} {selectedPayslip.lastName} - {months[selectedPayslip.month - 1]} {selectedPayslip.year}
                </p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Gains */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-green-800 mb-3">Gains</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Salaire de base</span>
                    <span className="font-medium">{formatCurrency(selectedPayslip.baseSalary)} TND</span>
                  </div>
                  {selectedPayslip.transportAllowance > 0 && (
                    <div className="flex justify-between">
                      <span>Prime de transport</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.transportAllowance)} TND</span>
                    </div>
                  )}
                  {selectedPayslip.mealAllowance > 0 && (
                    <div className="flex justify-between">
                      <span>Prime de repas</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.mealAllowance)} TND</span>
                    </div>
                  )}
                  {selectedPayslip.bonus > 0 && (
                    <div className="flex justify-between">
                      <span>Prime/Bonus</span>
                      <span className="font-medium">{formatCurrency(selectedPayslip.bonus)} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-green-200 font-bold">
                    <span>Salaire Brut</span>
                    <span className="text-green-700">{formatCurrency(selectedPayslip.grossSalary)} TND</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="bg-red-50 p-4 rounded-xl">
                <h3 className="font-semibold text-red-800 mb-3">Retenues</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>CNSS salarié (9.18%)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.cnssEmployee)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IRPP</span>
                    <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.irpp)} TND</span>
                  </div>
                  {selectedPayslip.otherDeductions > 0 && (
                    <div className="flex justify-between">
                      <span>Autres retenues</span>
                      <span className="font-medium text-red-600">-{formatCurrency(selectedPayslip.otherDeductions)} TND</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-red-200 font-bold">
                    <span>Total Retenues</span>
                    <span className="text-red-700">
                      -{formatCurrency(Number(selectedPayslip.cnssEmployee) + Number(selectedPayslip.irpp) + Number(selectedPayslip.otherDeductions || 0))} TND
                    </span>
                  </div>
                </div>
              </div>

              {/* Net */}
              <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-300">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-800">Salaire Net à Payer</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedPayslip.netSalary)} TND</span>
                </div>
              </div>

              {/* Employer Charges */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-700 mb-2">Charges patronales</h3>
                <div className="flex justify-between text-sm">
                  <span>CNSS employeur (16.57%)</span>
                  <span className="font-medium">{formatCurrency(selectedPayslip.cnssEmployer)} TND</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => handlePrintPayslip(selectedPayslip)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Imprimer
                </button>
                <button 
                  onClick={() => handleDownloadPayslipPDF(selectedPayslip)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payslips;
