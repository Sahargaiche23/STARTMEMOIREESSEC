import { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Edit2, Trash2, Eye, 
  FileText, Phone, Mail, MapPin, Calendar, Building2,
  DollarSign, X, Save, UserPlus, Download, Upload, Clock,
  Umbrella, Heart, History, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDocument, setNewDocument] = useState({ documentType: '', file: null });
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', cin: '', cnssNumber: '',
    address: '', birthDate: '', hireDate: '', position: '', department: '',
    contractType: 'CDI', workSchedule: 'full_time', baseSalary: '',
    transportAllowance: '', mealAllowance: '', otherAllowances: '',
    bankName: '', bankAccount: '', notes: '',
    annualLeave: 24, usedAnnualLeave: 0, sickLeave: 15, usedSickLeave: 0
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/hr/employees');
      setEmployees(res.data.employees || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/hr/employees/${editingEmployee.id}`, formData);
        // Also update leave balance
        await api.put(`/hr/employees/${editingEmployee.id}/leave-balance`, {
          annualLeave: formData.annualLeave,
          usedAnnualLeave: formData.usedAnnualLeave,
          sickLeave: formData.sickLeave,
          usedSickLeave: formData.usedSickLeave
        });
        toast.success('Employé mis à jour');
      } else {
        await api.post('/hr/employees', formData);
        toast.success('Employé créé avec succès');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer cet employé ?')) return;
    try {
      await api.delete(`/hr/employees/${id}`);
      toast.success('Employé supprimé');
      fetchEmployees();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleView = async (employee) => {
    try {
      // Fetch employee data
      const res = await api.get(`/hr/employees/${employee.id}`);
      // Also fetch history
      const historyRes = await api.get(`/hr/employees/${employee.id}/history`);
      setSelectedEmployee({
        ...res.data,
        history: historyRes.data.history
      });
      setShowViewModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    }
  };

  const handleEdit = async (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      cin: employee.cin || '',
      cnssNumber: employee.cnssNumber || '',
      address: employee.address || '',
      birthDate: employee.birthDate || '',
      hireDate: employee.hireDate || '',
      position: employee.position || '',
      department: employee.department || '',
      contractType: employee.contractType || 'CDI',
      workSchedule: employee.workSchedule || 'full_time',
      baseSalary: employee.baseSalary || '',
      transportAllowance: employee.transportAllowance || '',
      mealAllowance: employee.mealAllowance || '',
      otherAllowances: employee.otherAllowances || '',
      bankName: employee.bankName || '',
      bankAccount: employee.bankAccount || '',
      notes: employee.notes || '',
      annualLeave: 24, usedAnnualLeave: 0, sickLeave: 15, usedSickLeave: 0
    });
    // Fetch employee data including documents and leave balance
    try {
      const res = await api.get(`/hr/employees/${employee.id}`);
      setSelectedEmployee(res.data);
      if (res.data.leaveBalance) {
        setFormData(prev => ({
          ...prev,
          annualLeave: res.data.leaveBalance.annualLeave || 24,
          usedAnnualLeave: res.data.leaveBalance.usedAnnualLeave || 0,
          sickLeave: res.data.leaveBalance.sickLeave || 15,
          usedSickLeave: res.data.leaveBalance.usedSickLeave || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    }
    setActiveTab('info');
    setShowModal(true);
  };

  const fetchEmployeeLeaveBalance = async (employeeId) => {
    try {
      const res = await api.get(`/hr/employees/${employeeId}`);
      if (res.data.leaveBalance) {
        setFormData(prev => ({
          ...prev,
          annualLeave: res.data.leaveBalance.annualLeave || 24,
          usedAnnualLeave: res.data.leaveBalance.usedAnnualLeave || 0,
          sickLeave: res.data.leaveBalance.sickLeave || 15,
          usedSickLeave: res.data.leaveBalance.usedSickLeave || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', cin: '', cnssNumber: '',
      address: '', birthDate: '', hireDate: '', position: '', department: '',
      contractType: 'CDI', workSchedule: 'full_time', baseSalary: '',
      transportAllowance: '', mealAllowance: '', otherAllowances: '',
      bankName: '', bankAccount: '', notes: '',
      annualLeave: 24, usedAnnualLeave: 0, sickLeave: 15, usedSickLeave: 0
    });
    setActiveTab('info');
  };

  const handleDocumentUpload = async () => {
    if (!newDocument.file || !newDocument.documentType || !editingEmployee) {
      toast.error('Veuillez sélectionner un fichier et un type de document');
      return;
    }
    setUploadingDoc(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', newDocument.file);
      formDataUpload.append('documentType', newDocument.documentType);
      formDataUpload.append('employeeId', editingEmployee.id);
      
      await api.post('/hr/documents/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document ajouté avec succès');
      // Refresh employee data first, then reset form
      const res = await api.get(`/hr/employees/${editingEmployee.id}`);
      setSelectedEmployee(res.data);
      // Reset form after successful upload
      setNewDocument({ documentType: '', file: null });
      setFileInputKey(Date.now());
    } catch (error) {
      toast.error('Erreur lors de l\'upload du document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDocumentDownload = async (doc) => {
    try {
      const res = await api.get(`/hr/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.documentName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Supprimer ce document ?')) return;
    try {
      await api.delete(`/hr/documents/${docId}`);
      toast.success('Document supprimé');
      if (editingEmployee) {
        const res = await api.get(`/hr/employees/${editingEmployee.id}`);
        setSelectedEmployee(res.data);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDownloadEmployeePDF = (employeeData) => {
    const emp = employeeData.employee;
    const lb = employeeData.leaveBalance;
    const history = employeeData.history;
    
    // Create PDF content as HTML
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Fiche Employé - ${emp.firstName} ${emp.lastName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
    .header h1 { font-size: 28px; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 2px solid #3b82f6; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .field { background: #f8fafc; padding: 12px; border-radius: 8px; }
    .field-label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .field-value { font-size: 14px; font-weight: 500; }
    .salary { background: #dcfce7; }
    .salary .field-value { color: #15803d; font-size: 18px; }
    .leave-box { background: #f3e8ff; padding: 15px; border-radius: 8px; text-align: center; }
    .leave-title { font-size: 12px; color: #7c3aed; margin-bottom: 5px; }
    .leave-value { font-size: 20px; font-weight: bold; color: #5b21b6; }
    .history-item { background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .badge-green { background: #dcfce7; color: #15803d; }
    .badge-yellow { background: #fef3c7; color: #b45309; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${emp.firstName} ${emp.lastName}</h1>
    <p>${emp.position} ${emp.department ? '• ' + emp.department : ''}</p>
    <p style="margin-top: 10px;">${emp.contractType} • ${emp.workSchedule === 'full_time' ? 'Temps plein' : 'Temps partiel'}</p>
  </div>

  <div class="section">
    <div class="section-title">Informations personnelles</div>
    <div class="grid">
      <div class="field"><div class="field-label">Email</div><div class="field-value">${emp.email || '-'}</div></div>
      <div class="field"><div class="field-label">Téléphone</div><div class="field-value">${emp.phone || '-'}</div></div>
      <div class="field"><div class="field-label">CIN</div><div class="field-value">${emp.cin || '-'}</div></div>
      <div class="field"><div class="field-label">Date de naissance</div><div class="field-value">${emp.birthDate ? new Date(emp.birthDate).toLocaleDateString('fr-FR') : '-'}</div></div>
      <div class="field" style="grid-column: span 2;"><div class="field-label">Adresse</div><div class="field-value">${emp.address || '-'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Informations professionnelles</div>
    <div class="grid">
      <div class="field"><div class="field-label">Poste</div><div class="field-value">${emp.position}</div></div>
      <div class="field"><div class="field-label">Département</div><div class="field-value">${emp.department || '-'}</div></div>
      <div class="field"><div class="field-label">N° CNSS</div><div class="field-value">${emp.cnssNumber || '-'}</div></div>
      <div class="field"><div class="field-label">Date d'embauche</div><div class="field-value">${emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('fr-FR') : '-'}</div></div>
      <div class="field"><div class="field-label">Type de contrat</div><div class="field-value">${emp.contractType}</div></div>
      <div class="field"><div class="field-label">Temps de travail</div><div class="field-value">${emp.workSchedule === 'full_time' ? 'Temps plein' : 'Temps partiel'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Rémunération</div>
    <div class="grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="field salary"><div class="field-label">Salaire de base</div><div class="field-value">${Number(emp.baseSalary || 0).toLocaleString()} TND</div></div>
      <div class="field"><div class="field-label">Prime transport</div><div class="field-value">${Number(emp.transportAllowance || 0).toLocaleString()} TND</div></div>
      <div class="field"><div class="field-label">Prime repas</div><div class="field-value">${Number(emp.mealAllowance || 0).toLocaleString()} TND</div></div>
      <div class="field"><div class="field-label">Autres primes</div><div class="field-value">${Number(emp.otherAllowances || 0).toLocaleString()} TND</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Informations bancaires</div>
    <div class="grid-2">
      <div class="field"><div class="field-label">Banque</div><div class="field-value">${emp.bankName || '-'}</div></div>
      <div class="field"><div class="field-label">RIB</div><div class="field-value">${emp.bankAccount || '-'}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Solde de congés</div>
    <div class="grid-2">
      <div class="leave-box">
        <div class="leave-title">Congés annuels</div>
        <div class="leave-value">${lb ? lb.annualLeave - lb.usedAnnualLeave : 24} / ${lb ? lb.annualLeave : 24} jours</div>
      </div>
      <div class="leave-box" style="background: #fee2e2;">
        <div class="leave-title" style="color: #dc2626;">Congés maladie</div>
        <div class="leave-value" style="color: #b91c1c;">${lb ? lb.sickLeave - lb.usedSickLeave : 15} / ${lb ? lb.sickLeave : 15} jours</div>
      </div>
    </div>
  </div>

  ${history && (history.payslips?.length > 0 || history.leaves?.length > 0) ? `
  <div class="section">
    <div class="section-title">Historique</div>
    ${history.payslips?.slice(0, 5).map(p => `
      <div class="history-item">
        <div>
          <strong>Fiche de paie - ${p.period}</strong>
          <div style="font-size: 12px; color: #64748b;">Net: ${Number(p.netSalary).toLocaleString()} TND</div>
        </div>
        <span class="badge ${p.status === 'paid' ? 'badge-green' : 'badge-yellow'}">${p.status === 'paid' ? 'Payée' : 'En attente'}</span>
      </div>
    `).join('') || ''}
    ${history.leaves?.slice(0, 5).map(l => `
      <div class="history-item">
        <div>
          <strong>Congé ${l.leaveType === 'annual' ? 'annuel' : 'maladie'}</strong>
          <div style="font-size: 12px; color: #64748b;">${l.totalDays} jours - ${new Date(l.startDate).toLocaleDateString('fr-FR')}</div>
        </div>
        <span class="badge ${l.status === 'approved' ? 'badge-green' : 'badge-yellow'}">${l.status === 'approved' ? 'Approuvé' : l.status === 'rejected' ? 'Refusé' : 'En attente'}</span>
      </div>
    `).join('') || ''}
  </div>
  ` : ''}

  <div class="footer">
    <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    <p>StartUpLab - Gestion des Ressources Humaines</p>
  </div>
</body>
</html>
    `;

    // Open print dialog with the PDF content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    toast.success('Préparation du PDF...');
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName} ${emp.position}`.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || emp.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    onLeave: employees.filter(e => e.status === 'on_leave').length,
    inactive: employees.filter(e => e.status === 'inactive').length
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Employés</h1>
          <p className="text-gray-600">Gérez vos employés et leurs informations</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Nouvel Employé
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-sm text-blue-600">Total</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
              <p className="text-sm text-green-600">Actifs</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.onLeave}</p>
              <p className="text-sm text-orange-600">En congé</p>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{stats.inactive}</p>
              <p className="text-sm text-gray-600">Inactifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="on_leave">En congé</option>
            <option value="inactive">Inactifs</option>
          </select>
        </div>
      </div>

      {/* Employees List */}
      <div className="card">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun employé trouvé</p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Ajouter votre premier employé
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Employé</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Poste</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Département</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Salaire</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-sm text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{emp.position}</td>
                    <td className="py-4 px-4 text-gray-700">{emp.department || '-'}</td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-green-600">
                        {Number(emp.baseSalary).toLocaleString()} TND
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'active' ? 'bg-green-100 text-green-700' :
                        emp.status === 'on_leave' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {emp.status === 'active' ? 'Actif' : 
                         emp.status === 'on_leave' ? 'En congé' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(emp)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title="Voir fiche complète"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleView(emp)}
                          className="p-2 hover:bg-purple-100 rounded-lg text-purple-600"
                          title="Historique"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(emp)}
                          className="p-2 hover:bg-amber-100 rounded-lg text-amber-600"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CIN</label>
                    <input
                      type="text"
                      value={formData.cin}
                      onChange={(e) => setFormData({...formData, cin: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° CNSS</label>
                    <input
                      type="text"
                      value={formData.cnssNumber}
                      onChange={(e) => setFormData({...formData, cnssNumber: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Informations professionnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poste *</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche *</label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                    <select
                      value={formData.contractType}
                      onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                      className="input w-full"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="SIVP">SIVP</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temps de travail</label>
                    <select
                      value={formData.workSchedule}
                      onChange={(e) => setFormData({...formData, workSchedule: e.target.value})}
                      className="input w-full"
                    >
                      <option value="full_time">Temps plein</option>
                      <option value="part_time">Temps partiel</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Salary Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Rémunération</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salaire de base (TND) *</label>
                    <input
                      type="number"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({...formData, baseSalary: e.target.value})}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prime transport (TND)</label>
                    <input
                      type="number"
                      value={formData.transportAllowance}
                      onChange={(e) => setFormData({...formData, transportAllowance: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prime repas (TND)</label>
                    <input
                      type="number"
                      value={formData.mealAllowance}
                      onChange={(e) => setFormData({...formData, mealAllowance: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Autres primes (TND)</label>
                    <input
                      type="number"
                      value={formData.otherAllowances}
                      onChange={(e) => setFormData({...formData, otherAllowances: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Informations bancaires</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banque</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">RIB</label>
                    <input
                      type="text"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Leave Balance */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Umbrella className="w-5 h-5 text-purple-600" />
                  Solde de congés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Umbrella className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Congés annuels</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-blue-600 mb-1">Total jours</label>
                        <input
                          type="number"
                          value={formData.annualLeave}
                          onChange={(e) => setFormData({...formData, annualLeave: Number(e.target.value)})}
                          className="input w-full text-center"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-blue-600 mb-1">Jours utilisés</label>
                        <input
                          type="number"
                          value={formData.usedAnnualLeave}
                          onChange={(e) => setFormData({...formData, usedAnnualLeave: Number(e.target.value)})}
                          className="input w-full text-center"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm text-blue-700 font-semibold">
                        Restant: {formData.annualLeave - formData.usedAnnualLeave} jours
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Congés maladie</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-red-600 mb-1">Total jours</label>
                        <input
                          type="number"
                          value={formData.sickLeave}
                          onChange={(e) => setFormData({...formData, sickLeave: Number(e.target.value)})}
                          className="input w-full text-center"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-red-600 mb-1">Jours utilisés</label>
                        <input
                          type="number"
                          value={formData.usedSickLeave}
                          onChange={(e) => setFormData({...formData, usedSickLeave: Number(e.target.value)})}
                          className="input w-full text-center"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="text-sm text-red-700 font-semibold">
                        Restant: {formData.sickLeave - formData.usedSickLeave} jours
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section - Only show when editing */}
              {editingEmployee && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    Documents employé
                    <span className="text-xs text-gray-500 font-normal">Contrats, attestations et documents RH</span>
                  </h3>
                  
                  {/* Upload new document */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Ajouter un document</p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <select
                        value={newDocument.documentType}
                        onChange={(e) => setNewDocument({...newDocument, documentType: e.target.value})}
                        className="input flex-1"
                      >
                        <option value="">Type de document</option>
                        <option value="Contrat CDI">Contrat CDI</option>
                        <option value="Contrat CDD">Contrat CDD</option>
                        <option value="Avenant">Avenant au contrat</option>
                        <option value="Attestation de travail">Attestation de travail</option>
                        <option value="Certificat CNSS">Certificat CNSS</option>
                        <option value="Fiche de paie">Fiche de paie</option>
                        <option value="CIN">Copie CIN</option>
                        <option value="Diplôme">Diplôme</option>
                        <option value="CV">CV</option>
                        <option value="Autre">Autre document</option>
                      </select>
                      <input
                        type="file"
                        key={fileInputKey}
                        onChange={(e) => setNewDocument({...newDocument, file: e.target.files[0]})}
                        className="input flex-1"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <button
                        type="button"
                        onClick={handleDocumentUpload}
                        disabled={uploadingDoc || !newDocument.file || !newDocument.documentType}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                      >
                        {uploadingDoc ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5" />
                        )}
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Documents list */}
                  {selectedEmployee?.documents && selectedEmployee.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEmployee.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            doc.documentType?.includes('Contrat') ? 'bg-blue-100' :
                            doc.documentType?.includes('Fiche') ? 'bg-green-100' :
                            doc.documentType?.includes('CNSS') ? 'bg-orange-100' :
                            'bg-gray-100'
                          }`}>
                            <FileText className={`w-5 h-5 ${
                              doc.documentType?.includes('Contrat') ? 'text-blue-600' :
                              doc.documentType?.includes('Fiche') ? 'text-green-600' :
                              doc.documentType?.includes('CNSS') ? 'text-orange-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{doc.documentName}</p>
                            <p className="text-xs text-gray-500">
                              {doc.documentType} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDocumentDownload(doc)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                            title="Télécharger"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>Aucun document</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="input w-full"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  {editingEmployee ? 'Mettre à jour' : 'Créer l\'employé'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold">Fiche Employé Complète</h2>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start gap-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {selectedEmployee.employee.firstName?.[0]}{selectedEmployee.employee.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedEmployee.employee.firstName} {selectedEmployee.employee.lastName}
                  </h3>
                  <p className="text-lg text-gray-600">{selectedEmployee.employee.position}</p>
                  <p className="text-gray-500">{selectedEmployee.employee.department || 'Département non spécifié'}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {selectedEmployee.employee.contractType}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {selectedEmployee.employee.workSchedule === 'full_time' ? 'Temps plein' : 'Temps partiel'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedEmployee.employee.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      selectedEmployee.employee.status === 'on_leave' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedEmployee.employee.status === 'active' ? '● Actif' : 
                       selectedEmployee.employee.status === 'on_leave' ? '● En congé' : '● Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Informations personnelles
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.email || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Téléphone</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.phone || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">CIN</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.cin || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date de naissance</p>
                    <p className="font-medium text-gray-900">
                      {selectedEmployee.employee.birthDate ? new Date(selectedEmployee.employee.birthDate).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Adresse</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Informations professionnelles */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Informations professionnelles
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Poste</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.position}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Département</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.department || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">N° CNSS</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.cnssNumber || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date d'embauche</p>
                    <p className="font-medium text-gray-900">
                      {selectedEmployee.employee.hireDate ? new Date(selectedEmployee.employee.hireDate).toLocaleDateString('fr-FR') : '-'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Type de contrat</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.contractType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Temps de travail</p>
                    <p className="font-medium text-gray-900">
                      {selectedEmployee.employee.workSchedule === 'full_time' ? 'Temps plein' : 'Temps partiel'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rémunération */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Rémunération
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600 uppercase tracking-wide">Salaire de base</p>
                    <p className="font-bold text-green-700 text-lg">
                      {Number(selectedEmployee.employee.baseSalary || 0).toLocaleString()} TND
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Prime transport</p>
                    <p className="font-medium text-gray-900">
                      {Number(selectedEmployee.employee.transportAllowance || 0).toLocaleString()} TND
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Prime repas</p>
                    <p className="font-medium text-gray-900">
                      {Number(selectedEmployee.employee.mealAllowance || 0).toLocaleString()} TND
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Autres primes</p>
                    <p className="font-medium text-gray-900">
                      {Number(selectedEmployee.employee.otherAllowances || 0).toLocaleString()} TND
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations bancaires */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Informations bancaires
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Banque</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.employee.bankName || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">RIB</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedEmployee.employee.bankAccount || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Leave Balance */}
              <div className="bg-purple-50 p-4 rounded-xl">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Umbrella className="w-5 h-5" />
                  Solde de congés
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Umbrella className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Congés annuels</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                      {selectedEmployee.leaveBalance ? 
                        `${selectedEmployee.leaveBalance.annualLeave - selectedEmployee.leaveBalance.usedAnnualLeave} / ${selectedEmployee.leaveBalance.annualLeave}` 
                        : '24 / 24'} <span className="text-sm font-normal">jours</span>
                    </p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: selectedEmployee.leaveBalance ? 
                          `${(selectedEmployee.leaveBalance.usedAnnualLeave / selectedEmployee.leaveBalance.annualLeave) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Congés maladie</span>
                    </div>
                    <p className="text-2xl font-bold text-red-700">
                      {selectedEmployee.leaveBalance ? 
                        `${selectedEmployee.leaveBalance.sickLeave - selectedEmployee.leaveBalance.usedSickLeave} / ${selectedEmployee.leaveBalance.sickLeave}` 
                        : '15 / 15'} <span className="text-sm font-normal">jours</span>
                    </p>
                    <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: selectedEmployee.leaveBalance ? 
                          `${(selectedEmployee.leaveBalance.usedSickLeave / selectedEmployee.leaveBalance.sickLeave) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedEmployee.employee.notes && (
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">Notes</h4>
                  <p className="text-gray-700">{selectedEmployee.employee.notes}</p>
                </div>
              )}

              {/* Documents */}
              <div className="bg-indigo-50 p-4 rounded-xl">
                <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Documents employé
                  <span className="text-xs font-normal text-indigo-600">Contrats, attestations et documents RH</span>
                </h4>
                {selectedEmployee.documents && selectedEmployee.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmployee.documents.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.documentType?.includes('Contrat') ? 'bg-blue-100' :
                          doc.documentType?.includes('Fiche') ? 'bg-green-100' :
                          doc.documentType?.includes('CNSS') ? 'bg-orange-100' :
                          doc.documentType?.includes('Attestation') ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            doc.documentType?.includes('Contrat') ? 'text-blue-600' :
                            doc.documentType?.includes('Fiche') ? 'text-green-600' :
                            doc.documentType?.includes('CNSS') ? 'text-orange-600' :
                            doc.documentType?.includes('Attestation') ? 'text-purple-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{doc.documentName}</p>
                          <p className="text-xs text-gray-500">
                            {doc.documentType} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : ''}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDocumentDownload(doc)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-lg">
                    <FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Aucun document</p>
                  </div>
                )}
              </div>

              {/* Historique */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Historique des opérations
                </h4>
                {selectedEmployee.history && (
                  selectedEmployee.history.payslips?.length > 0 || 
                  selectedEmployee.history.leaves?.length > 0 ||
                  selectedEmployee.history.contracts?.length > 0
                ) ? (
                  <div className="space-y-3">
                    {/* Payslips */}
                    {selectedEmployee.history?.payslips?.map((p, i) => (
                      <div key={`pay-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Fiche de paie - {p.period}</p>
                          <p className="text-sm text-gray-500">Net: {Number(p.netSalary).toLocaleString()} TND</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {p.status === 'paid' ? '✓ Payée' : '⏳ En attente'}
                        </span>
                      </div>
                    ))}
                    {/* Leaves */}
                    {selectedEmployee.history?.leaves?.map((l, i) => (
                      <div key={`leave-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Umbrella className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            Congé {l.leaveType === 'annual' ? 'annuel' : l.leaveType === 'sick' ? 'maladie' : l.leaveType}
                          </p>
                          <p className="text-sm text-gray-500">
                            {l.totalDays} jours • {new Date(l.startDate).toLocaleDateString('fr-FR')} - {new Date(l.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          l.status === 'approved' ? 'bg-green-100 text-green-700' : 
                          l.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {l.status === 'approved' ? '✓ Approuvé' : l.status === 'rejected' ? '✗ Refusé' : '⏳ En attente'}
                        </span>
                      </div>
                    ))}
                    {/* Contracts */}
                    {selectedEmployee.history?.contracts?.map((c, i) => (
                      <div key={`contract-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{c.title}</p>
                          <p className="text-sm text-gray-500">
                            {c.contractType} • {new Date(c.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {c.status === 'signed' ? '✓ Signé' : 'Brouillon'}
                        </span>
                      </div>
                    ))}
                    {/* Documents */}
                    {selectedEmployee.history?.documents?.map((d, i) => (
                      <div key={`doc-${i}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FolderOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{d.documentName}</p>
                          <p className="text-sm text-gray-500">
                            {d.documentType} • {d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('fr-FR') : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg">
                    <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-500">Aucun historique disponible</p>
                    <p className="text-xs text-gray-400 mt-1">Les fiches de paie, congés et contrats apparaîtront ici</p>
                  </div>
                )}
              </div>

              {/* Download PDF Button */}
              <div className="flex justify-center pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDownloadEmployeePDF(selectedEmployee)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Télécharger la fiche complète (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
