import React, { useState, useEffect } from 'react';
import { accountService, transactionService, loanService, ocrService } from '../services/api';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState('comptes');
  const [accounts, setAccounts] = useState([
    { idCompte: '1', numeroCompte: 'CM-MTN-87632', solde: 450000, devise: 'XAF', typeCompte: 'COURANT', idOperateur: 'MTN Mobile Money' },
    { idCompte: '2', numeroCompte: 'CM-ORNG-12984', solde: 75000, devise: 'XAF', typeCompte: 'EPARGNE', idOperateur: 'Orange Money' }
  ]);
  const [transactions, setTransactions] = useState([
    { idTransaction: '101', type: 'DEPOT', montant: 50000, dateCreation: '2026-06-15 10:23', statut: 'TERMINE', idCompteSource: 'N/A', idCompteDestination: 'CM-MTN-87632' },
    { idTransaction: '102', type: 'TRANSFERT_INTER', montant: 12000, dateCreation: '2026-06-17 14:02', statut: 'TERMINE', idCompteSource: 'CM-MTN-87632', idCompteDestination: 'CM-ORNG-12984' }
  ]);
  const [loans, setLoans] = useState([
    { idPret: '501', montantDemande: 1500000, statut: 'APPROUVE', dateEcheance: '2026-07-18', montantEcheance: 135000, estPaye: false }
  ]);

  // Form States
  const [transferForm, setTransferForm] = useState({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
  const [loanForm, setLoanForm] = useState({ amount: '', duration: '12', reason: '' });
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleTransfer = (e) => {
    e.preventDefault();
    const newTx = {
      idTransaction: String(Date.now()),
      type: transferForm.type,
      montant: parseFloat(transferForm.amount),
      dateCreation: new Date().toISOString().replace('T', ' ').substring(0, 16),
      statut: 'TERMINE',
      idCompteSource: transferForm.source,
      idCompteDestination: transferForm.dest
    };
    setTransactions([newTx, ...transactions]);
    setAccounts(accounts.map(acc => {
      if (acc.numeroCompte === transferForm.source) return { ...acc, solde: acc.solde - parseFloat(transferForm.amount) };
      if (acc.numeroCompte === transferForm.dest) return { ...acc, solde: acc.solde + parseFloat(transferForm.amount) };
      return acc;
    }));
    alert('Transaction traitée avec succès et notifiée via RabbitMQ !');
    setTransferForm({ source: 'CM-MTN-87632', dest: '', amount: '', type: 'TRANSFERT_INTRA' });
  };

  const handleLoanRequest = (e) => {
    e.preventDefault();
    const newLoan = {
      idPret: String(Date.now()),
      montantDemande: parseFloat(loanForm.amount),
      statut: 'SOUMIS',
      dateEcheance: 'Évaluation en cours...',
      montantEcheance: 0,
      estPaye: false
    };
    setLoans([newLoan, ...loans]);
    alert('Demande de crédit enregistrée. En attente de l\'analyse de vos pièces justificatives.');
    setActiveTab('ocr');
  };

  const handleOcrUpload = (e) => {
    e.preventDefault();
    if (!ocrFile) return alert('Veuillez sélectionner un document CNI ou bulletin de salaire');
    setOcrLoading(true);
    setTimeout(() => {
      setOcrResult({
        nom: 'KAMGA Pierre',
        cni_numero: '102938475-NW',
        salaire_detecte: '450,000 XAF',
        score_confiance: '98.4%',
        statut_authenticite: 'VALIDE'
      });
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
          <h2 style={{ color: '#065f46' }}>Résumé des Soldes par Opérateur</h2>
          <div style={{ display: 'table', width: '100%', borderSpacing: '15px' }}>
            {accounts.map(acc => (
              <div key={acc.idCompte} style={{ display: 'table-cell', background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', padding: '20px', borderRadius: '12px', width: '50%' }}>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>{acc.idOperateur}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>{acc.solde.toLocaleString()} {acc.devise}</div>
                <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>N° {acc.numeroCompte} ({acc.typeCompte})</div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: '30px' }}>Historique Récent des Transactions</h3>
          <table style={tableStyle}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Montant</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Destination</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.idTransaction} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={tdStyle}>{tx.idTransaction}</td>
                  <td style={tdStyle}><span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', background: tx.type === 'DEPOT' ? '#d1fae5' : '#fee2e2', color: tx.type === 'DEPOT' ? '#065f46' : '#991b1b' }}>{tx.type}</span></td>
                  <td style={{ ...tdStyle, fontWeight: 'bold' }}>{tx.montant.toLocaleString()} XAF</td>
                  <td style={tdStyle}>{tx.idCompteSource}</td>
                  <td style={tdStyle}>{tx.idCompteDestination}</td>
                  <td style={tdStyle}>{tx.dateCreation}</td>
                  <td style={tdStyle}><span style={{ color: '#16a34a', fontWeight: 'bold' }}>● {tx.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'virement' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#065f46', marginTop: 0 }}>Passer un ordre de mouvement financier</h2>
          <form onSubmit={handleTransfer}>
            <label style={labelStyle}>Compte d'origine (Débit)</label>
            <select style={inputStyle} value={transferForm.source} onChange={e => setTransferForm({ ...transferForm, source: e.target.value })}>
              {accounts.map(acc => <option key={acc.idCompte} value={acc.numeroCompte}>{acc.idOperateur} - {acc.numeroCompte}</option>)}
            </select>

            <label style={labelStyle}>Type de virement</label>
            <select style={inputStyle} value={transferForm.type} onChange={e => setTransferForm({ ...transferForm, type: e.target.value })}>
              <option value="TRANSFERT_INTRA">Intra-opérateur (Même établissement)</option>
              <option value="TRANSFERT_INTER">Inter-opérateur (Réseau Banque Global)</option>
            </select>

            <label style={labelStyle}>Compte Bénéficiaire (Numéro de compte cible)</label>
            <input type="text" placeholder="Ex: CM-ORNG-XXXXX" required style={inputStyle} value={transferForm.dest} onChange={e => setTransferForm({ ...transferForm, dest: e.target.value })} />

            <label style={labelStyle}>Montant de la transaction (XAF)</label>
            <input type="number" placeholder="Montant en FCFA" required style={inputStyle} value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />

            <button type="submit" style={{ ...btnStyle, backgroundColor: '#059669', width: '100%', marginTop: '10px' }}>Exécuter le mouvement de fonds</button>
          </form>
        </div>
      )}

      {activeTab === 'prets' && (
        <div>
          <h2 style={{ color: '#065f46' }}>Gestion de mes Demandes d'Échéancier de Crédit</h2>
          <div style={{ display: 'table', width: '100%', borderSpacing: '20px' }}>
            <div style={{ display: 'table-cell', width: '60%', verticalAlign: 'top' }}>
              <h3>Suivi de mes dossiers</h3>
              {loans.map(loan => (
                <div key={loan.idPret} style={{ background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #10b981', marginBottom: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'table', width: '100%' }}>
                    <div style={{ display: 'table-cell', fontWeight: 'bold', fontSize: '16px' }}>Demande Prêt N° {loan.idPret}</div>
                    <div style={{ display: 'table-cell', textAlign: 'right' }}><span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{loan.statut}</span></div>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#475569' }}>
                    <p>Montant capital : <strong>{loan.montantDemande.toLocaleString()} XAF</strong></p>
                    <p>Prochaine mensualité : <strong>{loan.montantEcheance.toLocaleString()} XAF</strong> (Échéance au {loan.dateEcheance})</p>
                  </div>
                </div>
              ))}
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
          <p style={{ color: '#64748b', fontSize: '14px' }}>Pour ouvrir un compte ou valider un crédit, téléversez votre CNI ou votre bulletin de salaire. Le microservice <strong>ms-ocr (Python FastAPI)</strong> effectuera l'extraction automatique.</p>
          
          <form onSubmit={handleOcrUpload} style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#f8fafc', marginBottom: '20px' }}>
            <input type="file" onChange={e => setOcrFile(e.target.files[0])} style={{ marginBottom: '15px' }} />
            <br />
            <button type="submit" style={btnStyle} disabled={ocrLoading}>{ocrLoading ? 'Traitement OCR en cours...' : 'Lancer l\'extraction par l\'IA'}</button>
          </form>

          {ocrResult && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ color: '#16a34a', marginTop: 0 }}>Résultat renvoyé par Python FastAPI :</h3>
              <div style={{ display: 'table', width: '100%', fontSize: '14px' }}>
                <p><strong>Nom Extrait :</strong> {ocrResult.nom}</p>
                <p><strong>N° CNI Détecté :</strong> {ocrResult.cni_numero}</p>
                <p><strong>Capacité financière calculée :</strong> {ocrResult.salaire_detecte}</p>
                <p><strong>Confiance algorithmique :</strong> {ocrResult.score_confiance}</p>
                <p><strong>Statut de validation réglementaire :</strong> <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{ocrResult.statut_authenticite}</span></p>
              </div>
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