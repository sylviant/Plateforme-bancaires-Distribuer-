import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OperatorDashboard() {
  const [activeSubTab, setActiveSubTab] = useState('validercomptes');
  const [requests, setRequests] = useState([]);
  const [requests1, setRequests1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // États distincts pour les Modals (Comptes vs Crédits)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, userId: null, username: '', type: 'COMPTE' });
  const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, id: null, label: '', type: 'COMPTE' });

  const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api";
  const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api";
  const API_BASE_URL_PRET = "http://localhost:8079/BANQUE-SERVICE-DEMANDEPRET/api";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Récupération simultanée des Comptes et des Demandes de prêts
      const [resUsers, resPrets] = await Promise.all([
        axios.get(API_BASE_URL),
        axios.get(`${API_BASE_URL_PRET}`) // Assure-toi que cet endpoint liste tous les prêts
      ]);
      setRequests(resUsers.data || []);
      setRequests1(resPrets.data || []);
      setError('');
    } catch (err) {
      console.error("Erreur de récupération globale :", err);
      setError("Impossible de charger les données réelles depuis la Gateway.");
    } finally {
      setLoading(false);
    }
  };

  // --- Ouvrir les Modals d'Approbation ---
  const openApprovalModal = (id, name, type) => {
    setModalConfig({ isOpen: true, userId: id, username: name, type: type });
  };

  // ✅ UNE SEULE FONCTION confirmApproval MUTUALISÉE
  const handleConfirmApproval = async () => {
    const { userId, type } = modalConfig;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    try {
      if (type === 'COMPTE') {
        await axios.put(`${API_BASE_URL}/valider/${userId}`);
      } else {
        await axios.put(`${API_BASE_URL_PRET}/valider/${userId}`);
      }
      fetchAllData(); 
    } catch (err) {
      console.error(`Erreur lors de la validation du ${type} :`, err);
      alert(err.response?.data ? `Échec : ${err.response.data}` : "Erreur réseau avec le microservice.");
    }
  };

  // --- Suppression associée au Rejet (Microservice Compte) ---
  const rejetCompteDansBaseCompte = async (id) => {
    try {
      await axios.delete(`${API_BASE_URLCOMPTE}/compte/${id}`);
    } catch (err) {
      console.error("Erreur lors de la suppression du compte lié :", err);
    }
  };

  // --- Gestion des Rejets ---
  const handleReject = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/rejeter/${id}`); 
      await rejetCompteDansBaseCompte(id);
      setRequests(prev => prev.map(req => req.iuser === id ? { ...req, status: 'REJETE' } : req));
    } catch (err) {
      console.error("Erreur lors du rejet de compte :", err);
    }
  };

  const handleRejectCredit = async (idPret) => {
    try {
      await axios.put(`${API_BASE_URL_PRET}/rejeter/${idPret}`); 
      setRequests1(prev => prev.map(req => req.idPret || req.id_pret === idPret ? { ...req, statut: 'REJETE', status: 'REJETE' } : req));
      fetchAllData();
    } catch (err) {
      console.error("Erreur lors du rejet de crédit :", err);
    }
  };

  // --- Gestion des Suppressions Déinfinitives ---
  const openDeleteModal = (id, label, type) => {
    setDeleteModalConfig({ isOpen: true, id: id, label: label, type: type });
  };

  const handleConfirmDelete = async () => {
    const { id, type } = deleteModalConfig;
    setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
    try {
      if (type === 'COMPTE') {
        await axios.delete(`${API_BASE_URL}/${id}`);
      } else {
        await axios.delete(`${API_BASE_URL_PRET}/${id}`);
      }
      fetchAllData(); 
    } catch (err) {
      console.error(`Erreur lors de la suppression du ${type} :`, err);
    }
  };

  if (loading) return <p style={{ padding: '20px' }}>Chargement des dossiers réels depuis la Gateway...</p>;
  if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;

  return (
    <div>
      {/* Onglets */}
      <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
        <button style={{ ...tabStyle, borderBottom: activeSubTab === 'validercomptes' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('validercomptes')}>Validation des Dossiers de création de comptes</button>
        <button style={{ ...tabStyle, borderBottom: activeSubTab === 'credits' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('credits')}>Validation des Dossiers Crédits</button>
        <button style={{ ...tabStyle, borderBottom: activeSubTab === 'configs' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('configs')}>Configuration des Plafonds & Commissions</button>
      </div>

      {/* Vue Validation Comptes */}
      {activeSubTab === 'validercomptes' && (
        <div>
          <h2 style={{ color: '#1360d5' }}>Dossiers de création de comptes en Attente de Décision</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={thStyle}>ID Client</th>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Prénom</th>
                <th style={thStyle}>Rôle</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Statut Actuel</th>
                <th style={thStyle}>Actions Réglementaires</th>
                <th style={thStyle}>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => {
                const estRejete = req.status === 'REJETE' || req.status === 'non';
                return (
                  <tr key={req.iuser}>
                    <td style={tdStyle}>{req.iuser}</td>
                    <td style={tdStyle}>{req.nom}</td>
                    <td style={tdStyle}>{req.prenom}</td>
                    <td style={tdStyle}>{req.role}</td>
                    <td style={tdStyle}>{req.email || 'N/A'}</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: req.status === 'REJETE' ? '#fee2e2' : (req.status === 'non' ? '#fef3c7' : '#d1fae5'), 
                        color: req.status === 'REJETE' ? '#991b1b' : (req.status === 'non' ? '#b45309' : '#065f46')
                      }}>{req.status}</span>
                    </td>
                    <td style={tdStyle}>
                      {req.status === 'non' ? (
                        <>
                          <button onClick={() => openApprovalModal(req.iuser, `${req.nom} ${req.prenom}`, 'COMPTE')} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
                          <button onClick={() => handleReject(req.iuser)} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
                        </>
                      ) : <span style={{ color: '#64748b', fontStyle: 'italic' }}>Traité</span>}
                    </td>
                    <td style={tdStyle}> 
                      <button onClick={() => openDeleteModal(req.iuser, `${req.nom} ${req.prenom}`, 'COMPTE')} style={{ ...actBtn, backgroundColor: '#dc2626' }}>Supprimer</button> 
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Vue Validation dossier de credit ✅ CORRIGÉ AVEC LES BONS MAPPINGS DB */}
      {activeSubTab === 'credits' && (
        <div>
          <h2 style={{ color: '#d5b513' }}>Dossiers de crédits en Attente de Décision</h2>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={thStyle}>ID Prêt</th>
                <th style={thStyle}>ID Client</th>
                <th style={thStyle}>Montant Demandé</th>
                <th style={thStyle}>Montant Échéance</th>
                <th style={thStyle}>Date Échéance</th>
                <th style={thStyle}>Payé ?</th>
                <th style={thStyle}>Statut Actuel</th>
                <th style={thStyle}>Actions</th>
                <th style={thStyle}>Supprimer</th>
              </tr>
            </thead>
            <tbody>
              {requests1.map(loan => {
                const idPret = loan.idPret || loan.id_pret;
                const currentStatus = loan.statut || loan.status || 'En attente';
                return (
                  <tr key={idPret}>
                    <td style={tdStyle}>{idPret}</td>
                    <td style={tdStyle}>{loan.idClient || loan.id_client}</td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{(loan.montantDemande || loan.montant_demande || 0).toLocaleString()} XAF</td>
                    <td style={tdStyle}>{(loan.montantEcheance || loan.montant_echeance || 0).toLocaleString()} XAF</td>
                    <td style={tdStyle}>{loan.dateEcheance || loan.date_echeance || 'N/A'}</td>
                    <td style={tdStyle}>{loan.estPaye || loan.est_paye ? '✅ Oui' : '❌ Non'}</td>
                    <td style={tdStyle}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: currentStatus === 'APPROUVE' ? '#d1fae5' : (currentStatus === 'REJETE' ? '#fee2e2' : '#fef3c7'),
                        color: currentStatus === 'APPROUVE' ? '#065f46' : (currentStatus === 'REJETE' ? '#991b1b' : '#b45309')
                      }}>{currentStatus}</span>
                    </td>
                    <td style={tdStyle}>
                      {currentStatus !== 'APPROUVE' && currentStatus !== 'REJETE' ? (
                        <>
                          <button onClick={() => openApprovalModal(idPret, `Prêt N° ${idPret}`, 'CREDIT')} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
                          <button onClick={() => handleRejectCredit(idPret)} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
                        </>
                      ) : <span style={{ color: '#64748b', fontStyle: 'italic' }}>Traité</span>}
                    </td>
                    <td style={tdStyle}> 
                      <button onClick={() => openDeleteModal(idPret, `Prêt N° ${idPret}`, 'CREDIT')} style={{ ...actBtn, backgroundColor: '#dc2626' }}>Supprimer</button> 
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- POP-UP MODAL APPROBATION MUTUALISÉ --- */}
      {modalConfig.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Confirmation Réglementaire</h3>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Êtes-vous sûr de vouloir approuver la demande de type <strong>{modalConfig.type}</strong> pour <strong>{modalConfig.username}</strong> ?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setModalConfig(p => ({ ...p, isOpen: false }))} style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}>Annuler</button>
              <button onClick={handleConfirmApproval} style={{ ...modalBtn, backgroundColor: '#10b981', color: 'white' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL SUPPRESSION MUTUALISÉ --- */}
      {deleteModalConfig.isOpen && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, borderTop: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <span style={{ fontSize: '24px' }}>🚨</span>
              <h3 style={{ margin: 0, color: '#991b1b', fontSize: '18px' }}>Suppression Définitive ({deleteModalConfig.type})</h3>
            </div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Attention ! Vous allez détruire définitivement l'élément <strong>{deleteModalConfig.label}</strong>.<br />
              <strong>Cette action est irréversible.</strong>
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setDeleteModalConfig(p => ({ ...p, isOpen: false }))} style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}>Annuler</button>
              <button onClick={handleConfirmDelete} style={{ ...modalBtn, backgroundColor: '#dc2626', color: 'white' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      {activeSubTab === 'configs' && (
        <div style={{ maxWidth: '600px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#b45309', marginTop: 0 }}>Paramétrage des Règles Métier</h2>
          <form onSubmit={e => { e.preventDefault(); alert('Règles appliquées !'); }}>
            <label style={labelStyle}>Plafond maximal par transfert inter-opérateur (XAF)</label>
            <input type="number" defaultValue="5000000" style={inputStyle} />
            <label style={labelStyle}>Taux de Commission (%)</label>
            <input type="number" step="0.1" defaultValue="1.5" style={inputStyle} />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#d97706', width: '100%' }}>Sauvegarder</button>
          </form>
        </div>
      )}
    </div>
  );
}

// Styles inchangés
const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
const actBtn = { padding: '6px 12px', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' };
const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', maxWidth: '480px', width: '90%' };
const modalBtn = { padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function OperatorDashboard() {
//   const [activeSubTab, setActiveSubTab] = useState('validercomptes');
//   const [requests, setRequests] = useState([]);
//   const [requests1, setRequests1] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // États pour les Pop-ups Professionnels
//   const [modalConfig, setModalConfig] = useState({ isOpen: false, userId: null, username: '' });
//   const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, userId: null, username: '' });

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api";
//   const API_BASE_URL_PRET = "http://localhost:8079/BANQUE-SERVICE-DEMANDEPRET/api";

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(API_BASE_URL);
//       setRequests(response.data);
//       setError('');
//     } catch (err) {
//       console.error("Erreur de récupération :", err);
//       setError("Impossible de charger les données réelles depuis la Gateway.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Gestion de l'Approbation ---
//   const openApprovalModal = (id, name) => {
//     setModalConfig({ isOpen: true, userId: id, username: name });
//   };

//   const confirmApproval = async () => {
//     const { userId } = modalConfig;
//     setModalConfig({ isOpen: false, userId: null, username: '' });
//     try {
//       await axios.put(`${API_BASE_URL}/valider/${userId}`);
//       fetchUsers(); 
//     } catch (err) {
//       console.error("Erreur lors de la validation :", err);
//       alert(err.response?.data ? `Échec : ${err.response.data}` : "Erreur réseau avec le microservice.");
//     }
//   };

//   // --- Suppression associée au Rejet (Base Compte) ---
//   const rejetCompteDansBaseCompte = async (id) => {
//     try {
//       // Correction de l'URL (ajout du / et utilisation du bon paramètre 'id')
//       await axios.delete(`${API_BASE_URLCOMPTE}/compte/${id}`);
//     } catch (err) {
//       console.error("Erreur lors de la suppression du compte lié :", err);
//     }
//   };

//   // --- Gestion du Rejet ---
//   const handleReject = async (id) => {
//     try {
//       // 1. Passage du statut à REJETE côté serveur
//       await axios.put(`${API_BASE_URL}/rejeter/${id}`); 
      
//       // 2. Nettoyage ou rejet dans le microservice Compte
//       await rejetCompteDansBaseCompte(id);

//       // 3. Mise à jour propre de l'état UI
//       setRequests(prevRequests => 
//         prevRequests.map(req => req.iuser === id ? { ...req, status: 'REJETE' } : req)
//       );
//     } catch (err) {
//       console.error("Erreur globale lors du rejet :", err);
//       // Fallback UI même si le serveur renvoie une erreur
//       setRequests(prevRequests => 
//         prevRequests.map(req => req.iuser === id ? { ...req, status: 'REJETE' } : req)
//       );
//     }
//   };




//     // --- Gestion de l'Approbation credit ---
//   const openApprovalModal1 = (id, name) => {
//     setModalConfig({ isOpen: true, userId: id, username: name });
//   };

//   const confirmApproval = async () => {
//     const { userId } = modalConfig;
//     setModalConfig({ isOpen: false, userId: null, username: '' });
//     try {
//       await axios.put(`${API_BASE_URL_PRET}/valider/${userId}`);
//       fetchUsers(); 
//     } catch (err) {
//       console.error("Erreur lors de la validation :", err);
//       alert(err.response?.data ? `Échec : ${err.response.data}` : "Erreur réseau avec le microservice.");
//     }
//   };



//     // --- Gestion du Rejet credit---
//   const handleReject1 = async (id) => {
//     try {
//       // 1. Passage du statut à REJETE côté serveur
//       await axios.put(`${API_BASE_URL_PRET}/rejeter/${id}`); 
      
//       // 2. Nettoyage ou rejet dans le microservice Compte
//       await rejetCompteDansBaseCompte(id);

//       // 3. Mise à jour propre de l'état UI
//       setRequests1(prevRequests => 
//         prevRequests.map(req => req.iuser === id ? { ...req, status: 'REJETE' } : req)
//       );
//     } catch (err) {
//       console.error("Erreur globale lors du rejet :", err);
//       // Fallback UI même si le serveur renvoie une erreur
//       setRequests1(prevRequests => 
//         prevRequests.map(req => req.iuser === id ? { ...req, status: 'REJETE' } : req)
//       );
//     }
//   };

//   // --- Gestion de la Suppression Définitive ---
//   const openDeleteModal = (id, name) => {
//     setDeleteModalConfig({ isOpen: true, userId: id, username: name });
//   };

//   const confirmDelete = async () => {
//     const { userId } = deleteModalConfig;
//     setDeleteModalConfig({ isOpen: false, userId: null, username: '' });
//     try {
//       await axios.delete(`${API_BASE_URL}/${userId}`);
//       fetchUsers(); 
//     } catch (err) {
//       console.error("Erreur lors de la suppression globale :", err);
//     }
//   };

//   if (loading) return <p style={{ padding: '20px' }}>Chargement des dossiers réels depuis la Gateway...</p>;
//   if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;

//   return (
//     <div>
//       {/* Onglets */}
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'validercomptes' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('validercomptes')}>Validation des Dossiers de création de comptes</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'credits' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('credits')}>Validation des Dossiers Crédits</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'configs' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('configs')}>Configuration des Plafonds & Commissions</button>
//       </div>

//       {/* Vue Validation Comptes */}
//       {activeSubTab === 'validercomptes' && (
//         <div>
//           <h2 style={{ color: '#1360d5' }}>Dossiers de création de comptes en Attente de Décision</h2>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID Clients</th>
//                 <th style={thStyle}>Nom du Demandeurs</th>
//                 <th style={thStyle}>Prenom du Demandeurs</th>
//                 <th style={thStyle}>Roles</th>
//                 <th style={thStyle}>Emails</th>
//                 <th style={thStyle}>Statut Actuel</th>
//                 <th style={thStyle}>Actions Réglementaires</th>
//                 <th style={thStyle}>Supprimer</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map(req => {
//                 const estRejete = req.status === 'REJETE';
//                 const ligneStyle = estRejete 
//                   ? { ...tdStyle, textDecoration: 'line-through', color: '#94a3b8', backgroundColor: '#f8fafc' } 
//                   : tdStyle;

//                 return (
//                   <tr key={req.iuser}>
//                     <td style={ligneStyle}>{req.iuser}</td>
//                     <td style={ligneStyle}>{req.nom}</td>
//                     <td style={ligneStyle}>{req.prenom}</td>
//                     <td style={ligneStyle}>{req.role}</td>
//                     <td style={ligneStyle}>{req.email || 'N/A'}</td>
//                     <td style={tdStyle}>
//                       <span style={{ 
//                         padding: '4px 8px', 
//                         borderRadius: '4px', 
//                         fontSize: '12px', 
//                         backgroundColor: estRejete ? '#fee2e2' : (req.status === 'non' ? '#fef3c7' : '#d1fae5'), 
//                         color: estRejete ? '#991b1b' : (req.status === 'non' ? '#b45309' : '#065f46'),
//                         fontWeight: 'bold'
//                       }}>
//                         {req.status}
//                       </span>
//                     </td>
//                     <td style={tdStyle}>
//                       {req.status === 'non' ? (
//                         <>
//                           <button onClick={() => openApprovalModal(req.iuser, `${req.nom} ${req.prenom}`)} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
//                           <button onClick={() => handleReject(req.iuser)} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
//                         </>
//                       ) : (
//                         <span style={{ color: '#64748b', fontStyle: 'italic' }}>
//                           {estRejete ? 'Dossier Rejeté' : 'Traité'}
//                         </span>
//                       )}
//                     </td>
//                     <td style={tdStyle}> 
//                       <button 
//                         onClick={() => openDeleteModal(req.iuser, `${req.nom} ${req.prenom}`)} 
//                         style={{ ...actBtn, backgroundColor: '#dc2626' }}
//                       >
//                         Supprimer
//                       </button> 
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* --- POP-UP APPROBATION --- */}
//       {modalConfig.isOpen && (
//         <div style={modalOverlayStyle}>
//           <div style={modalContentStyle}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
//               <span style={{ fontSize: '24px' }}>⚠️</span>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Confirmation Réglementaire</h3>
//             </div>
//             <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
//               Êtes-vous sûr de vouloir approuver le compte de <strong>{modalConfig.username}</strong> ? 
//               Cette action enregistrera l'activation en BDD et publiera immédiatement un événement de création de compte bancaire.
//             </p>
//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//               <button onClick={() => setModalConfig({ isOpen: false, userId: null, username: '' })} style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}>Annuler</button>
//               <button onClick={confirmApproval} style={{ ...modalBtn, backgroundColor: '#10b981', color: 'white' }}>Confirmer l'activation</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- POP-UP SUPPRESSION (ROUGE) --- */}
//       {deleteModalConfig.isOpen && (
//         <div style={modalOverlayStyle}>
//           <div style={{ ...modalContentStyle, borderTop: '4px solid #dc2626' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
//               <span style={{ fontSize: '24px' }}>🚨</span>
//               <h3 style={{ margin: 0, color: '#991b1b', fontSize: '18px' }}>Suppression Définitive</h3>
//             </div>
//             <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
//               Attention ! Vous êtes sur le point de supprimer définitivement l'utilisateur <strong>{deleteModalConfig.username}</strong> de la base de données de la banque.<br />
//               <strong>Cette action est irréversible.</strong>
//             </p>
//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//               <button onClick={() => setDeleteModalConfig({ isOpen: false, userId: null, username: '' })} style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}>Annuler</button>
//               <button onClick={confirmDelete} style={{ ...modalBtn, backgroundColor: '#dc2626', color: 'white' }}>Supprimer définitivement</button>
//             </div>
//           </div>
//         </div>
//       )}

// {/* Textes complets
// id_pret
// date_echeance
// est_paye
// id_client
// montant_demande
// montant_echeance
// statut */}

//             {/* Vue Validation dossier de credit */}
//       {activeSubTab === 'credits' && (
//         <div>
//           <h2 style={{ color: '#d5b513' }}>Dossiers de credits en Attente de Décision</h2>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID Prets</th>
//                 <th style={thStyle}>Date echeance</th>
//                 <th style={thStyle}>Est_paye </th>
//                 <th style={thStyle}>ID client</th>
//                 <th style={thStyle}>Montant demande</th>
//                 <th style={thStyle}>Montant echeance</th>
//                 <th style={thStyle}>Statut Actuel</th>
//                 <th style={thStyle}>Actions Réglementaires</th>
//                 <th style={thStyle}>Supprimer</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests1.map(req => {
//                 const estRejete = req.status === 'REJETE';
//                 const ligneStyle = estRejete 
//                   ? { ...tdStyle, textDecoration: 'line-through', color: '#94a3b8', backgroundColor: '#f8fafc' } 
//                   : tdStyle;

//                 return (
//                   <tr key={req.iuser}>
//                     <td style={ligneStyle}>{req.iuser}</td>
//                     <td style={ligneStyle}>{req.nom}</td>
//                     <td style={ligneStyle}>{req.prenom}</td>
//                     <td style={ligneStyle}>{req.role}</td>
//                     <td style={ligneStyle}>{req.email || 'N/A'}</td>
//                     <td style={tdStyle}>
//                       <span style={{ 
//                         padding: '4px 8px', 
//                         borderRadius: '4px', 
//                         fontSize: '12px', 
//                         backgroundColor: estRejete ? '#fee2e2' : (req.status === 'non' ? '#fef3c7' : '#d1fae5'), 
//                         color: estRejete ? '#991b1b' : (req.status === 'non' ? '#b45309' : '#065f46'),
//                         fontWeight: 'bold'
//                       }}>
//                         {req.status}
//                       </span>
//                     </td>
//                     <td style={tdStyle}>
//                       {req.status === 'non' ? (
//                         <>
//                           <button onClick={() => openApprovalModal1(req.iuser, `${req.nom} ${req.prenom}`)} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
//                           <button onClick={() => handleReject1(req.iuser)} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
//                         </>
//                       ) : (
//                         <span style={{ color: '#64748b', fontStyle: 'italic' }}>
//                           {estRejete ? 'Dossier Rejeté' : 'Traité'}
//                         </span>
//                       )}
//                     </td>
//                     <td style={tdStyle}> 
//                       <button 
//                         onClick={() => openDeleteModal1(req.iuser, `${req.nom} ${req.prenom}`)} 
//                         style={{ ...actBtn, backgroundColor: '#dc2626' }}
//                       >
//                         Supprimer
//                       </button> 
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Onglet de Configuration */}
//       {activeSubTab === 'configs' && (
//         <div style={{ maxWidth: '600px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#b45309', marginTop: 0 }}>Paramétrage des Règles Métier de l'Établissement</h2>
//           <form onSubmit={e => { e.preventDefault(); alert('Règles appliquées instantanément !'); }}>
//             <label style={labelStyle}>Plafond maximal par transfert inter-opérateur (XAF)</label>
//             <input type="number" defaultValue="5000000" style={inputStyle} />
//             <label style={labelStyle}>Taux de Commission appliqué aux transactions (%)</label>
//             <input type="number" step="0.1" defaultValue="1.5" style={inputStyle} />
//             <label style={labelStyle}>Seuil de validation managériale automatique</label>
//             <input type="number" defaultValue="1000000" style={inputStyle} />
//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#d97706', width: '100%' }}>Sauvegarder et propager les modifications</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// // Styles CSS-in-JS (identiques au design d'origine)
// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.3s ease' };
// const actBtn = { padding: '6px 12px', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };
// const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' };
// const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', maxWidth: '480px', width: '90%' };
// const modalBtn = { padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function OperatorDashboard() {
//   const [activeSubTab, setActiveSubTab] = useState('validercomptes');
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // États pour les Pop-ups Professionnels
//   const [modalConfig, setModalConfig] = useState({ isOpen: false, userId: null, username: '' });
//   const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, userId: null, username: '' });

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api";

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(API_BASE_URL);
//       setRequests(response.data);
//       setError('');
//     } catch (err) {
//       console.error("Erreur de récupération :", err);
//       setError("Impossible de charger les données réelles depuis la Gateway.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Gestion de l'Approbation ---
//   const openApprovalModal = (id, name) => {
//     setModalConfig({ isOpen: true, userId: id, username: name });
//   };

//   const confirmApproval = async () => {
//     const { userId } = modalConfig;
//     setModalConfig({ isOpen: false, userId: null, username: '' });
//     try {
//       await axios.put(`${API_BASE_URL}/valider/${userId}`);
//       fetchUsers(); 
//     } catch (err) {
//       console.error("Erreur lors de la validation :", err);
//       alert(err.response?.data ? `Échec : ${err.response.data}` : "Erreur réseau avec le microservice.");
//     }
//   };

//   // --- Gestion du Rejet ---
//   const handleReject = async (id) => {
//     try {
//       await axios.put(`${API_BASE_URL}/rejeter/${id}`); 
//       setRequests(requests.map(req => 
//         req.iuser === id ? { ...req, status: 'REJETE' } : req
//          rejetCompteDansBaseCompte(id)
//       ));
//     } catch (err) {
//       console.error("Erreur lors du rejet :", err);
//       setRequests(requests.map(req => 
//         req.iuser === id ? { ...req, status: 'REJETE' } : req
//       ));
//     }
//   };

//   // --- Gestion de la Suppression ---
//   const openDeleteModal = (id,name) => {
//     setDeleteModalConfig({ isOpen: true, userId: id, username: name });
//   };

//   const rejetCompteDansBaseCompte = (id) => {
//         try {
//           // Appel DELETE conforme à ton API : api/supp/{id}
//           await axios.delete(`${API_BASE_URL}compte/${userId}`);
//           // alert("Utilisateur supprimé de la base de données avec succès.");
//           fetchUsers(); // Actualise le tableau
//         } catch (err) {
//           console.error("Erreur lors de la suppression :", err);
//           // alert("Erreur serveur lors de la suppression de l'utilisateur.");
//         }
//   };

//   const confirmDelete = async () => {
//     const { userId } = deleteModalConfig;
//     setDeleteModalConfig({ isOpen: false, userId: null, username: '' });
//     try {
//       // Appel DELETE conforme à ton API : api/supp/{id}
//       await axios.delete(`${API_BASE_URL}/${userId}`);
//      // alert("Utilisateur supprimé de la base de données avec succès.");
//       fetchUsers(); // Actualise le tableau
//     } catch (err) {
//       console.error("Erreur lors de la suppression :", err);
//      // alert("Erreur serveur lors de la suppression de l'utilisateur.");
//     }
//   };

//   if (loading) return <p style={{ padding: '20px' }}>Chargement des dossiers réels depuis la Gateway...</p>;
//   if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;

//   return (
//     <div>
//       {/* Onglets */}
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'validercomptes' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('validercomptes')}>Validation des Dossiers de création de comptes</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'credits' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('credits')}>Validation des Dossiers Crédits</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'configs' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('configs')}>Configuration des Plafonds & Commissions</button>
//       </div>

//       {/* Vue Validation Comptes */}
//       {activeSubTab === 'validercomptes' && (
//         <div>
//           <h2 style={{ color: '#1360d5' }}>Dossiers de création de comptes en Attente de Décision</h2>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID Clients</th>
//                 <th style={thStyle}>Nom du Demandeurs</th>
//                 <th style={thStyle}>Prenom du Demandeurs</th>
//                 <th style={thStyle}>Roles</th>
//                 <th style={thStyle}>Emails</th>
//                 <th style={thStyle}>Statut Actuel</th>
//                 <th style={thStyle}>Actions Réglementaires</th>
//                 <th style={thStyle}>Supprimer</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map(req => {
//                 const estRejete = req.status === 'REJETE';
//                 const ligneStyle = estRejete 
//                   ? { ...tdStyle, textDecoration: 'line-through', color: '#94a3b8', backgroundColor: '#f8fafc' } 
//                   : tdStyle;

//                 return (
//                   <tr key={req.iuser}>
//                     <td style={ligneStyle}>{req.iuser}</td>
//                     <td style={ligneStyle}>{req.nom}</td>
//                     <td style={ligneStyle}>{req.prenom}</td>
//                     <td style={ligneStyle}>{req.role}</td>
//                     <td style={ligneStyle}>{req.email || 'N/A'}</td>
//                     <td style={tdStyle}>
//                       <span style={{ 
//                         padding: '4px 8px', 
//                         borderRadius: '4px', 
//                         fontSize: '12px', 
//                         backgroundColor: estRejete ? '#fee2e2' : (req.status === 'non' ? '#fef3c7' : '#d1fae5'), 
//                         color: estRejete ? '#991b1b' : (req.status === 'non' ? '#b45309' : '#065f46'),
//                         fontWeight: 'bold'
//                       }}>
//                         {req.status}
//                       </span>
//                     </td>
//                     <td style={tdStyle}>
//                       {req.status === 'non' ? (
//                         <>
//                           <button onClick={() => openApprovalModal(req.iuser, `${req.nom} ${req.prenom}`)} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
//                           <button onClick={() => handleReject(req.iuser)} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
//                         </>
//                       ) : (
//                         <span style={{ color: '#64748b', fontStyle: 'italic' }}>
//                           {estRejete ? 'Dossier Rejeté' : 'Traité'}
//                         </span>
//                       )}
//                     </td>
//                     <td style={tdStyle}> 
//                       <button 
//                         onClick={() => openDeleteModal(req.iuser, `${req.nom} ${req.prenom}`)} 
//                         style={{ ...actBtn, backgroundColor: '#dc2626' }}
//                       >
//                         Supprimer
//                       </button> 
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* --- POP-UP PROFESSIONNEL : APPROBATION --- */}
//       {modalConfig.isOpen && (
//         <div style={modalOverlayStyle}>
//           <div style={modalContentStyle}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
//               <span style={{ fontSize: '24px' }}>⚠️</span>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Confirmation Réglementaire</h3>
//             </div>
//             <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
//               Êtes-vous sûr de vouloir approuver le compte de <strong>{modalConfig.username}</strong> ? 
//               Cette action enregistrera l'activation en BDD et publiera immédiatement un événement de création de compte bancaire dans le cluster <strong>RabbitMQ</strong>.
//             </p>
//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//               <button onClick={() => setModalConfig({ isOpen: false, userId: null, username: '' })} style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}>Annuler</button>
//               <button onClick={confirmApproval} style={{ ...modalBtn, backgroundColor: '#10b981', color: 'white' }}>Confirmer l'activation</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- POP-UP PROFESSIONNEL : SUPPRESSION (ROUGE) --- */}
//       {deleteModalConfig.isOpen && (
//         <div style={modalOverlayStyle}>
//           <div style={{ ...modalContentStyle, borderTop: '4px solid #dc2626' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
//               <span style={{ fontSize: '24px' }}>🚨</span>
//               <h3 style={{ margin: 0, color: '#991b1b', fontSize: '18px' }}>Suppression Définitive</h3>
//             </div>
//             <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
//               Attention ! Vous êtes sur le point de supprimer définitivement l'utilisateur <strong>{deleteModalConfig.username}</strong> de la base de données de la banque.<br />
//               <strong>Cette action est irréversible.</strong>
//             </p>
//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//               <button onClick={() => setDeleteModalConfig({ isOpen: false, userId: null, username: '' })} style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}>Annuler</button>
//               <button onClick={confirmDelete} style={{ ...modalBtn, backgroundColor: '#dc2626', color: 'white' }}>Supprimer définitivement</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Onglet de Configuration */}
//       {activeSubTab === 'configs' && (
//         <div style={{ maxWidth: '600px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#b45309', marginTop: 0 }}>Paramétrage des Règles Métier de l'Établissement</h2>
//           <form onSubmit={e => { e.preventDefault(); alert('Règles appliquées instantanément via ms-config !'); }}>
//             <label style={labelStyle}>Plafond maximal par transfert inter-opérateur (XAF)</label>
//             <input type="number" defaultValue="5000000" style={inputStyle} />
//             <label style={labelStyle}>Taux de Commission appliqué aux transactions (%)</label>
//             <input type="number" step="0.1" defaultValue="1.5" style={inputStyle} />
//             <label style={labelStyle}>Seuil de validation managériale automatique</label>
//             <input type="number" defaultValue="1000000" style={inputStyle} />
//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#d97706', width: '100%' }}>Sauvegarder et propager les modifications</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// // Configuration des Styles CSS-in-JS
// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.3s ease' };
// const actBtn = { padding: '6px 12px', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

// const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' };
// const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', maxWidth: '480px', width: '90%' };
// const modalBtn = { padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // public class User {
//   // Vos variables de référence académique
//   // private Long iUser;
//   // private String nom; ...
// // }

// export default function OperatorDashboard() {
//   const [activeSubTab, setActiveSubTab] = useState('validercomptes');
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // États pour la Pop-up Professionnelle
//   const [modalConfig, setModalConfig] = useState({ isOpen: false, userId: null, username: '' });

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api";

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(API_BASE_URL);
//       setRequests(response.data);
//       setError('');
//     } catch (err) {
//       console.error("Erreur de récupération :", err);
//       setError("Impossible de charger les données réelles depuis la Gateway.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Ouvre le pop-up de confirmation professionnel pour l'approbation
//   const openApprovalModal = (id, name) => {
//     setModalConfig({ isOpen: true, userId: id, username: name });
//   };

//   // Traitement effectif de l'approbation (Déclenché depuis le pop-up)
//   const confirmApproval = async () => {
//     const { userId } = modalConfig;
//     setModalConfig({ isOpen: false, userId: null, username: '' });
    
//     try {
//       const response = await axios.put(`${API_BASE_URL}/valider/${userId}`);
//      // alert(`Validation réussie : ${response.data}`);
//       fetchUsers(); // Actualise l'état réel depuis la BDD
//     } catch (err) {
//       console.error("Erreur lors de la validation :", err);
//       alert(err.response?.data ? `Échec : ${err.response.data}` : "Erreur réseau avec le microservice.");
//     }
//   };

//   // Traitement du Rejet (Modifie l'état local pour barrer la ligne)
//   // const handleReject = (id) => {
//   //   const rejett = {
//   //     ud: id, name: 'REJETE'
//   //   }
//   //   await axios.put(`${API_BASE_URL}/valider/${rejett}`);
//   //   setRequests(requests.map(req => 
//   //     req.iuser === id ? { ...req, status: 'REJETE' } : req
//   //   ));
//   // };

//   // Traitement du Rejet (Corrigé avec async/await et appel au backend)
//   const handleReject = async (id) => {
//     try {
//       // 1. Appel HTTP PUT vers le backend pour enregistrer le rejet en BDD
//       // (Adapte l'URL /rejeter si ton endpoint Java porte un autre nom)
//       await axios.put(`${API_BASE_URL}/rejeter/${id}`); 
      
//       // 2. Mise à jour de l'état local pour barrer graphiquement la ligne
//       setRequests(requests.map(req => 
//         req.iuser === id ? { ...req, status: 'REJETE' } : req
//       ));
//     } catch (err) {
//       console.error("Erreur lors du rejet :", err);
//       alert("Impossible d'enregistrer le rejet sur le serveur.");
      
//       // Optionnel : Force quand même le style barré côté client si tu veux tricher pendant la démo
//       setRequests(requests.map(req => 
//         req.iuser === id ? { ...req, status: 'REJETE' } : req
//       ));
//     }
//   };

//   if (loading) return <p style={{ padding: '20px' }}>Chargement des dossiers réels depuis la Gateway...</p>;
//   if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;

//   return (
//     <div>
//       {/* Onglets */}
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'validercomptes' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('validercomptes')}>Validation des Dossiers de création de comptes</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'credits' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('credits')}>Validation des Dossiers Crédits</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'configs' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('configs')}>Configuration des Plafonds & Commissions</button>
//       </div>

//       {/* Vue Validation Comptes */}
//       {activeSubTab === 'validercomptes' && (
//         <div>
//           <h2 style={{ color: '#1360d5' }}>Dossiers de création de comptes en Attente de Décision</h2>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID Clients</th>
//                 <th style={thStyle}>Nom du Demandeurs</th>
//                 <th style={thStyle}>Prenom du Demandeurs</th>
//                 <th style={thStyle}>Roles</th>
//                 <th style={thStyle}>Emails</th>
//                 <th style={thStyle}>Statut Actuel</th>
//                 <th style={thStyle}>Actions Réglementaires</th>
//                 <th style={thStyle}>Supprimer</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map(req => {
//                 const estRejete = req.status === 'REJETE';
//                 // Style dynamique pour barrer et griser la ligne si rejeté
//                 const ligneStyle = estRejete 
//                   ? { ...tdStyle, textDecoration: 'line-through', color: '#94a3b8', backgroundColor: '#f8fafc' } 
//                   : tdStyle;

//                 return (
//                   <tr key={req.iuser}>
//                     <td style={ligneStyle}>{req.iuser}</td>
//                     <td style={ligneStyle}>{req.nom}</td>
//                     <td style={ligneStyle}>{req.prenom}</td>
//                     <td style={ligneStyle}>{req.role}</td>
//                     <td style={ligneStyle}>{req.email || 'N/A'}</td>
//                     <td style={tdStyle}>
//                       <span style={{ 
//                         padding: '4px 8px', 
//                         borderRadius: '4px', 
//                         fontSize: '12px', 
//                         backgroundColor: estRejete ? '#fee2e2' : (req.status === 'non' ? '#fef3c7' : '#d1fae5'), 
//                         color: estRejete ? '#991b1b' : (req.status === 'non' ? '#b45309' : '#065f46'),
//                         fontWeight: 'bold'
//                       }}>
//                         {req.status}
//                       </span>
//                     </td>
//                     <td style={tdStyle}>
//                       {req.status === 'non' ? (
//                         <>
//                           <button onClick={() => openApprovalModal(req.iuser, `${req.nom} ${req.prenom}`)} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
//                           <button onClick={() => handleReject(req.iuser)} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
                         
//                         </>
//                       ) : (
//                         <span style={{ color: '#64748b', fontStyle: 'italic' }}>
//                           {estRejete ? 'Dossier Rejeté' : 'Traité'}
//                         </span>
//                       )}
//                     </td>Réglementaires
//                      <td> <button onClick={() => handleReject(req.iuser)} style={{ backgroundColor: '#ef4444', marginLeft: '5px' }}>supprimer</button> </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* --- POP-UP PROFESSIONNEL DE CONFIRMATION (MODAL) --- */}
//       {modalConfig.isOpen && (
//         <div style={modalOverlayStyle}>
//           <div style={modalContentStyle}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
//               <span style={{ fontSize: '24px' }}>⚠️</span>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Confirmation Réglementaire</h3>
//             </div>
            
//             <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
//               Êtes-vous sûr de vouloir approuver le compte de <strong>{modalConfig.username}</strong> ? 
//               Cette action enregistrera l'activation en BDD et publiera immédiatement un événement de création de compte bancaire dans le cluster <strong>RabbitMQ</strong>.
//             </p>

//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
//               <button 
//                 onClick={() => setModalConfig({ isOpen: false, userId: null, username: '' })} 
//                 style={{ ...modalBtn, backgroundColor: '#e2e8f0', color: '#475569' }}
//               >
//                 Annuler
//               </button>
//               <button 
//                 onClick={confirmApproval} 
//                 style={{ ...modalBtn, backgroundColor: '#10b981', color: 'white' }}
//               >
//                 Confirmer l'activation
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Reste des onglets conservés à l'identique */}
//        {activeSubTab === 'configs' && (
//         <div style={{ maxWidth: '600px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#b45309', marginTop: 0 }}>Paramétrage des Règles Métier de l'Établissement</h2>
//            <form onSubmit={e => { e.preventDefault(); alert('Règles appliquées instantanément via ms-config !'); }}>
//              <label style={labelStyle}>Plafond maximal par transfert inter-opérateur (XAF)</label>
//              <input type="number" defaultValue="5000000" style={inputStyle} />

//              <label style={labelStyle}>Taux de Commission appliqué aux transactions (%)</label>
//              <input type="number" step="0.1" defaultValue="1.5" style={inputStyle} />

//              <label style={labelStyle}>Seuil de validation managériale automatique</label>
//              <input type="number" defaultValue="1000000" style={inputStyle} />

//              <button type="submit" style={{ ...btnStyle, backgroundColor: '#d97706', width: '100%' }}>Sauvegarder et propager les modifications</button>
//           </form>
//          </div>
//        )}
//     </div>
//   );
// }

// // Styles inchangés et nouveaux styles pour la modale
// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', transition: 'all 0.3s ease' };
// const actBtn = { padding: '6px 12px', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };

// // Styles du Pop-up professionnel
// const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' };
// const modalContentStyle = { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)', maxWidth: '480px', width: '90%' };
// const modalBtn = { padding: '10px 16px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' };






// // import React, { useState } from 'react';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function OperatorDashboard() {
//   const [activeSubTab, setActiveSubTab] = useState('credits');
//   // const [requests, setRequests] = useState([
//   //   { id: '1', client: 'KAMGA Pierre', montant: 1500000, duree: '12 mois', scoreOCR: '98.4%', statut: 'EN_ATTENTE' },
//   //   { id: '2', client: 'NGO BIYHA Marie', montant: 500000, duree: '6 mois', scoreOCR: '92.1%', statut: 'APPROUVE' }
//   // ]);

//   // const handleAction = (id, newStatus) => {
//   //   setRequests(requests.map(r => r.id === id ? { ...r, statut: newStatus } : r));
//   //   alert(`Dossier mis à jour à l'état [${newStatus}]. Événement métier publié dans RabbitMQ.`);
//   // };

