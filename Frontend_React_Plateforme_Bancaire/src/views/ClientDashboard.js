import React, { useState, useEffect, useRef } from 'react'; // ✅ Ajout de useRef
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('comptes');
  const [loans, setLoans] = useState([]);

  // Form States
  const [transferForm, setTransferForm] = useState({ source: '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
  const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const [iduserconnecter, setIduserconnecter] = useState(null);
  const [info, setInfo] = useState(null);
  const [infocompte, setInfocompte] = useState(null);
  const [infotransaction, setInfotransaction] = useState([]); 
  const [loadingData, setLoadingData] = useState(true);

  // ✅ COFFRE-FORT MÉMOIRE : Conservera l'ID de manière immuable durant toute la session
  const idUserRef = useRef(null);

  const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
  const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";
  const API_BASE_URL_TRANSACTION = "http://localhost:8079/BANQUE-SERVICE-TRANSACTION/api";
  const API_BASE_URL_PRET = "http://localhost:8079/BANQUE-SERVICE-DEMANDEPRET/api";

  useEffect(() => {
    fetchUsersConnecter();
  }, []);

  const fetchUsersConnecter = async () => {
    try {
      setLoadingData(true);
      const response_user = await axios.get(API_BASE_URL);
      setInfo(response_user.data);
      
      if (response_user.data && response_user.data.iuser) {
        const userId = response_user.data.iuser; 
        
        // ✅ Double stockage : dans le State pour l'affichage, et dans le Ref pour la persistance
        setIduserconnecter(userId);
        idUserRef.current = userId; 

        const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${userId}`);
        setInfocompte(response_compte.data); 

        if (response_compte.data && response_compte.data.numeroCompte) {
          const response_transaction = await axios.get(`${API_BASE_URL_TRANSACTION}/${response_compte.data.numeroCompte}`);
          setInfotransaction(response_transaction.data || []);
          setTransferForm(prev => ({ ...prev, source: response_compte.data.numeroCompte }));
        }

        try {
          const response_prets = await axios.get(`${API_BASE_URL_PRET}/client/${userId}`);
          setLoans(response_prets.data || []);
        } catch (pretErr) {
          console.warn("Pas de prêts trouvés ou endpoint indisponible", pretErr);
        }
      }
    } catch (err) {
      console.error("Erreur de récupération des données utilisateur :", err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    Swal.fire({ title: 'Traitement en cours...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

    try {
      await axios.post(`${API_BASE_URLCOMPTE}`, {
        montant: parseFloat(transferForm.amount),
        idCompteSource: transferForm.source,
        idCompteDestination: transferForm.dest
      });
      
      setTransferForm({ source: infocompte ? infocompte.numeroCompte : '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
      Swal.fire({ icon: 'success', title: 'Virement réussi !', text: 'Mouvement validé.', confirmButtonColor: '#059669' });
      fetchUsersConnecter();
    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Échec', text: 'Erreur lors du virement.' });
    }
  };

  const handleLoanRequest = async (e) => {
    e.preventDefault();
    
    // ✅ Utilisation de la référence : impossible qu'elle soit vide si le fetch initial a réussi
    const userIdForJava = idUserRef.current;
    console.log("humm baka");
    console.log(userIdForJava);
    
    
    
    console.log("ID envoyé à la base de données Java :", userIdForJava);
  
    // Sécurité absolue
    if (!userIdForJava) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Session corrompue', 
        text: 'L\'identifiant client a été perdu par l\'interface React. Rechargement des données...' 
      });
      fetchUsersConnecter();
      return;
    }

    Swal.fire({
      title: 'Analyse de votre dossier...',
      text: 'Vérification de votre capacité de remboursement en cours',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      await axios.post(`${API_BASE_URL_PRET}`, {
        montantDemande: parseFloat(loanForm.amount),
        duree: parseInt(loanForm.duration),
        id_client1: userIdForJava // ✅ Garanti non-null et lisible par Spring Boot
      });
      
      setLoanForm({ amount: '', duration: '12', reason: '' });

      Swal.fire({
        icon: 'success',
        title: 'Demande Enregistrée !',
        html: `
          <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Statut :</strong> <span style="color: #0284c7; font-weight: bold;">En cours d'étude</span></p>
            <p style="margin: 4px 0;">Votre dossier a été transmis au service des engagements.</p>
          </div>
        `,
        confirmButtonText: 'Passer à la vérification IA / OCR',
        confirmButtonColor: '#0284c7',
        showCancelButton: true,
        cancelButtonText: 'Rester ici',
        cancelButtonColor: '#64748b'
      }).then((result) => {
        if (result.isConfirmed) {
          setActiveTab('ocr'); 
        }
      });

      fetchUsersConnecter();

    } catch (error) {
      console.error(error);
      Swal.fire({ icon: 'error', title: 'Anomalie Détectée', text: 'Impossible de soumettre votre demande.' });
    }
  };

  const handleOcrUpload = (e) => {
    e.preventDefault();
    if (!ocrFile) return alert('Veuillez sélectionner un document');
    setOcrLoading(true);
    setTimeout(() => {
      setOcrResult({ nom: 'KAMGA Pierre', cni_numero: '102938475-NW', salaire_detecte: '450,000 XAF', score_confiance: '98.4%', statut_authenticite: 'VALIDE' });
      setOcrLoading(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'block' }}>
      <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
        <div style={{ display: 'table-row' }}>
          <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
          <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
          <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
          <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
        </div>
      </div>

      {activeTab === 'comptes' && (
        <div>
          <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
          <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                {loadingData ? "Chargement profil..." : info ? `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}` : "Client Étranger"}
              </div>
            </div>

            {loadingData ? (
              <div style={{ display: 'table-cell', background: '#e2e8f0', color: '#475569', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>Chargement du compte...</div>
            ) : infocompte ? (
              <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur || 'Banque Digitale'}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{(infocompte.solde ?? 0).toLocaleString()} {infocompte.devise || 'XAF'}</div>
                <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
              </div>
            ) : (
              <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>Aucun compte actif trouvé</div>
            )}
          </div>

          <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={thStyle}>ID</th><th style={thStyle}>Type</th><th style={thStyle}>Montant</th><th style={thStyle}>Source</th><th style={thStyle}>Destination</th><th style={thStyle}>Date</th><th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {infotransaction && infotransaction.length > 0 ? (
                infotransaction.map(tx => (
                  <tr key={tx.idTransaction || Math.random()} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={tdStyle}>{tx.idTransaction}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 'bold' }}>{(tx.montant ?? 0).toLocaleString()} XAF</td>
                    <td style={tdStyle}>{tx.idCompteSource || 'N/A'}</td>
                    <td style={tdStyle}>{tx.idCompteDestination || 'N/A'}</td>
                    <td style={tdStyle}>{tx.dateCreation}</td>
                    <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '20px' }}>{loadingData ? "Chargement..." : "Aucune transaction."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'virement' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
          <form onSubmit={handleTransfer}>
            <label style={labelStyle}>Compte d'origine (Débit)</label>
            <select style={inputStyle} value={transferForm.source} onChange={e => setTransferForm({ ...transferForm, source: e.target.value })} disabled={!infocompte}>
              {infocompte ? <option value={infocompte.numeroCompte}>{infocompte.idOperateur || 'Banque'} - {infocompte.numeroCompte}</option> : <option value="">Chargement...</option>}
            </select>
            <label style={labelStyle}>Type de virement</label>
            <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
              <option value="TRANSFERT_INTRA">Intra-opérateur</option>
              <option value="TRANSFERT_INTER">Inter-opérateur</option>
            </select>
            <label style={labelStyle}>Compte Bénéficiaire</label>
            <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />
            <label style={labelStyle}>Montant (XAF)</label>
            <input type="number" placeholder="Montant" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter</button>
          </form>
        </div>
      )}

      {activeTab === 'prets' && (
        <div>
          <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
          <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
            <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
              <h3>Suivi de mes dossiers</h3>
              {loans && loans.length > 0 ? (
                loans.map(loan => (
                  <div key={loan.idPret || loan.id_pret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '5px solid #10b981' : '5px solid #0284c7', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'table', width: '100%' }}>
                      <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret || loan.id_pret}</div>
                      <div style={{ display: 'table-cell', textAlign: 'right' }}>
                        <span style={{ background: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '#d1fae5' : '#e0f2fe', color: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '#065f46' : '#0369a1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut || loan.status}</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
                      <p>Montant capital : <strong>{(loan.montantDemande || loan.montant_demande || 0).toLocaleString()} XAF</strong></p>
                      <p>Prochaine mensualité : <strong>{(loan.montantEcheance || loan.montant_echeance || 0).toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance || loan.date_echeance || 'En attente'})</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>Aucun dossier enregistré.</div>
              )}
            </div>
            
            <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
              <form onSubmit={handleLoanRequest}>
                <label style={labelStyle}>Montant souhaité</label>
                <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

                <label style={labelStyle}>Durée de remboursement (Mois)</label>
                <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
                  <option value="6">6 Mois</option>
                  <option value="12">12 Mois</option>
                  <option value="24">24 Mois</option>
                </select>

                <label style={labelStyle}>Justification / Projet</label>
                <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

                <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ocr' && (
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Téléversez votre document. Le microservice s'occupe du reste.</p>
          <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
            <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
            <br />
            <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR...' : 'Lancer l\'extraction'}</button>
          </form>
          {ocrResult && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat :</h3>
              <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
              <p><strong>N° CNI :</strong> {ocrResult.cni_numero}</p>
              <p><strong>Capacité financière :</strong> {ocrResult.salaire_detecte}</p>
              <p><strong>Statut :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };


// import React, { useState, useEffect, useId } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
//   const [loans, setLoans] = useState([]);

//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);

//   const [iduserconnecter, setIduserconnecter] = useState(null);
//   const [info, setInfo] = useState(null);
//   const [infocompte, setInfocompte] = useState(null);
//   const [infotransaction, setInfotransaction] = useState([]); 
//   const [loadingData, setLoadingData] = useState(true);

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";
//   const API_BASE_URL_TRANSACTION = "http://localhost:8079/BANQUE-SERVICE-TRANSACTION/api";
//   const API_BASE_URL_PRET = "http://localhost:8079/BANQUE-SERVICE-DEMANDEPRET/api";

//   useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
//       setLoadingData(true);
//       const response_user = await axios.get(API_BASE_URL);
//       setInfo(response_user.data);
      
//       if (response_user.data && response_user.data.iuser) {
//         const userId = response_user.data.iuser; 
//         console.log("iddd");
//         console.log(userId);
//         console.log(iduserconnecter);
        
        
        
//         setIduserconnecter(userId); // Sauvegarde l'ID (ex: 25)

//         const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${userId}`);
//         setInfocompte(response_compte.data); 

//         if (response_compte.data && response_compte.data.numeroCompte) {
//           const response_transaction = await axios.get(`${API_BASE_URL_TRANSACTION}/${response_compte.data.numeroCompte}`);
//           setInfotransaction(response_transaction.data || []);
//           setTransferForm(prev => ({ ...prev, source: response_compte.data.numeroCompte }));
//         }

//         try {
//           const response_prets = await axios.get(`${API_BASE_URL_PRET}/client/${userId}`);
//           setLoans(response_prets.data || []);
//         } catch (pretErr) {
//           console.warn("Pas de prêts trouvés ou endpoint indisponible", pretErr);
//         }
//       }
//     } catch (err) {
//       console.error("Erreur de récupération des données utilisateur :", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   const handleTransfer = async (e) => {
//     e.preventDefault();
//     Swal.fire({ title: 'Traitement en cours...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

//     try {
//       await axios.post(`${API_BASE_URLCOMPTE}`, {
//         montant: parseFloat(transferForm.amount),
//         idCompteSource: transferForm.source,
//         idCompteDestination: transferForm.dest
//       });
      
//       setTransferForm({ source: infocompte ? infocompte.numeroCompte : '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//       Swal.fire({ icon: 'success', title: 'Virement réussi !', text: 'Mouvement validé.', confirmButtonColor: '#059669' });
//       fetchUsersConnecter();
//     } catch (error) {
//       console.error(error);
//       Swal.fire({ icon: 'error', title: 'Échec', text: 'Erreur lors du virement.' });
//     }
//   };

//   // ✅ CORRIGÉ : Plus de second paramètre magique, la fonction utilise l'état global
//   const handleLoanRequest = async (e) => {
//     e.preventDefault();
//     console.log("teste id");
//     console.log(iduserconnecter);
    
  
//     // Sécurité anti-null
//     if (!iduserconnecter) {
//       Swal.fire({ icon: 'error', title: 'Session invalide', text: 'Impossible de récupérer votre ID client. Veuillez rafraîchir.' });
//       return;
//     }

//     Swal.fire({
//       title: 'Analyse de votre dossier...',
//       text: 'Vérification de votre capacité de remboursement en cours',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URL_PRET}`, {
//         montantDemande: parseFloat(loanForm.amount),
//         duree: parseInt(loanForm.duration),
//         id_client: iduserconnecter // ✅ Utilise l'ID conservé en mémoire
//       });
      
//       setLoanForm({ amount: '', duration: '12', reason: '' });

//       Swal.fire({
//         icon: 'success',
//         title: 'Demande Enregistrée !',
//         html: `
//           <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px;">
//             <p style="margin: 4px 0;"><strong>Statut :</strong> <span style="color: #0284c7; font-weight: bold;">En cours d'étude</span></p>
//             <p style="margin: 4px 0;">Votre dossier a été transmis au service des engagements. Veuillez téléverser vos justificatifs dans l'onglet OCR.</p>
//           </div>
//         `,
//         confirmButtonText: 'Passer à la vérification IA / OCR',
//         confirmButtonColor: '#0284c7',
//         showCancelButton: true,
//         cancelButtonText: 'Rester ici',
//         cancelButtonColor: '#64748b'
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setActiveTab('ocr'); 
//         }
//       });

//       fetchUsersConnecter();

//     } catch (error) {
//       console.error(error);
//       Swal.fire({ icon: 'error', title: 'Anomalie Détectée', text: 'Impossible de soumettre votre demande.' });
//     }
//   };

//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({ nom: 'KAMGA Pierre', cni_numero: '102938475-NW', salaire_detecte: '450,000 XAF', score_confiance: '98.4%', statut_authenticite: 'VALIDE' });
//       setOcrLoading(false);
//     }, 2000);
//   };

//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
//             <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//               <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
//               <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
//                 {loadingData ? "Chargement profil..." : info ? `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}` : "Client Étranger"}
//               </div>
//             </div>

//             {loadingData ? (
//               <div style={{ display: 'table-cell', background: '#e2e8f0', color: '#475569', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>Chargement du compte...</div>
//             ) : infocompte ? (
//               <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur || 'Banque Digitale'}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{(infocompte.solde ?? 0).toLocaleString()} {infocompte.devise || 'XAF'}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
//               </div>
//             ) : (
//               <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>Aucun compte actif trouvé</div>
//             )}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th><th style={thStyle}>Type</th><th style={thStyle}>Montant</th><th style={thStyle}>Source</th><th style={thStyle}>Destination</th><th style={thStyle}>Date</th><th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>
//               {infotransaction && infotransaction.length > 0 ? (
//                 infotransaction.map(tx => (
//                   <tr key={tx.idTransaction || Math.random()} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                     <td style={tdStyle}>{tx.idTransaction}</td>
//                     <td style={tdStyle}>
//                       <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span>
//                     </td>
//                     <td style={{ ...tdStyle, fontWeight: 'bold' }}>{(tx.montant ?? 0).toLocaleString()} XAF</td>
//                     <td style={tdStyle}>{tx.idCompteSource || 'N/A'}</td>
//                     <td style={tdStyle}>{tx.idCompteDestination || 'N/A'}</td>
//                     <td style={tdStyle}>{tx.dateCreation}</td>
//                     <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr><td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '20px' }}>{loadingData ? "Chargement..." : "Aucune transaction."}</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select style={inputStyle} value={transferForm.source} onChange={e => setTransferForm({ ...transferForm, source: e.target.value })} disabled={!infocompte}>
//               {infocompte ? <option value={infocompte.numeroCompte}>{infocompte.idOperateur || 'Banque'} - {infocompte.numeroCompte}</option> : <option value="">Chargement...</option>}
//             </select>
//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur</option>
//             </select>
//             <label style={labelStyle}>Compte Bénéficiaire</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />
//             <label style={labelStyle}>Montant (XAF)</label>
//             <input type="number" placeholder="Montant" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />
//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
//               {loans && loans.length > 0 ? (
//                 loans.map(loan => (
//                   <div key={loan.idPret || loan.id_pret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '5px solid #10b981' : '5px solid #0284c7', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                     <div style={{ display: 'table', width: '100%' }}>
//                       <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret || loan.id_pret}</div>
//                       <div style={{ display: 'table-cell', textAlign: 'right' }}>
//                         <span style={{ background: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '#d1fae5' : '#e0f2fe', color: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '#065f46' : '#0369a1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut || loan.status}</span>
//                       </div>
//                     </div>
//                     <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                       <p>Montant capital : <strong>{(loan.montantDemande || loan.montant_demande || 0).toLocaleString()} XAF</strong></p>
//                       <p>Prochaine mensualité : <strong>{(loan.montantEcheance || loan.montant_echeance || 0).toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance || loan.date_echeance || 'En attente'})</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>Aucun dossier enregistré.</div>
//               )}
//             </div>
            
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
              
//               {/* ✅ FIXÉ : Syntaxe propre de soumission */}
//               <form onSubmit={handleLoanRequest}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Téléversez votre document. Le microservice s'occupe du reste.</p>
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR...' : 'Lancer l\'extraction'}</button>
//           </form>
//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat :</h3>
//               <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//               <p><strong>N° CNI :</strong> {ocrResult.cni_numero}</p>
//               <p><strong>Capacité financière :</strong> {ocrResult.salaire_detecte}</p>
//               <p><strong>Statut :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
  
//   // Initialisé vide pour accueillir les vrais prêts du serveur
//   const [loans, setLoans] = useState([]);

//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);

//   const [iduserconnecter, setIduserconnecter] = useState(null);
//   const [info, setInfo] = useState(null);
//   const [infocompte, setInfocompte] = useState(null);
//   const [infotransaction, setInfotransaction] = useState([]); 
//   const [loadingData, setLoadingData] = useState(true);

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";
//   const API_BASE_URL_TRANSACTION = "http://localhost:8079/BANQUE-SERVICE-TRANSACTION/api";
//   const API_BASE_URL_PRET = "http://localhost:8079/BANQUE-SERVICE-DEMANDEPRET/api";

//   // Gestion du virement réel vers l'API
//   const handleTransfer = async (e) => {
//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URLCOMPTE}`, {
//         montant: parseFloat(transferForm.amount),
//         idCompteSource: transferForm.source,
//         idCompteDestination: transferForm.dest
//       });
      
//       setTransferForm({ 
//         source: infocompte ? infocompte.numeroCompte : '', 
//         dest: '', 
//         amount: '',
//         type: 'TRANSFERT_INTRA'
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Virement réussi !',
//         text: 'Le mouvement de fonds a bien été validé par le système distribué.',
//         confirmButtonColor: '#059669'
//       });

//       fetchUsersConnecter();

//     } catch (error) {
//       console.error(error);
//       Swal.fire({ 
//         icon: 'error', 
//         title: 'Échec', 
//         text: 'Erreur lors du traitement du virement par la Banque.' 
//       });
//     }
//   };



//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({
//         nom: 'KAMGA Pierre',
//         cni_numero: '102938475-NW',
//         salaire_detecte: '450,000 XAF',
//         score_confiance: '98.4%',
//         statut_authenticite: 'VALIDE'
//       });
//       setOcrLoading(false);
//     }, 2000);
//   };

//   useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
//       setLoadingData(true);
//       const response_user = await axios.get(API_BASE_URL);
//       setInfo(response_user.data);
//      // setIduserconnecter(response_user.data); 
//       const userId = response_user.data.iuser; 
//       setIduserconnecter(userId);
//       console.log("teste id ");
//       console.log(response_user.data.iuser);
//       console.log(userId);

//       if (response_user.data && response_user.data.iuser) {
//         const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${response_user.data.iuser}`);
//         setInfocompte(response_compte.data); 

//         if (response_compte.data && response_compte.data.numeroCompte) {
//           const response_transaction = await axios.get(`${API_BASE_URL_TRANSACTION}/${response_compte.data.numeroCompte}`);
//           setInfotransaction(response_transaction.data || []);
          
//           // Initialiser automatiquement la source du virement
//           setTransferForm(prev => ({ ...prev, source: response_compte.data.numeroCompte }));
//         }

//         // Récupération des vrais prêts du client depuis le microservice dédié
//         try {
//           const response_prets = await axios.get(`${API_BASE_URL_PRET}/client/${response_compte.data.iuser}`);
//           setLoans(response_prets.data || []);
//         } catch (pretErr) {
//           console.warn("Pas de prêts trouvés ou endpoint indisponible", pretErr);
//         }
//       }
//     } catch (err) {
//       console.error("Erreur de récupération des données utilisateur connecteur :", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };


//     // --- CORRECTION ET POP-UP PROFESSIONNELLE POUR LE PRÊT ---
//   const handleLoanRequest = async (e, iduserconnecter) => {
//     e.preventDefault();
    
//     // Loader de traitement
//     Swal.fire({
//       title: 'Analyse de votre dossier...',
//       text: 'Vérification de votre capacité de remboursement en cours',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       const response = await axios.post(`${API_BASE_URL_PRET}`, {
//         montantDemande: parseFloat(loanForm.amount),
//         duree: parseInt(loanForm.duration),
//         id_client: iduserconnecter
//       });
      
//       // Réinitialisation propre du formulaire de prêt
//       setLoanForm({ 
//         amount: '', 
//         duration: '12', 
//         reason: '' 
//       });

//       // Pop-up de confirmation professionnelle de style Fintech
//       Swal.fire({
//         icon: 'success',
//         title: 'Demande Enregistrée !',
//         html: `
//           <div style="text-align: left; background: #f8fafc; padding: 15px; borderRadius: 8px; border: 1px solid #e2e8f0; font-size: 14px;">
//             <p style="margin: 4px 0;"><strong>Statut :</strong> <span style="color: #0284c7; font-weight: bold;">En cours d'étude</span></p>
//             <p style="margin: 4px 0;">Votre dossier a été transmis au service des engagements. Veuillez téléverser vos justificatifs dans l'onglet OCR pour accélérer la validation.</p>
//           </div>
//         `,
//         confirmButtonText: 'Passer à la vérification IA / OCR',
//         confirmButtonColor: '#0284c7',
//         showCancelButton: true,
//         cancelButtonText: 'Rester ici',
//         cancelButtonColor: '#64748b'
//       }).then((result) => {
//         if (result.isConfirmed) {
//           setActiveTab('ocr'); // Redirection automatique intelligente
//         }
//       });

//       // Re-fetch global pour mettre à jour la liste des prêts à l'écran
//       fetchUsersConnecter();

//     } catch (error) {
//       console.error(error);
//       Swal.fire({ 
//         icon: 'error', 
//         title: 'Anomalie Détectée', 
//         text: 'Impossible de soumettre votre demande de prêt pour le moment. Veuillez réessayer.' 
//       });
//     }
//   };

//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            
//             <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//               <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
//               <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
//                 {loadingData ? (
//                   "Chargement profil..."
//                 ) : info ? (
//                   `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}`
//                 ) : (
//                   "Client Étranger"
//                 )}
//               </div>
//             </div>

//             {loadingData ? (
//               <div style={{ display: 'table-cell', background: '#e2e8f0', color: '#475569', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Chargement du compte...
//               </div>
//             ) : infocompte ? (
//               <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur || 'Banque Digitale'}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{(infocompte.solde ?? 0).toLocaleString()} {infocompte.devise || 'XAF'}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
//               </div>
//             ) : (
//               <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Aucun compte actif trouvé
//               </div>
//             )}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Type</th>
//                 <th style={thStyle}>Montant</th>
//                 <th style={thStyle}>Source</th>
//                 <th style={thStyle}>Destination</th>
//                 <th style={thStyle}>Date</th>
//                 <th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>
//               {infotransaction && infotransaction.length > 0 ? (
//                 infotransaction.map(tx => (
//                   <tr key={tx.idTransaction || Math.random()} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                     <td style={tdStyle}>{tx.idTransaction}</td>
//                     <td style={tdStyle}>
//                       <span style={{ 
//                         padding: '4px 8px', 
//                         borderRadius: '4px', 
//                         fontSize: '12px', 
//                         background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', 
//                         color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' 
//                       }}>
//                         {tx.type}
//                       </span>
//                     </td>
//                     <td style={{ ...tdStyle, fontWeight: 'bold' }}>{(tx.montant ?? 0).toLocaleString()} XAF</td>
//                     <td style={tdStyle}>{tx.idCompteSource || 'N/A'}</td>
//                     <td style={tdStyle}>{tx.idCompteDestination || 'N/A'}</td>
//                     <td style={tdStyle}>{tx.dateCreation}</td>
//                     <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '20px' }}>
//                     {loadingData ? "Chargement de l'historique..." : "Aucune transaction enregistrée pour ce compte."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select 
//               style={inputStyle} 
//               value={transferForm.source} 
//               onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}
//               disabled={!infocompte}
//             >
//               {infocompte ? (
//                 <option value={infocompte.numeroCompte}>
//                   {infocompte.idOperateur || 'Banque'} - {infocompte.numeroCompte}
//                 </option>
//               ) : (
//                 <option value="">Chargement de votre compte...</option>
//               )}
//             </select>

//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
//             </select>

//             <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

//             <label style={labelStyle}>Montant de la transaction (XAF)</label>
//             <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
              
//               {loans && loans.length > 0 ? (
//                 loans.map(loan => (
//                   <div key={loan.idPret || loan.id_pret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '5px solid #10b981' : '5px solid #0284c7', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                     <div style={{ display: 'table', width: '100%' }}>
//                       <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret || loan.id_pret}</div>
//                       <div style={{ display: 'table-cell', textAlign: 'right' }}>
//                         <span style={{ 
//                           background: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '#d1fae5' : '#e0f2fe', 
//                           color: loan.status === 'APPROUVE' || loan.statut === 'APPROUVE' ? '#065f46' : '#0369a1', 
//                           padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' 
//                         }}>
//                           {loan.statut || loan.status}
//                         </span>
//                       </div>
//                     </div>
//                     <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                       <p>Montant capital : <strong>{(loan.montantDemande || loan.montant_demande || 0).toLocaleString()} XAF</strong></p>
//                       <p>Prochaine mensualité : <strong>{(loan.montantEcheance || loan.montant_echeance || 0).toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance || loan.date_echeance || 'En attente'})</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
//                   Aucun dossier de crédit enregistré.
//                 </div>
//               )}
//             </div>
            
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
//               <form onSubmit={handleLoanRequest,(iduserconnecter)}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
//           </form>

//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
//               <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
//                 <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//                 <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
//                 <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
//                 <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
//                 <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
//   const [loans, setLoans] = useState([
//     { idPret: '501', montantDemande: 1500000, statut: 'APPROUVE', dateEcheance: '2026-07-18', montantEcheance: 135000, estPaye: false }
//   ]);

//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);

//   const [iduserconnecter, setIduserconnecter] = useState(null);
//     const [info, setInfo] = useState(null);
//   const [infocompte, setInfocompte] = useState(null);
//   const [infotransaction, setInfotransaction] = useState([]); // Initialisé avec un tableau vide pour éviter les crashs de .map
//   const [loadingData, setLoadingData] = useState(true);

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";
//   const API_BASE_URL_TRANSACTION = "http://localhost:8079/BANQUE-SERVICE-TRANSACTION/api";
//   const API_BASE_URL_PRET = "http://localhost:8079/BANQUE-SERVICE-DEMANDEPRET/api";

//   // Gestion du virement réel vers l'API
//   const handleTransfer = async (e) => {
//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URLCOMPTE}`, {
//         montant: parseFloat(transferForm.amount),
//         idCompteSource: transferForm.source,
//         idCompteDestination: transferForm.dest
//       });
      
//       setTransferForm({ 
//         source: infocompte ? infocompte.numeroCompte : '', 
//         dest: '', 
//         amount: '',
//         type: 'TRANSFERT_INTRA'
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Virement réussi !',
//         text: 'Le mouvement de fonds a bien été validé par le système distribué.',
//         confirmButtonColor: '#059669'
//       });

//       // Rafraîchir les soldes et l'historique après la transaction
//       fetchUsersConnecter();

//     } catch (error) {
//       console.error(error);
//       Swal.fire({ 
//         icon: 'error', 
//         title: 'Échec', 
//         text: 'Erreur lors du traitement du virement par la Banque.' 
//       });
//     }
//   };

//   const handleLoanRequest = (e) => {
//     // e.preventDefault();
//     // const newLoan = {
//     //   idPret: String(Date.now()),
//     //   montantDemande: parseFloat(loanForm.amount),
//     //   statut: 'SOUMIS',
//     //   dateEcheance: 'Évaluation en cours...',
//     //   montantEcheance: 0,
//     //   estPaye: false
//     // };
//     // setLoans([newLoan, ...loans]);
//     // alert('Demande de crédit enregistrée. En attente de l\'analyse de vos pièces justificatives.');
//     // setActiveTab('ocr');



//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URL_PRET}`, {
//         montantDemande: parseFloat(loanForm.amount),
//         duree: loanForm.duration,
//         id_client: iduserconnecter
//       });
      
//       setTransferForm({ 
//         source: loanForm ? loanForm.id_client : '', 
//         dest: '', 
//         amount: '',
//         type: 'TRANSFERT_INTRA'
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Virement réussi !',
//         text: 'Le mouvement de fonds a bien été validé par le système distribué.',
//         confirmButtonColor: '#059669'
//       });

//       // Rafraîchir les soldes et l'historique après la transaction
//       fetchUsersConnecter();

//     } catch (error) {
//       console.error(error);
//       Swal.fire({ 
//         icon: 'error', 
//         title: 'Échec', 
//         text: 'Erreur lors du traitement du pret par la Banque.' 
//       });
//     }






//   };

//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({
//         nom: 'KAMGA Pierre',
//         cni_numero: '102938475-NW',
//         salaire_detecte: '450,000 XAF',
//         score_confiance: '98.4%',
//         statut_authenticite: 'VALIDE'
//       });
//       setOcrLoading(false);
//     }, 2000);
//   };

//   useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
//       setLoadingData(true);
//       const response_user = await axios.get(API_BASE_URL);
//       setInfo(response_user.data);

//       if (response_user.data && response_user.data.iuser) {
//         const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${response_user.data.iuser}`);
//         setInfocompte(response_compte.data); 
//         setIduserconnecter(response_compte.data.iuser); 
        
//         if (response_compte.data && response_compte.data.numeroCompte) {
//           const response_transaction = await axios.get(`${API_BASE_URL_TRANSACTION}/${response_compte.data.numeroCompte}`);
//           setInfotransaction(response_transaction.data || []);
          
//           // Initialiser automatiquement la source du virement
//           setTransferForm(prev => ({ ...prev, source: response_compte.data.numeroCompte }));
//         }
//       }
//     } catch (err) {
//       console.error("Erreur de récupération des données utilisateur connecteur :", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            
//             <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//               <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
//               <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
//                 {loadingData ? (
//                   "Chargement profil..."
//                 ) : info ? (
//                   `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}`
//                 ) : (
//                   "Client Étranger"
//                 )}
//               </div>
//             </div>

//             {loadingData ? (
//               <div style={{ display: 'table-cell', background: '#e2e8f0', color: '#475569', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Chargement du compte...
//               </div>
//             ) : infocompte ? (
//               <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur || 'Banque Digitale'}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{(infocompte.solde ?? 0).toLocaleString()} {infocompte.devise || 'XAF'}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
//               </div>
//             ) : (
//               <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Aucun compte actif trouvé
//               </div>
//             )}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Type</th>
//                 <th style={thStyle}>Montant</th>
//                 <th style={thStyle}>Source</th>
//                 <th style={thStyle}>Destination</th>
//                 <th style={thStyle}>Date</th>
//                 <th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>
//               {/* Ajout d'une vérification de longueur de liste pour éviter les tables vides ou cassées */}
//               {infotransaction && infotransaction.length > 0 ? (
//                 infotransaction.map(tx => (
//                   <tr key={tx.idTransaction || Math.random()} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                     <td style={tdStyle}>{tx.idTransaction}</td>
//                     <td style={tdStyle}>
//                       <span style={{ 
//                         padding: '4px 8px', 
//                         borderRadius: '4px', 
//                         fontSize: '12px', 
//                         background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', 
//                         color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' 
//                       }}>
//                         {tx.type}
//                       </span>
//                     </td>
//                     <td style={{ ...tdStyle, fontWeight: 'bold' }}>{(tx.montant ?? 0).toLocaleString()} XAF</td>
//                     <td style={tdStyle}>{tx.idCompteSource || 'N/A'}</td>
//                     <td style={tdStyle}>{tx.idCompteDestination || 'N/A'}</td>
//                     <td style={tdStyle}>{tx.dateCreation}</td>
//                     <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" style={{ ...tdStyle, textAlign: 'center', color: '#64748b', padding: '20px' }}>
//                     {loadingData ? "Chargement de l'historique..." : "Aucune transaction enregistrée pour ce compte."}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select 
//               style={inputStyle} 
//               value={transferForm.source} 
//               onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}
//               disabled={!infocompte}
//             >
//               {infocompte ? (
//                 <option value={infocompte.numeroCompte}>
//                   {infocompte.idOperateur || 'Banque'} - {infocompte.numeroCompte}
//                 </option>
//               ) : (
//                 <option value="">Chargement de votre compte...</option>
//               )}
//             </select>

//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
//             </select>

//             <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

//             <label style={labelStyle}>Montant de la transaction (XAF)</label>
//             <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
//               {loans.map(loan => (
//                 <div key={loan.idPret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                   <div style={{ display: 'table', width: '100%' }}>
//                     <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret}</div>
//                     <div style={{ display: 'table-cell', textAlign: 'right' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut}</span></div>
//                   </div>
//                   <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                     <p>Montant capital : <strong>{loan.montantDemande.toLocaleString()} XAF</strong></p>
//                     <p>Prochaine mensualité : <strong>{loan.montantEcheance.toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance})</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
//               <form onSubmit={handleLoanRequest}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
//           </form>

//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
//               <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
//                 <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//                 <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
//                 <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
//                 <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
//                 <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Swal from 'sweetalert2'; // 1. Importation indispensable de SweetAlert2

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
//   const [accounts, setAccounts] = useState([
//     { idCompte: '1', numeroCompte: 'CM-MTN-87632', solde: 450000, devise: 'XAF', typeCompte: 'COURANT', idOperateur: 'MTN Mobile Money' },
//     { idCompte: '2', numeroCompte: 'CM-ORNG-12984', solde: 75000, devise: 'XAF', typeCompte: 'EPARGNE', idOperateur: 'Orange Money' }
//   ]);
//   const [transactions, setTransactions] = useState([
//     { idTransaction: '101', type: 'DEPOT', montant: 50000, dateCreation: '2026-06-15 10:23', statut: 'TERMINE', idCompteSource: 'N/A', idCompteDestination: 'CM-MTN-87632' },
//     { idTransaction: '102', type: 'TRANSFERT_INTER', montant: 12000, dateCreation: '2026-06-17 14:02', statut: 'TERMINE', idCompteSource: 'CM-MTN-87632', idCompteDestination: 'CM-ORNG-12984' }
//   ]);
//   const [loans, setLoans] = useState([
//     { idPret: '501', montantDemande: 1500000, statut: 'APPROUVE', dateEcheance: '2026-07-18', montantEcheance: 135000, estPaye: false }
//   ]);

//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: '', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);

//   const [info, setInfo] = useState(null);
//   const [infocompte, setInfocompte] = useState(null);
//   const [infotransaction, setInfotransaction] = useState(null);
//   const [loadingData, setLoadingData] = useState(true);

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";
//   const API_BASE_URL_TRANSACTION = "http://localhost:8079/BANQUE-SERVICE-TRANSACTION/api";

//   // Gestion du virement réel vers l'API
//   const handleTransfer = async (e) => {
//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URLCOMPTE}`, {
//         montant: parseFloat(transferForm.amount),
//         idCompteSource: transferForm.source,
//         idCompteDestination: transferForm.dest
//       });
      
//       // 2. Correction de la réinitialisation en respectant la structure de l'état "transferForm"
//       setTransferForm({ 
//         source: infocompte ? infocompte.numeroCompte : '', 
//         dest: '', 
//         amount: '',
//         type: 'TRANSFERT_INTRA'
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Virement réussi !',
//         text: 'Le mouvement de fonds a bien été validé par le système distribué.',
//         confirmButtonColor: '#059669'
//       });

//       // Optionnel: Re-fetch les données du compte pour mettre le solde à jour sur l'IHM
//       fetchUsersConnecter();

//     } catch (error) {
//       console.error(error);
//       Swal.fire({ 
//         icon: 'error', 
//         title: 'Échec', 
//         text: 'Erreur lors du traitement du virement par la Banque.' 
//       });
//     }
//   };

//   const handleLoanRequest = (e) => {
//     e.preventDefault();
//     const newLoan = {
//       idPret: String(Date.now()),
//       montantDemande: parseFloat(loanForm.amount),
//       statut: 'SOUMIS',
//       dateEcheance: 'Évaluation en cours...',
//       montantEcheance: 0,
//       estPaye: false
//     };
//     setLoans([newLoan, ...loans]);
//     alert('Demande de crédit enregistrée. En attente de l\'analyse de vos pièces justificatives.');
//     setActiveTab('ocr');
//   };

//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({
//         nom: 'KAMGA Pierre',
//         cni_numero: '102938475-NW',
//         salaire_detecte: '450,000 XAF',
//         score_confiance: '98.4%',
//         statut_authenticite: 'VALIDE'
//       });
//       setOcrLoading(false);
//     }, 2000);
//   };

//   useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
//       setLoadingData(true);
//       const response_user = await axios.get(API_BASE_URL);
//       setInfo(response_user.data);
//       console.log("+++transaction++" );
//       console.log(response_user.data);
      
      

//       if (response_user.data && response_user.data.iuser) {
//         const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${response_user.data.iuser}`);
//         const response_transaction = await axios.get(`${API_BASE_URL_TRANSACTION}/${response_compte.data.numeroCompte}`);
//         console.log("+++transaction++" );
//         console.log(response_compte.data);
//         console.log("+++transaction22++" );
//         console.log(response_transaction.data);
//         setInfocompte(response_compte.data); 
//         setInfotransaction(response_transaction.data)
        
//         // Initialiser automatiquement la source du virement avec le numéro de compte reçu
//         if (response_compte.data) {
//           setTransferForm(prev => ({ ...prev, source: response_compte.data.numeroCompte }));
//         }
//       }
//     } catch (err) {
//       console.error("Erreur de récupération des données utilisateur connecteur :", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            
//             <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//               <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
//               <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
//                 {loadingData ? (
//                   "Chargement profil..."
//                 ) : info ? (
//                   `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}`
//                 ) : (
//                   "Client Étranger"
//                 )}
//               </div>
//             </div>

//             {loadingData ? (
//               <div style={{ display: 'table-cell', background: '#e2e8f0', color: '#475569', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Chargement du compte...
//               </div>
//             ) : infocompte ? (
//               <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur || 'Banque Digitale'}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{(infocompte.solde ?? 0).toLocaleString()} {infocompte.devise || 'XAF'}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
//               </div>
//             ) : (
//               <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Aucun compte actif trouvé
//               </div>
//             )}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Type</th>
//                 <th style={thStyle}>Montant</th>
//                 <th style={thStyle}>Source</th>
//                 <th style={thStyle}>Destination</th>
//                 <th style={thStyle}>Date</th>
//                 <th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>

//               {infotransaction.map(tx => (
//                 <tr key={tx.idTransaction} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                   <td style={tdStyle}>{tx.idTransaction}</td>
//                   <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span></td>
//                   <td style={{ ...tdStyle, fontWeight: 'bold' }}>{tx.montant.toLocaleString()} XAF</td>
//                   <td style={tdStyle}>{tx.idCompteSource}</td>
//                   <td style={tdStyle}>{tx.idCompteDestination}</td>
//                   <td style={tdStyle}>{tx.dateCreation}</td>
//                   <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select 
//               style={inputStyle} 
//               value={transferForm.source} 
//               onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}
//               disabled={!infocompte}
//             >
//               {infocompte ? (
//                 <option value={infocompte.numeroCompte}>
//                   {infocompte.idOperateur || 'Banque'} - {infocompte.numeroCompte}
//                 </option>
//               ) : (
//                 <option value="">Chargement de votre compte...</option>
//               )}
//             </select>

//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
//             </select>

//             <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

//             <label style={labelStyle}>Montant de la transaction (XAF)</label>
//             <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
//               {loans.map(loan => (
//                 <div key={loan.idPret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                   <div style={{ display: 'table', width: '100%' }}>
//                     <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret}</div>
//                     <div style={{ display: 'table-cell', textAlign: 'right' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut}</span></div>
//                   </div>
//                   <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                     <p>Montant capital : <strong>{loan.montantDemande.toLocaleString()} XAF</strong></p>
//                     <p>Prochaine mensualité : <strong>{loan.montantEcheance.toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance})</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
//               <form onSubmit={handleLoanRequest}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
//           </form>

//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
//               <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
//                 <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//                 <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
//                 <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
//                 <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
//                 <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
//   const [accounts, setAccounts] = useState([
//     { idCompte: '1', numeroCompte: 'CM-MTN-87632', solde: 450000, devise: 'XAF', typeCompte: 'COURANT', idOperateur: 'MTN Mobile Money' },
//     { idCompte: '2', numeroCompte: 'CM-ORNG-12984', solde: 75000, devise: 'XAF', typeCompte: 'EPARGNE', idOperateur: 'Orange Money' }
//   ]);
//   const [transactions, setTransactions] = useState([
//     { idTransaction: '101', type: 'DEPOT', montant: 50000, dateCreation: '2026-06-15 10:23', statut: 'TERMINE', idCompteSource: 'N/A', idCompteDestination: 'CM-MTN-87632' },
//     { idTransaction: '102', type: 'TRANSFERT_INTER', montant: 12000, dateCreation: '2026-06-17 14:02', statut: 'TERMINE', idCompteSource: 'CM-MTN-87632', idCompteDestination: 'CM-ORNG-12984' }
//   ]);
//   const [loans, setLoans] = useState([
//     { idPret: '501', montantDemande: 1500000, statut: 'APPROUVE', dateEcheance: '2026-07-18', montantEcheance: 135000, estPaye: false }
//   ]);

//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);

//   const [info, setInfo] = useState(null);
//   const [infocompte, setInfocompte] = useState(null);
//   const [loadingData, setLoadingData] = useState(true);

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";


//     // 1️ GESTION DE L'INSCRIPTION / ENREGISTREMENT
//   const handleTransfer = async (e) => {
//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       // Le DTO global contient les informations utilisateur + les choix de compte
//       await axios.post(`${API_BASE_URLCOMPTE}`, {
//               montant: parseFloat(transferForm.amount),
//               idCompteSource: transferForm.source,
//               idCompteDestination: transferForm.dest
//       });
      
//       setIsRegisterOpen(false);
      
//       // Réinitialisation complète de l'état
//       setTransferForm({ 
//         montant: '', 
//         idCompteSource: '', 
//         idCompteDestination: '', 
        
//       });

//       Swal.fire({
//         icon: 'success',
//         title: 'Enregistrement réussi !',
//         text: 'Les données ont bien été soumises au système distribué.',
//         confirmButtonColor: '#1e3a8a'
//       });
//     } catch (error) {
//       Swal.fire({ icon: 'error', title: 'Échec', text: 'Erreur lors de l\'enregistrement.' });
//     }
//   };




//   // const handleTransfer = (e) => {
//   //   e.preventDefault();
//   //   const newTx = {
//   //     idTransaction: String(Date.now()),
//   //     type: transferForm.type,
//   //     montant: parseFloat(transferForm.amount),
//   //     dateCreation: new Date().toISOString().replace('T', ' ').substring(0, 16),
//   //     statut: 'TERMINE',
//   //     idCompteSource: transferForm.source,
//   //     idCompteDestination: transferForm.dest
//   //   };
//   //   setTransactions([newTx, ...transactions]);
//   //   setAccounts(accounts.map(acc => {
//   //     if (acc.numeroCompte === transferForm.source) return { ...acc, solde: acc.solde - parseFloat(transferForm.amount) };
//   //     if (acc.numeroCompte === transferForm.dest) return { ...acc, solde: acc.solde + parseFloat(transferForm.amount) };
//   //     return acc;
//   //   }));
//   //   alert('Transaction traitée avec succès et notifiée via RabbitMQ !');
//   //   setTransferForm({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   // };



//   const handleLoanRequest = (e) => {
//     e.preventDefault();
//     const newLoan = {
//       idPret: String(Date.now()),
//       montantDemande: parseFloat(loanForm.amount),
//       statut: 'SOUMIS',
//       dateEcheance: 'Évaluation en cours...',
//       montantEcheance: 0,
//       estPaye: false
//     };
//     setLoans([newLoan, ...loans]);
//     alert('Demande de crédit enregistrée. En attente de l\'analyse de vos pièces justificatives.');
//     setActiveTab('ocr');
//   };

//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({
//         nom: 'KAMGA Pierre',
//         cni_numero: '102938475-NW',
//         salaire_detecte: '450,000 XAF',
//         score_confiance: '98.4%',
//         statut_authenticite: 'VALIDE'
//       });
//       setOcrLoading(false);
//     }, 2000);
//   };

//   useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
//       setLoadingData(true);
//       const response_user = await axios.get(API_BASE_URL);
//       setInfo(response_user.data);

//       if (response_user.data && response_user.data.iuser) {
//         const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${response_user.data.iuser}`);
//         setInfocompte(response_compte.data); 
//       }
//     } catch (err) {
//       console.error("Erreur de récupération des données utilisateur connecteur :", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            
//             <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//               <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
//               <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
//                 {loadingData ? (
//                   "Chargement profil..."
//                 ) : info ? (
//                   `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}`
//                 ) : (
//                   "Client Étranger"
//                 )}
//               </div>

//               {/* <div style={{ fontSize: '14px', opacity: 0.9 }}>{info.email || 'Banque Digitale'}</div> */}
//             </div>

//             {/* Rendu sécurisé de l'unique compte récupéré depuis l'API */}
//             {loadingData ? (
//               <div style={{ display: 'table-cell', background: '#e2e8f0', color: '#475569', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Chargement du compte...
//               </div>
//             ) : infocompte ? (
//               <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur || 'Banque Digitale'}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{(infocompte.solde ?? 0).toLocaleString()} {infocompte.devise || 'XAF'}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
//               </div>
//             ) : (
//               <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '20px', borderRadius: '12px', width: '50%', textAlign: 'center' }}>
//                 Aucun compte actif trouvé
//               </div>
//             )}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Type</th>
//                 <th style={thStyle}>Montant</th>
//                 <th style={thStyle}>Source</th>
//                 <th style={thStyle}>Destination</th>
//                 <th style={thStyle}>Date</th>
//                 <th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map(tx => (
//                 <tr key={tx.idTransaction} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                   <td style={tdStyle}>{tx.idTransaction}</td>
//                   <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span></td>
//                   <td style={{ ...tdStyle, fontWeight: 'bold' }}>{tx.montant.toLocaleString()} XAF</td>
//                   <td style={tdStyle}>{tx.idCompteSource}</td>
//                   <td style={tdStyle}>{tx.idCompteDestination}</td>
//                   <td style={tdStyle}>{tx.dateCreation}</td>
//                   <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             {/* <select style={inputStyle} value={transferForm.source} onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}>
//               {infocompte.map(acc => <option key={acc.idCompte} value={acc.numeroCompte}>{acc.idOperateur} - {acc.numeroCompte}</option>)}
//             </select> */}

//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select 
//               style={inputStyle} 
//               value={transferForm.source} 
//               onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}
//             >
//               {infocompte ? (
//                 <option value={infocompte.numeroCompte}>
//                   {infocompte.idOperateur || 'Banque'} - {infocompte.numeroCompte}
//                 </option>
//               ) : (
//                 <option value="">Chargement de votre compte...</option>
//               )}
//             </select>



//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
//             </select>

//             <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

//             <label style={labelStyle}>Montant de la transaction (XAF)</label>
//             <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
//               {loans.map(loan => (
//                 <div key={loan.idPret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                   <div style={{ display: 'table', width: '100%' }}>
//                     <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret}</div>
//                     <div style={{ display: 'table-cell', textAlign: 'right' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut}</span></div>
//                   </div>
//                   <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                     <p>Montant capital : <strong>{loan.montantDemande.toLocaleString()} XAF</strong></p>
//                     <p>Prochaine mensualité : <strong>{loan.montantEcheance.toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance})</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
//               <form onSubmit={handleLoanRequest}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
//           </form>

//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
//               <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
//                 <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//                 <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
//                 <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
//                 <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
//                 <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
//   const [accounts, setAccounts] = useState([
//     { idCompte: '1', numeroCompte: 'CM-MTN-87632', solde: 450000, devise: 'XAF', typeCompte: 'COURANT', idOperateur: 'MTN Mobile Money' },
//     { idCompte: '2', numeroCompte: 'CM-ORNG-12984', solde: 75000, devise: 'XAF', typeCompte: 'EPARGNE', idOperateur: 'Orange Money' }
//   ]);
//   const [transactions, setTransactions] = useState([
//     { idTransaction: '101', type: 'DEPOT', montant: 50000, dateCreation: '2026-06-15 10:23', statut: 'TERMINE', idCompteSource: 'N/A', idCompteDestination: 'CM-MTN-87632' },
//     { idTransaction: '102', type: 'TRANSFERT_INTER', montant: 12000, dateCreation: '2026-06-17 14:02', statut: 'TERMINE', idCompteSource: 'CM-MTN-87632', idCompteDestination: 'CM-ORNG-12984' }
//   ]);
//   const [loans, setLoans] = useState([
//     { idPret: '501', montantDemande: 1500000, statut: 'APPROUVE', dateEcheance: '2026-07-18', montantEcheance: 135000, estPaye: false }
//   ]);

//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);

//   // Correction de l'initialisation pour éviter les plantages de lecture
//   const [info, setInfo] = useState(null);
//   const [infocompte, setInfocompte] = useState(null);
//   const [loadingData, setLoadingData] = useState(true);

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";

//   const handleTransfer = (e) => {
//     e.preventDefault();
//     const newTx = {
//       idTransaction: String(Date.now()),
//       type: transferForm.type,
//       montant: parseFloat(transferForm.amount),
//       dateCreation: new Date().toISOString().replace('T', ' ').substring(0, 16),
//       statut: 'TERMINE',
//       idCompteSource: transferForm.source,
//       idCompteDestination: transferForm.dest
//     };
//     setTransactions([newTx, ...transactions]);
//     setAccounts(accounts.map(acc => {
//       if (acc.numeroCompte === transferForm.source) return { ...acc, solde: acc.solde - parseFloat(transferForm.amount) };
//       if (acc.numeroCompte === transferForm.dest) return { ...acc, solde: acc.solde + parseFloat(transferForm.amount) };
//       return acc;
//     }));
//     alert('Transaction traitée avec succès et notifiée via RabbitMQ !');
//     setTransferForm({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   };

//   const handleLoanRequest = (e) => {
//     e.preventDefault();
//     const newLoan = {
//       idPret: String(Date.now()),
//       montantDemande: parseFloat(loanForm.amount),
//       statut: 'SOUMIS',
//       dateEcheance: 'Évaluation en cours...',
//       montantEcheance: 0,
//       estPaye: false
//     };
//     setLoans([newLoan, ...loans]);
//     alert('Demande de crédit enregistrée. En attente de l\'analyse de vos pièces justificatives.');
//     setActiveTab('ocr');
//   };

//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({
//         nom: 'KAMGA Pierre',
//         cni_numero: '102938475-NW',
//         salaire_detecte: '450,000 XAF',
//         score_confiance: '98.4%',
//         statut_authenticite: 'VALIDE'
//       });
//       setOcrLoading(false);
//     }, 2000);
//   };

//   useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
//       setLoadingData(true);
//       const response_user = await axios.get(API_BASE_URL);
//       console.log("i---teste id---");
//       console.log(response_user.data);
//       console.log(response_user.data.iuser);
      
      
//       setInfo(response_user.data);

//       if (response_user.data && response_user.data.iuser) {
//         const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${response_user.data.iuser}`);
//               console.log("i---teste id compte---");
//         console.log(response_compte.data);
//      //   console.log(response_user.data.iuser);
//         setInfocompte(response_compte.data); // Ajout du .data obligatoire
//       }
//     } catch (err) {
//       console.error("Erreur de récupération des données utilisateur connecteur :", err);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            
//             {/* Ajout d'un garde-fou pendant le chargement de l'API */}
//             <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//               <div style={{ fontSize: '14px', opacity: 0.9 }}>Vos informations</div>
//               <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
//                 {loadingData ? (
//                   "Chargement profil..."
//                 ) : info ? (
//                   `${info.nom?.toUpperCase()} ${info.prenom?.toUpperCase()}`
//                 ) : (
//                   "Client Étranger"
//                 )}
//               </div>
//             </div>

//           {/* //  {infocompte.map(acc => ( */}
//               <div  style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{infocompte.idOperateur}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{infocompte.solde.toLocaleString()} {infocompte.devise}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {infocompte.numeroCompte} ({infocompte.typeCompte})</div>
//               </div>
//             {/*  // ))} */}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Type</th>
//                 <th style={thStyle}>Montant</th>
//                 <th style={thStyle}>Source</th>
//                 <th style={thStyle}>Destination</th>
//                 <th style={thStyle}>Date</th>
//                 <th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map(tx => (
//                 <tr key={tx.idTransaction} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                   <td style={tdStyle}>{tx.idTransaction}</td>
//                   <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span></td>
//                   <td style={{ ...tdStyle, fontWeight: 'bold' }}>{tx.montant.toLocaleString()} XAF</td>
//                   <td style={tdStyle}>{tx.idCompteSource}</td>
//                   <td style={tdStyle}>{tx.idCompteDestination}</td>
//                   <td style={tdStyle}>{tx.dateCreation}</td>
//                   <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select style={inputStyle} value={transferForm.source} onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}>
//               {accounts.map(acc => <option key={acc.idCompte} value={acc.numeroCompte}>{acc.idOperateur} - {acc.numeroCompte}</option>)}
//             </select>

//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
//             </select>

//             <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

//             <label style={labelStyle}>Montant de la transaction (XAF)</label>
//             <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
//               {loans.map(loan => (
//                 <div key={loan.idPret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                   <div style={{ display: 'table', width: '100%' }}>
//                     <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret}</div>
//                     <div style={{ display: 'table-cell', textAlign: 'right' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut}</span></div>
//                   </div>
//                   <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                     <p>Montant capital : <strong>{loan.montantDemande.toLocaleString()} XAF</strong></p>
//                     <p>Prochaine mensualité : <strong>{loan.montantEcheance.toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance})</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
//               <form onSubmit={handleLoanRequest}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
//           </form>

//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
//               <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
//                 <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//                 <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
//                 <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
//                 <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
//                 <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };



// import React, { useState, useEffect } from 'react';
// import { accountService, transactionService, loanService, ocrService } from '../services/api';
// import axios from 'axios';

// export default function ClientDashboard() {
//   const [activeTab, setActiveTab] = useState('comptes');
//   const [accounts, setAccounts] = useState([
//     { idCompte: '1', numeroCompte: 'CM-MTN-87632', solde: 450000, devise: 'XAF', typeCompte: 'COURANT', idOperateur: 'MTN Mobile Money' },
//     { idCompte: '2', numeroCompte: 'CM-ORNG-12984', solde: 75000, devise: 'XAF', typeCompte: 'EPARGNE', idOperateur: 'Orange Money' }
//   ]);
//   const [transactions, setTransactions] = useState([
//     { idTransaction: '101', type: 'DEPOT', montant: 50000, dateCreation: '2026-06-15 10:23', statut: 'TERMINE', idCompteSource: 'N/A', idCompteDestination: 'CM-MTN-87632' },
//     { idTransaction: '102', type: 'TRANSFERT_INTER', montant: 12000, dateCreation: '2026-06-17 14:02', statut: 'TERMINE', idCompteSource: 'CM-MTN-87632', idCompteDestination: 'CM-ORNG-12984' }
//   ]);
//   const [loans, setLoans] = useState([
//     { idPret: '501', montantDemande: 1500000, statut: 'APPROUVE', dateEcheance: '2026-07-18', montantEcheance: 135000, estPaye: false }
//   ]);


//   // Form States
//   const [transferForm, setTransferForm] = useState({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
//   const [ocrFile, setOcrFile] = useState(null);
//   const [ocrResult, setOcrResult] = useState(null);
//   const [ocrLoading, setOcrLoading] = useState(false);


//   const [info, setInfo] = useState([]);
//   const [infocompte, setInfocompte] = useState([]);
//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE/api/infoconnecter";
//   const API_BASE_URLCOMPTE = "http://localhost:8079/BANQUE-SERVICE-COMPTE-FINANCIER/api/compte";


//   const handleTransfer = (e) => {
//     e.preventDefault();
//     const newTx = {
//       idTransaction: String(Date.now()),
//       type: transferForm.type,
//       montant: parseFloat(transferForm.amount),
//       dateCreation: new Date().toISOString().replace('T', ' ').substring(0, 16),
//       statut: 'TERMINE',
//       idCompteSource: transferForm.source,
//       idCompteDestination: transferForm.dest
//     };
//     setTransactions([newTx, ...transactions]);
//     setAccounts(accounts.map(acc => {
//       if (acc.numeroCompte === transferForm.source) return { ...acc, solde: acc.solde - parseFloat(transferForm.amount) };
//       if (acc.numeroCompte === transferForm.dest) return { ...acc, solde: acc.solde + parseFloat(transferForm.amount) };
//       return acc;
//     }));
//     alert('Transaction traitée avec succès et notifiée via RabbitMQ !');
//     setTransferForm({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
//   };

//   const handleLoanRequest = (e) => {
//     e.preventDefault();
//     const newLoan = {
//       idPret: String(Date.now()),
//       montantDemande: parseFloat(loanForm.amount),
//       statut: 'SOUMIS',
//       dateEcheance: 'Évaluation en cours...',
//       montantEcheance: 0,
//       estPaye: false
//     };
//     setLoans([newLoan, ...loans]);
//     alert('Demande de crédit enregistrée. En attente de l\'analyse de vos pièces justificatives.');
//     setActiveTab('ocr');
//   };

//   const handleOcrUpload = (e) => {
//     e.preventDefault();
//     if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
//     setOcrLoading(true);
//     setTimeout(() => {
//       setOcrResult({
//         nom: 'KAMGA Pierre',
//         cni_numero: '102938475-NW',
//         salaire_detecte: '450,000 XAF',
//         score_confiance: '98.4%',
//         statut_authenticite: 'VALIDE'
//       });
//       setOcrLoading(false);
//     }, 2000);
//   };


//     useEffect(() => {
//     fetchUsersConnecter();
//   }, []);

//   const fetchUsersConnecter = async () => {
//     try {
     
//       const response_user = await axios.get(API_BASE_URL);
//       const response_compte = await axios.get(`${API_BASE_URLCOMPTE}/${response_user.data.iuser}`);
//       console.log("===inf00----");
//       console.log(response_user.data);
//       console.log("=== response_compte----");
//       console.log(response_compte.data);
      
      
//       setInfo(response_user.data);
//       setInfocompte(response_compte);
    
//     } catch (err) {
//       console.error("Erreur de récupération :", err);

//     } 
//   };




//   return (
//     <div style={{ display: 'block' }}>
//       <div style={{ display: 'table', width: '100%', marginBottom: '20px' }}>
//         <div style={{ display: 'table-row' }}>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'comptes' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('comptes')}>Mes Comptes Financiers</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'virement' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('virement')}>Faire un Virement</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'prets' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('prets')}>Mes Prêts & Crédits</button>
//           <button style={{ ...tabStyle, borderBottom: activeTab === 'ocr' ? '3px solid #10b981' : 'none' }} onClick={() => setActiveTab('ocr')}>Vérification IA / OCR</button>
//         </div>
//       </div>

//       {activeTab === 'comptes' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Résumé des Soldes  Opérateur</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>

//               <div style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}> Tes informations </div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{info.nom.toLocaleString().toUpperCase()} {info.prenom.toUpperCase()}</div>
//               </div>


//             {accounts.map(acc => (
//               <div key={acc.idCompte} style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
//                 <div style={{ fontSize: '14px', opacity: 0.9 }}>{acc.idOperateur}</div>
//                 <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{acc.solde.toLocaleString()} {acc.devise}</div>
//                 <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {acc.numeroCompte} ({acc.typeCompte})</div>
//               </div>
//             ))}
//           </div>

//           <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
//           <table style={tableStyle}>
//             <thead>
//               <tr style={{ backgroundColor: '#f1f5f9' }}>
//                 <th style={thStyle}>ID</th>
//                 <th style={thStyle}>Type</th>
//                 <th style={thStyle}>Montant</th>
//                 <th style={thStyle}>Source</th>
//                 <th style={thStyle}>Destination</th>
//                 <th style={thStyle}>Date</th>
//                 <th style={thStyle}>Statut</th>
//               </tr>
//             </thead>
//             <tbody>
//               {transactions.map(tx => (
//                 <tr key={tx.idTransaction} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                   <td style={tdStyle}>{tx.idTransaction}</td>
//                   <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span></td>
//                   <td style={{ ...tdStyle, fontWeight: 'bold' }}>{tx.montant.toLocaleString()} XAF</td>
//                   <td style={tdStyle}>{tx.idCompteSource}</td>
//                   <td style={tdStyle}>{tx.idCompteDestination}</td>
//                   <td style={tdStyle}>{tx.dateCreation}</td>
//                   <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {activeTab === 'virement' && (
//         <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
//           <form onSubmit={handleTransfer}>
//             <label style={labelStyle}>Compte d'origine (Débit)</label>
//             <select style={inputStyle} value={transferForm.source} onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}>
//               {accounts.map(acc => <option key={acc.idCompte} value={acc.numeroCompte}>{acc.idOperateur} - {acc.numeroCompte}</option>)}
//             </select>

//             <label style={labelStyle}>Type de virement</label>
//             <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
//               <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
//               <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
//             </select>

//             <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
//             <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

//             <label style={labelStyle}>Montant de la transaction (XAF)</label>
//             <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

//             <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
//           </form>
//         </div>
//       )}

//       {activeTab === 'prets' && (
//         <div>
//           <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
//           <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
//             <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
//               <h3>Suivi de mes dossiers</h3>
//               {loans.map(loan => (
//                 <div key={loan.idPret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
//                   <div style={{ display: 'table', width: '100%' }}>
//                     <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret}</div>
//                     <div style={{ display: 'table-cell', textAlign: 'right' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut}</span></div>
//                   </div>
//                   <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
//                     <p>Montant capital : <strong>{loan.montantDemande.toLocaleString()} XAF</strong></p>
//                     <p>Prochaine mensualité : <strong>{loan.montantEcheance.toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance})</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div style={{ display: 'table-cell', width: '40%', background: 'white', padding: '20px', borderRadius: '8px', verticalAlign: 'top', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//               <h3 style={{ marginTop: 0 }}>Nouvelle Demande</h3>
//               <form onSubmit={handleLoanRequest}>
//                 <label style={labelStyle}>Montant souhaité</label>
//                 <input type="number" required style={inputStyle} value={loanForm.amount} onChange={e => setLoanForm({ ...loanForm, amount: e.target.value })} />

//                 <label style={labelStyle}>Durée de remboursement (Mois)</label>
//                 <select style={inputStyle} value={loanForm.duration} onChange={e => setLoanForm({ ...loanForm, duration: e.target.value })}>
//                   <option value="6">6 Mois</option>
//                   <option value="12">12 Mois</option>
//                   <option value="24">24 Mois</option>
//                 </select>

//                 <label style={labelStyle}>Justification / Projet</label>
//                 <textarea rows="3" style={inputStyle} value={loanForm.reason} onChange={e => setLoanForm({ ...loanForm, reason: e.target.value })}></textarea>

//                 <button type="submit" style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>Soumettre le dossier</button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === 'ocr' && (
//         <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//           <h2 style={{ color: '#065f46', marginTop: 0 }}>Analyse Automatisée des Pièces Justificatives (OCR / IA)</h2>
//           <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
//           <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
//             <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
//             <br />
//             <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
//           </form>

//           {ocrResult && (
//             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
//               <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
//               <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
//                 <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
//                 <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
//                 <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
//                 <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
//                 <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// const tabStyle = { padding: '12px 24px', background: 'none', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', color: '#475569', transition: 'all 0.2s' };
// const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', textAlign: 'left' };
// const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155', fontWeight: '600' };
// const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px' };
// const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
// const labelStyle = { display: 'block', fontWeight: 'bold', fontSize: '13px', color: '#334155', marginBottom: '6px' };
// const btnStyle = { padding: '10px 20px', border: 'none', borderRadius: '6px', color: 'white', backgroundColor: '#1e293b', fontWeight: 'bold', cursor: 'pointer' };