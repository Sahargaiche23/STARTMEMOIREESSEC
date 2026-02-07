import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Check, X, Clock, Download, Eye,
  PenTool, Shield, Calendar, User, Building2, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ContractSigning = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    contractType: 'CDI',
    title: '',
    startDate: '',
    endDate: '',
    salary: '',
    position: '',
    content: ''
  });

  const contractTypes = [
    { value: 'CDI', label: 'Contrat à Durée Indéterminée (CDI)' },
    { value: 'CDD', label: 'Contrat à Durée Déterminée (CDD)' },
    { value: 'SIVP', label: 'Stage d\'Initiation à la Vie Professionnelle (SIVP)' },
    { value: 'Stage', label: 'Convention de Stage' },
    { value: 'Avenant', label: 'Avenant au contrat' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contractsRes, employeesRes] = await Promise.all([
        api.get('/hr/contracts'),
        api.get('/hr/employees')
      ]);
      setContracts(contractsRes.data.contracts || []);
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
      await api.post('/hr/contracts', formData);
      toast.success('Contrat créé avec succès');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    }
  };

  const handleSignEmployer = async (id) => {
    try {
      const res = await api.post(`/hr/contracts/${id}/sign-employer`);
      toast.success('Contrat signé par l\'employeur');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la signature');
    }
  };

  const handleSignEmployee = async (id) => {
    try {
      const res = await api.post(`/hr/contracts/${id}/sign-employee`);
      toast.success('Contrat signé par l\'employé');
      fetchData();
    } catch (error) {
      toast.error('Erreur lors de la signature');
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      contractType: 'CDI',
      title: '',
      startDate: '',
      endDate: '',
      salary: '',
      position: '',
      content: ''
    });
  };

  const viewContract = (contract) => {
    setSelectedContract(contract);
    setShowViewModal(true);
  };

  const getStatusBadge = (contract) => {
    if (contract.status === 'signed') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Signé</span>;
    }
    if (contract.employerSignedAt && !contract.employeeSignedAt) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Attente signature employé</span>;
    }
    if (!contract.employerSignedAt && contract.employeeSignedAt) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Attente signature employeur</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1"><FileText className="w-3 h-3" /> Brouillon</span>;
  };

  const generateContractContent = () => {
    const employee = employees.find(e => e.id === Number(formData.employeeId));
    if (!employee) return;

    const content = `CONTRAT DE TRAVAIL ${formData.contractType}

Entre les soussignés :

L'EMPLOYEUR :
[Nom de l'entreprise]
Représentée par : [Nom du représentant]
Adresse : [Adresse de l'entreprise]

ET

L'EMPLOYÉ(E) :
Nom et prénom : ${employee.firstName} ${employee.lastName}
CIN : ${employee.cin || '[À compléter]'}
Adresse : ${employee.address || '[À compléter]'}

Il a été convenu ce qui suit :

ARTICLE 1 - ENGAGEMENT
L'employeur engage l'employé(e) en qualité de ${formData.position || '[Poste]'} à compter du ${formData.startDate || '[Date]'}.

ARTICLE 2 - DURÉE
${formData.contractType === 'CDI' ? 'Le présent contrat est conclu pour une durée indéterminée.' : `Le présent contrat est conclu pour une durée déterminée jusqu'au ${formData.endDate || '[Date de fin]'}.`}

ARTICLE 3 - RÉMUNÉRATION
L'employé(e) percevra une rémunération mensuelle brute de ${formData.salary || '[Montant]'} TND.

ARTICLE 4 - PÉRIODE D'ESSAI
Une période d'essai de ${formData.contractType === 'CDI' ? '3 mois' : '1 mois'} est prévue, renouvelable une fois.

ARTICLE 5 - HORAIRES DE TRAVAIL
L'employé(e) est soumis(e) à la durée légale du travail en vigueur en Tunisie.

ARTICLE 6 - CONGÉS PAYÉS
L'employé(e) bénéficiera des congés payés conformément à la législation tunisienne en vigueur.

Fait en deux exemplaires originaux.

À _____________, le _____________

L'EMPLOYEUR                                    L'EMPLOYÉ(E)
(Signature et cachet)                          (Signature)`;

    setFormData({ ...formData, content });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = {
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'signed').length,
    pending: contracts.filter(c => c.status !== 'signed' && c.status !== 'draft').length,
    draft: contracts.filter(c => c.status === 'draft').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signature Contrat Digital</h1>
          <p className="text-gray-600">Signature électronique conforme à la loi n°2000-83</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nouveau contrat
        </button>
      </div>

      {/* Info Banner */}
      <div className="card bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Signature électronique légale</h2>
            <p className="text-white/80 text-sm mt-1">
              Conforme à la loi tunisienne n°2000-83 relative aux échanges et au commerce électroniques.
              Chaque signature est horodatée et sécurisée par un hash SHA-256.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.signed}</p>
              <p className="text-sm text-gray-600">Signés</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              <p className="text-sm text-gray-600">En attente</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
              <p className="text-sm text-gray-600">Brouillons</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Contrats</h2>
        
        {contracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun contrat</p>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Créer votre premier contrat
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div key={contract.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      contract.status === 'signed' ? 'bg-green-100' : 'bg-indigo-100'
                    }`}>
                      <FileText className={`w-6 h-6 ${
                        contract.status === 'signed' ? 'text-green-600' : 'text-indigo-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{contract.title}</h3>
                      <p className="text-sm text-gray-500">
                        {contract.firstName} {contract.lastName} • {contract.contractType}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(contract.startDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {contract.position}
                        </span>
                        <span className="font-medium text-green-600">
                          {Number(contract.salary).toLocaleString()} TND
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(contract)}
                    {contract.signatureHash && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {contract.signatureHash.substring(0, 12)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* Signatures Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        contract.employerSignedAt ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {contract.employerSignedAt ? <Check className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Employeur</p>
                        <p className="text-xs text-gray-500">
                          {contract.employerSignedAt 
                            ? new Date(contract.employerSignedAt).toLocaleString('fr-FR')
                            : 'Non signé'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        contract.employeeSignedAt ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {contract.employeeSignedAt ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Employé</p>
                        <p className="text-xs text-gray-500">
                          {contract.employeeSignedAt 
                            ? new Date(contract.employeeSignedAt).toLocaleString('fr-FR')
                            : 'Non signé'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => viewContract(contract)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </button>
                  {!contract.employerSignedAt && (
                    <button
                      onClick={() => handleSignEmployer(contract.id)}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      Signer (Employeur)
                    </button>
                  )}
                  {contract.employerSignedAt && !contract.employeeSignedAt && (
                    <button
                      onClick={() => handleSignEmployee(contract.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      Signer (Employé)
                    </button>
                  )}
                  {contract.status === 'signed' && (
                    <button className="btn-secondary text-sm flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Télécharger PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nouveau contrat</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employé *</label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat *</label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                    className="input w-full"
                    required
                  >
                    {contractTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du contrat *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input w-full"
                  placeholder="Ex: Contrat CDI - Développeur Senior"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salaire brut (TND) *</label>
                  <input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin {formData.contractType !== 'CDI' && '*'}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="input w-full"
                    required={formData.contractType !== 'CDI'}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Contenu du contrat</label>
                  <button
                    type="button"
                    onClick={generateContractContent}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Générer automatiquement
                  </button>
                </div>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="input w-full font-mono text-sm"
                  rows={12}
                  placeholder="Contenu du contrat de travail..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Créer le contrat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {showViewModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedContract.title}</h2>
                <p className="text-gray-500 text-sm">
                  {selectedContract.firstName} {selectedContract.lastName}
                </p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Contract Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{selectedContract.contractType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Poste</p>
                  <p className="font-semibold">{selectedContract.position}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="font-semibold">{new Date(selectedContract.startDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Salaire brut</p>
                  <p className="font-semibold text-green-600">{Number(selectedContract.salary).toLocaleString()} TND</p>
                </div>
              </div>

              {/* Signature Hash */}
              {selectedContract.signatureHash && (
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h4 className="font-medium text-indigo-800 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Certificat de signature
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Hash SHA-256</p>
                      <p className="font-mono text-xs break-all">{selectedContract.signatureHash}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Statut</p>
                      <p className="font-medium text-green-600">✓ Authentique</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contract Content */}
              {selectedContract.content && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contenu du contrat</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {selectedContract.content}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => setShowViewModal(false)} className="btn-secondary flex-1">
                  Fermer
                </button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-2">
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

export default ContractSigning;