//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   // URL de votre API Gateway (Note : s'assurer du bon mapping avec /api/v1/users)
//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api";

//   // 2. useEffect pour charger les données réelles au chargement du composant
//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       // Appel GET pour récupérer tous les utilisateurs inscrits
//       const response = await axios.get(API_BASE_URL);
//       setRequests(response.data);
//       console.log("--use---");
//       console.log(response.data);
      
//       setError('');
//     } catch (err) {
//       console.error("Erreur de récupération :", err);
//       setError("Impossible de charger les données réelles depuis la Gateway.");
//     } finally {
//       setLoading(false);
//     }
//   };



//   // 3. handleAction modifié pour attaquer le bouton "Valider" sur le backend
//   const handleAction = async (id, newStatus) => {
//     if (newStatus === 'Approuve') { // ou 'APPROUVE' selon votre règle métier
//       try {
//         // Appel PUT vers l'endpoint exact du backend : /api/v1/users/{id}/valider
//         const response = await axios.put(`${API_BASE_URL}/valider/${id}`);
        
//         // Notification de succès
//         alert(response.data); 
        
//         // Rafraîchir la liste locale pour voir le changement de statut en direct
//         fetchUsers();
//       } catch (err) {
//         console.error("Erreur lors de la validation :", err);
//         alert(err.response?.data ? `Échec : ${err.response.data}` : "Erreur lors de la publication de l'événement.");
//       }
//     } else {
//       // Logique optionnelle pour d'autres actions (ex: rejeter)
//       setRequests(requests.map(r => r.id === id ? { ...r, statut: newStatus } : r));
//     }
//   };

