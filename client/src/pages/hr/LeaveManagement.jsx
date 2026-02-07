import { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Check, X, Clock, Users, 
  Filter, Search, AlertTriangle, Umbrella, Heart, Baby
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const leaveTypes = [
    { value: 'annual', label: 'Congé annuel', icon: Umbrella, color: 'blue' },
    { value: 'sick', label: 'Congé maladie', icon: Heart, color: 'red' },
    { value: 'maternity', label: 'Congé maternité', icon: Baby, color: 'pink' },
    { value: 'unpaid', label: 'Congé sans solde', icon: Calendar, color: 'gray' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesRes, balancesRes, employeesRes] = await Promise.all([
        api.get('/hr/leaves'),
        api.get('/hr/leaves/balances'),
        api.get('/hr/employees')
      ]);
      setLeaves(leavesRes.data.leaves || []);
      setBalances(balancesRes.data.balances || []);
      setEmployees(employeesRes.data.employees?.filter(e => e.status === 'active') || []);
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/leaves', formData);
      toast.success('Demande de congé créée');
      setShowModal(false);
      setFormData({ employeeId: '', leaveType: 'annual', startDate: '', endDate: '', reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/hr/leaves/${id}/approve`);
      toast.success('Congé approuvé');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Raison du refus:');
    if (!reason) return;
    try {
      await api.post(`/hr/leaves/${id}/reject`, { reason });
      toast.success('Demande refusée');
      fetchData();
    } catch (error) {
      toast.error('Erreur');
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus === 'all') return true;
    return leave.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Approuvé</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><X className="w-3 h-3" /> Refusé</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>;
    }
  };

  const getLeaveTypeInfo = (type) => {
    return leaveTypes.find(t => t.value === type) || leaveTypes[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Congés</h1>
          <p className="text-gray-600">Demandes et suivi des congés employés</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouvelle demande
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => { setActiveTab('requests'); setFilterStatus('pending'); }}
          className={`card cursor-pointer transition-all ${filterStatus === 'pending' ? 'ring-2 ring-yellow-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => { setActiveTab('requests'); setFilterStatus('approved'); }}
          className={`card cursor-pointer transition-all ${filterStatus === 'approved' ? 'ring-2 ring-green-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">
                {leaves.filter(l => l.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approuvés</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => { setActiveTab('requests'); setFilterStatus('rejected'); }}
          className={`card cursor-pointer transition-all ${filterStatus === 'rejected' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">
                {leaves.filter(l => l.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Refusés</p>
            </div>
          </div>
        </div>
        <div 
          onClick={() => { setActiveTab('balances'); setFilterStatus('all'); }}
          className={`card cursor-pointer transition-all ${activeTab === 'balances' ? 'ring-2 ring-purple-500' : 'hover:shadow-md'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-700">{balances.length}</p>
              <p className="text-sm text-gray-600">Soldes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('requests'); setFilterStatus('all'); }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'requests' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Demandes de congés
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'balances' 
              ? 'border-primary-600 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Soldes par employé
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Demandes de congés</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-40"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Refusés</option>
            </select>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune demande de congé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeaves.map((leave) => {
                const typeInfo = getLeaveTypeInfo(leave.leaveType);
                const TypeIcon = typeInfo.icon;
                return (
                  <div key={leave.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-${typeInfo.color}-100 rounded-xl flex items-center justify-center`}>
                          <TypeIcon className={`w-6 h-6 text-${typeInfo.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {leave.firstName} {leave.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{leave.position}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="font-medium text-purple-600">{typeInfo.label}</span>
                            <span className="text-gray-500">
                              {new Date(leave.startDate).toLocaleDateString('fr-FR')} - {new Date(leave.endDate).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                              {leave.totalDays} jours
                            </span>
                          </div>
                          {leave.reason && (
                            <p className="text-sm text-gray-600 mt-2">"{leave.reason}"</p>
                          )}
                          {leave.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded">
                              Raison du refus: {leave.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(leave.status)}
                        {leave.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-600"
                              title="Approuver"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600"
                              title="Refuser"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Soldes de congés {new Date().getFullYear()}</h2>
          
          {balances.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun solde de congés</p>
            </div>
          ) : (
            <div className="space-y-4">
              {balances.map((balance) => {
                const annualRemaining = balance.annualLeave - balance.usedAnnualLeave;
                const sickRemaining = balance.sickLeave - balance.usedSickLeave;
                const annualPercent = (balance.usedAnnualLeave / balance.annualLeave) * 100;
                const sickPercent = (balance.usedSickLeave / balance.sickLeave) * 100;
                
                return (
                  <div key={balance.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {balance.firstName?.[0]}{balance.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{balance.firstName} {balance.lastName}</p>
                        <p className="text-sm text-gray-500">{balance.position}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Annual Leave */}
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-blue-800 flex items-center gap-2">
                            <Umbrella className="w-4 h-4" />
                            Congés annuels
                          </span>
                          <span className="text-sm text-blue-600">
                            {annualRemaining} / {balance.annualLeave} jours
                          </span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full transition-all"
                            style={{ width: `${annualPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          {balance.usedAnnualLeave} jours utilisés
                        </p>
                      </div>

                      {/* Sick Leave */}
                      <div className="bg-red-50 p-4 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-red-800 flex items-center gap-2">
                            <Heart className="w-4 h-4" />
                            Congés maladie
                          </span>
                          <span className="text-sm text-red-600">
                            {sickRemaining} / {balance.sickLeave} jours
                          </span>
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-3">
                          <div 
                            className="bg-red-500 h-3 rounded-full transition-all"
                            style={{ width: `${sickPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          {balance.usedSickLeave} jours utilisés
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nouvelle demande de congé</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employé *</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  className="input w-full"
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de congé *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                  className="input w-full"
                  required
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="input w-full"
                  rows={3}
                  placeholder="Raison de la demande..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Créer la demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