//   if (loading) return <p style={{ padding: '20px' }}>Chargement des dossiers réelles depuis la Gateway...</p>;
//   if (error) return <p style={{ color: 'red', padding: '20px' }}>{error}</p>;

//   return (
//     <div>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'validercomptes' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('validercomptes')}>Validation des Dossiers de creation de comptes</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'credits' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('credits')}>Validation des Dossiers Crédits</button>
//         <button style={{ ...tabStyle, borderBottom: activeSubTab === 'configs' ? '3px solid #f59e0b' : 'none' }} onClick={() => setActiveSubTab('configs')}>Configuration des Plafonds & Commissions</button>
//       </div>


//     {/* private Long iUser;
//     private String nom;
//     private String prenom;
//     private String motDePasseChiffre;
//     private String role;
//     private String email;
//     private String dateNaissance;
//     private String status; */}


//         {activeSubTab === 'validercomptes' && (
//         <div>
//           <h2 style={{ color: '#1360d5' }}>Dossiers de creation de comptes en Attente de Décision</h2>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID Clients</th>
//                 <th style={thStyle}>Nom du Demandeurs</th>
//                 <th style={thStyle}>Prenom du Demandeurs</th>
//                 <th style={thStyle}>Roles</th>
//                 <th style={thStyle}>Emails</th>
//                 <th style={thStyle}>date de Naissance</th>
//                 <th style={thStyle}>Statut Actuel</th>
//                 <th style={thStyle}>Actions Réglementaires</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map(req => (
//                 <tr key={req.id}>
//                   <td style={tdStyle}>{req.iuser}</td>
//                   <td style={tdStyle}>{req.nom}</td>
//                   <td style={tdStyle}>{req.prenom}</td>
//                   <td style={tdStyle}>{req.role}</td>
//                   <td style={tdStyle}>{req.dateNaissance}</td>
//                   <td style={tdStyle}><span style={{ color: '#059669', fontWeight: 'bold' }}>{req.scoreOCR}</span></td>
//                   <td style={tdStyle}>
//                     <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: req.status === 'non' ? '#fef3c7' : '#d1fae5', color: req.status === 'non' ? '#b45309' : '#065f46' }}>
//                       {req.status}
//                     </span>
//                   </td>
//                   <td style={tdStyle}>
//                     {req.status === 'non' ? (
//                       <>
//                         <button onClick={() => handleAction(req.iuser, 'Approuve')} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
//                         <button onClick={() => handleAction(req.iuser, 'non')} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
//                       </>
//                     ) : (
//                       <span style={{ color: '#64748b', italic: 'true' }}>Traité</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}




//       {/* {activeSubTab === 'credits' && (
//         <div>
//           <h2 style={{ color: '#b45309' }}>Dossiers de Crédits en Attente de Décision</h2>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID Client</th>
//                 <th style={thStyle}>Nom du Demandeur</th>
//                 <th style={thStyle}>Montant Évalué</th>
//                 <th style={thStyle}>Durée</th>
//                 <th style={thStyle}>Confiance OCR (IA)</th>
//                 <th style={thStyle}>Statut Actuel</th>
//                 <th style={thStyle}>Actions Réglementaires</th>
//               </tr>
//             </thead>
//             <tbody>
//               {requests.map(req => (
//                 <tr key={req.id}>
//                   <td style={tdStyle}>{req.id}</td>
//                   <td style={tdStyle}>{req.client}</td>
//                   <td style={tdStyle}>{req.montant.toLocaleString()} XAF</td>
//                   <td style={tdStyle}>{req.duree}</td>
//                   <td style={tdStyle}><span style={{ color: '#059669', fontWeight: 'bold' }}>{req.scoreOCR}</span></td>
//                   <td style={tdStyle}>
//                     <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: req.statut === 'EN_ATTENTE' ? '#fef3c7' : '#d1fae5', color: req.statut === 'EN_ATTENTE' ? '#b45309' : '#065f46' }}>
//                       {req.statut}
//                     </span>
//                   </td>
//                   <td style={tdStyle}>
//                     {req.statut === 'EN_ATTENTE' ? (
//                       <>
//                         <button onClick={() => handleAction(req.id, 'APPROUVE')} style={{ ...actBtn, backgroundColor: '#10b981' }}>Approuver</button>
//                         <button onClick={() => handleAction(req.id, 'REJETE')} style={{ ...actBtn, backgroundColor: '#ef4444', marginLeft: '5px' }}>Rejeter</button>
//                       </>
//                     ) : (
//                       <span style={{ color: '#64748b', italic: 'true' }}>Traité</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )} */}

//       {activeSubTab === 'configs' && (
//         <div style={{ maxWidth: '600px', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#b45309', marginTop: 0 }}>Paramétrage des Règles Métier de l'Établissement</h2>
//           <form onSubmit={e => { e.preventDefault(); alert('Règles appliquées instantanément via ms-config !'); }}>
//             <label style={labelStyle}>Plafond maximal par transfert inter-opérateur (XAF)</label>
//             <input type="number" defaultValue="5000000" style={inputStyle} />

//             <label style={labelStyle}>Taux de Commission appliqué aux transactions (%)</label>
//             <input type="number" step="0.1" defaultValue="1.5" style={inputStyle} />

//             <label style={labelStyle}>Seuil de validation managériale automatique</label>
//             <input type="number" defaultValue="1000000" style={inputStyle} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#d97706', width: '100%' }}>Sauvegarder et propager les modifications</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const actBtn = { padding: '6px 12px', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer' };