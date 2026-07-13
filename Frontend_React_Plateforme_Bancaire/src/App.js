import React, { useState } from 'react';
import axios from 'axios'; 
import Swal from 'sweetalert2'; 
import ClientDashboard from './views/ClientDashboard';
import OperatorDashboard from './views/OperatorDashboard';
import AdminDashboard from './views/AdminDashboard';

// --- COMPOSANT ACCUEIL ---  
function Accueil() {
  return (
    <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      <div style={{
        display: 'flex',
        minHeight: '65vh',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '45%',
          height: '100%',
          backgroundColor: 'white',
          zIndex: 1,
          clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
        }} />

        <div style={{
          flex: '1',
          zIndex: 2,
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '38%',
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
          <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
            Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
          </p>
        </div>

        <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
            <g transform="translate(380, 40)">
              <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
              <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
            </g>
            <g transform="translate(320, 100) rotate(-15)">
              <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
              <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

// --- APP PRINCIPALE ---
export default function App() {
  const [currentRole, setCurrentRole] = useState('Accueil');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // États d'authentification
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState(''); 

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Ajout des champs typeCompte et idOperateur par défaut dans l'état initial
  const [regForm, setRegForm] = useState({ 
    prenom: '', 
    nom: '', 
    email: '', 
    motDePasseChiffre: '', 
    dateNaissance: '', 
    role: 'client',
    typeCompte: 'COURANT',
    idOperateur: 'MTN Mobile Money'
  });

  const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE";

  // 1️ GESTION DE L'INSCRIPTION / ENREGISTREMENT
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Traitement en cours...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      // Le DTO global contient les informations utilisateur + les choix de compte
      await axios.post(`${API_BASE_URL}/api`, {
        prenom: regForm.prenom,
        nom: regForm.nom,
        motDePasseChiffre: regForm.motDePasseChiffre,
        role: regForm.role, 
        //role: "OPERATOR",
        dateNaissance: regForm.dateNaissance,
        email: regForm.email,
       // status:  'oui',
        status: regForm.role === 'client' ? 'non' : 'oui',
        //  Envoi des paramètres de compte choisis vers le microservice
        typeCompte: regForm.role === 'client' ? regForm.typeCompte : null,
        idOperateur: regForm.role === 'client' ? regForm.idOperateur : null
      });
      
      setIsRegisterOpen(false);
      
      // Réinitialisation complète de l'état
      setRegForm({ 
        prenom: '', 
        nom: '', 
        email: '', 
        motDePasseChiffre: '', 
        dateNaissance: '', 
        role: 'client',
        typeCompte: 'COURANT',
        idOperateur: 'MTN Mobile Money'
      });

      Swal.fire({
        icon: 'success',
        title: 'Enregistrement réussi !',
        text: 'Les données ont bien été soumises au système distribué.',
        confirmButtonColor: '#1e3a8a'
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Échec', text: 'Erreur lors de l\'enregistrement.' });
    }
  };

  // 2️ GESTION DE LA CONNEXION DIRECTE AVEC ROUTAGE PAR RÔLE
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        username: loginForm.username,
        password: loginForm.password
      });

      setIsLoginOpen(false);
      setLoginForm({ username: '', password: '' });
      setIsLoggedIn(true);

      const userRole = response.data.role ? response.data.role.toUpperCase() : 'CLIENT'; 
      setAuthenticatedRole(userRole); 
       
      if (userRole === 'ADMIN') {
        setCurrentRole('ADMIN');
      } else if (userRole === 'OPERATOR' || userRole === 'GESTIONNAIRE') {
        setCurrentRole('OPERATOR');
      }else if (userRole === 'CLIENT') {
        setCurrentRole('CLIENT');
      }
      else  {
        setCurrentRole('Accueil');
      }

      Swal.fire({
        icon: 'success',
        title: 'Connexion réussie',
        text: `Bienvenue dans votre espace ${userRole}`,
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (error) {
      console.error("Erreur de connexion:", error);
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Identifiants invalides.' });
    }
  };

  // 3️ GESTION DE LA DÉCONNEXION
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthenticatedRole('');
    setCurrentRole('Accueil');
    Swal.fire({
      icon: 'info',
      title: 'Déconnexion',
      text: 'Vous avez été déconnecté avec succès.',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
  const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' };
  const cancelButtonStyle = { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setCurrentRole('Accueil')}>ECOBANK-DISTRIBUEE-UI</h1>
          <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Université de Yaoundé I</span>
        </div>
        
        <div style={{ flex: 1, textAlign: 'right' }}>
          {!isLoggedIn ? (
            <>
              <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
              <button onClick={() => { setRegForm({...regForm, role: 'client'}); setIsRegisterOpen(true); }} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
            </>
          ) : (
            <>
              {(authenticatedRole === 'ADMIN' || authenticatedRole === 'OPERATOR') && (
                <button 
                  onClick={() => { setRegForm({...regForm, role: 'operator'}); setIsRegisterOpen(true); }} 
                  style={{ marginRight: '15px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#eab308', color: '#1e293b', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  ➕ Enregistrer Opérateur
                </button>
              )}
              <button onClick={handleLogout} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Déconnecter</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
        {currentRole === 'Accueil' ? <Accueil /> : (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            {currentRole === 'CLIENT' && <ClientDashboard />}
            {currentRole === 'OPERATOR' && <OperatorDashboard />}
            {currentRole === 'ADMIN' && <AdminDashboard />}
          </div>
        )}
      </main>

      {/* Pied de page structuré */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '25px 20px', textAlign: 'center', fontSize: '12px', marginTop: 'auto', borderTop: '4px solid #0ea5e9' }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#f8fafc' }}>ECOBANK SYSTÈME BANCAIRE DISTRIBUÉ MICROSERVICES</div>
        <div>© 2026 Architecture Logicielle INF462 — Université de Yaoundé I. Tous droits réservés.</div>
        <div style={{ marginTop: '5px', color: '#38bdf8', fontSize: '11px' }}>Examineur : Pr. Kimbi Xaveria</div>
      </footer>

      {/* MODAL DE CONNEXION */}
      {isLoginOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0' }}> Connexion</h3>
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Identifiant (Username)</label>
                <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label>
                <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsLoginOpen(false)} style={cancelButtonStyle}>Annuler</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL D'INSCRIPTION / ENREGISTREMENT MULTI-RÔLE */}
      {isRegisterOpen && (
        <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 15px 0' }}>
              {regForm.role === 'operator' ? ' Ajouter un Nouvel Opérateur' : ' Ouverture de Compte Client'}
            </h3>
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nom complet</label>
                <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Prénom d'utilisateur</label>
                <input type="text" required value={regForm.prenom} onChange={e => setRegForm({...regForm, prenom: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email</label>
                <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mot de passe</label>
                <input type="password" required value={regForm.motDePasseChiffre} onChange={e => setRegForm({...regForm, motDePasseChiffre: e.target.value})} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Date de Naissance</label>
                <input type="date" required value={regForm.dateNaissance} onChange={e => setRegForm({...regForm, dateNaissance: e.target.value})} style={inputStyle} />
              </div>
              
              {/*  CONDITION : On n'affiche le choix de l'opérateur et du type de compte QUE pour les clients */}
              {regForm.role === 'client' && (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Type de Compte souhaité</label>
                    <select 
                      value={regForm.typeCompte} 
                      onChange={e => setRegForm({...regForm, typeCompte: e.target.value})} 
                      style={inputStyle}
                    >
                      <option value="COURANT">Compte Courant</option>
                      <option value="EPARGNE">Compte Épargne</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Opérateur de paiement de référence</label>
                    <select 
                      value={regForm.idOperateur} 
                      onChange={e => setRegForm({...regForm, idOperateur: e.target.value})} 
                      style={inputStyle}
                    >
                      <option value="MTN Mobile Money">MTN Mobile Money</option>
                      <option value="Orange Money">Orange Money</option>
                    </select>
                  </div>
                </>
              )}
              
              {/* Choix forcé de rôle si l'Admin configure un compte depuis sa session */}
              {authenticatedRole === 'ADMIN' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Rôle de l'utilisateur</label>
                  <select value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})} style={inputStyle}>
                    <option value="client">Client</option>
                    <option value="operator">Opérateur (Gestionnaire)</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsRegisterOpen(false)} style={cancelButtonStyle}>Annuler</button>
                <button type="submit" style={{ flex: 2, padding: '12px', background: regForm.role === 'operator' ? '#eab308' : '#0f172a', color: regForm.role === 'operator' ? '#1e293b' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {regForm.role === 'operator' ? 'Créer l\'Opérateur' : 'Soumettre au microservice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



// import React, { useState } from 'react';
// import axios from 'axios'; 
// import Swal from 'sweetalert2'; 
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';

// // --- COMPOSANT ACCUEIL ---
// function Accueil() {
//   return (
//     <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
//       <div style={{
//         display: 'flex',
//         minHeight: '65vh',
//         position: 'relative',
//         overflow: 'hidden',
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
//         boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
//       }}>
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '45%',
//           height: '100%',
//           backgroundColor: 'white',
//           zIndex: 1,
//           clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
//         }} />

//         <div style={{
//           flex: '1',
//           zIndex: 2,
//           padding: '60px 40px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '38%',
//         }}>
//           <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
//           <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
//           <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
//             Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
//           </p>
//         </div>

//         <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
//           <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
//             <g transform="translate(380, 40)">
//               <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
//               <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
//             </g>
//             <g transform="translate(320, 100) rotate(-15)">
//               <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
//               <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
//             </g>
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- APP PRINCIPALE ---
// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
//   // États d'authentification
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [authenticatedRole, setAuthenticatedRole] = useState(''); //  Stocke le vrai rôle de l'utilisateur connecté

//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '', role: 'client' });

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE";

//   // 1️ GESTION DE L'INSCRIPTION / ENREGISTREMENT
//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URL}/api`, {
//         prenom: regForm.prenom,
//         nom: regForm.nom,
//         motDePasseChiffre: regForm.motDePasseChiffre,
//         role: regForm.role, //  Utilise dynamiquement le rôle choisi ou défini
//         dateNaissance: regForm.dateNaissance,
//         email: regForm.email,
//         status: regForm.role === 'client' ? 'non' : 'oui' // Un opérateur créé est actif directement
//       });
      
//       setIsRegisterOpen(false);
//       setRegForm({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '', role: 'client' });

//       Swal.fire({
//         icon: 'success',
//         title: 'Enregistrement réussi !',
//         text: 'L\'utilisateur a bien été créé dans le microservice.',
//         confirmButtonColor: '#1e3a8a'
//       });
//     } catch (error) {
//       Swal.fire({ icon: 'error', title: 'Échec', text: 'Erreur lors de l\'enregistrement.' });
//     }
//   };

//   // 2️ GESTION DE LA CONNEXION DIRECTE AVEC ROUTAGE PAR RÔLE
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/login`, {
//         username: loginForm.username,
//         password: loginForm.password
//       });
//       console.log("info----");
//        console.log(loginForm);

//       setIsLoginOpen(false);
//       setLoginForm({ username: '', password: '' });
      
//       setIsLoggedIn(true);

//       const userRole = response.data.role ? response.data.role.toUpperCase() : 'CLIENT'; 
//       setAuthenticatedRole(userRole); //  Sauvegarde le rôle pour les conditions d'affichage
//        console.log("connexion----");
//        console.log(response.data);
       
       
//       // Redirection conditionnelle stricte
//       if (userRole === 'ADMIN') {
//         setCurrentRole('ADMIN');
//       } else if (userRole === 'OPERATOR' || userRole === 'GESTIONNAIRE') {
//         setCurrentRole('OPERATOR');
//       } else {
//         setCurrentRole('CLIENT');
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Connexion réussie',
//         text: `Bienvenue dans votre espace ${userRole}`,
//         timer: 2000,
//         showConfirmButton: false,
//         toast: true,
//         position: 'top-end'
//       });

//     } catch (error) {
//       console.error("Erreur de connexion:", error);
//       Swal.fire({ icon: 'error', title: 'Erreur', text: 'Identifiants invalides.' });
//     }
//   };

//   // 3️ GESTION DE LA DÉCONNEXION
//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setAuthenticatedRole('');
//     setCurrentRole('Accueil');
//     Swal.fire({
//       icon: 'info',
//       title: 'Déconnexion',
//       text: 'Vous avez été déconnecté avec succès.',
//       timer: 1500,
//       showConfirmButton: false,
//       toast: true,
//       position: 'top-end'
//     });
//   };

//   const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
//   const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
//   const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', position: 'relative' };
//   const cancelButtonStyle = { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
//       {/* Navbar */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setCurrentRole('Accueil')}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Université de Yaoundé I</span>
//         </div>
        
//         <div style={{ flex: 1, textAlign: 'right' }}>
//           {/*  CONDITION 1 : Si pas connecté, afficher les boutons classiques */}
//           {!isLoggedIn ? (
//             <>
//               <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
//               <button onClick={() => { setRegForm({...regForm, role: 'client'}); setIsRegisterOpen(true); }} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
//             </>
//           ) : (
//             <>
//               {/*  CONDITION 2 : Si connecté en tant qu'ADMIN ou OPERATOR, afficher le bouton spécial d'enregistrement */}
//               {(authenticatedRole === 'ADMIN' || authenticatedRole === 'OPERATOR') && (
//                 <button 
//                   onClick={() => { setRegForm({...regForm, role: 'operator'}); setIsRegisterOpen(true); }} 
//                   style={{ marginRight: '15px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#eab308', color: '#1e293b', fontWeight: 'bold', cursor: 'pointer' }}
//                 >
//                   ➕ Enregistrer Opérateur
//                 </button>
//               )}
//               <button onClick={handleLogout} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Déconnecter</button>
//             </>
//           )}

//           {/* <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select> */}
//         </div>
//       </header>

//       {/* Main Content */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
//         {currentRole === 'Accueil' ? <Accueil /> : (
//           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//             {currentRole === 'CLIENT' && <ClientDashboard />}
//             {currentRole === 'OPERATOR' && <OperatorDashboard />}
//             {currentRole === 'ADMIN' && <AdminDashboard />}
//           </div>
//         )}
//       </main>

//       <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '20px', textAlign: 'center', fontSize: '12px', marginTop: 'auto' }}>
//         © 2026 Ecobank Microservices. Tous droits réservés. Examineur : Pr. Kimbi Xaveria.
//       </footer>

//       {/* MODAL DE CONNEXION */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>🔒 Connexion</h3>
//             <form onSubmit={handleLoginSubmit}>
//               <div style={{ marginBottom: '12px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Identifiant (Username)</label>
//                 <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsLoginOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL D'INSCRIPTION / ENREGISTREMENT MULTI-RÔLE */}
//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>
//               {regForm.role === 'operator' ? '➕ Ajouter un Nouvel Opérateur' : '📝 Ouverture de Compte Client'}
//             </h3>
//             <form onSubmit={handleRegisterSubmit}>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nom complet</label>
//                 <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Prénom d'utilisateur</label>
//                 <input type="text" required value={regForm.prenom} onChange={e => setRegForm({...regForm, prenom: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email</label>
//                 <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={regForm.motDePasseChiffre} onChange={e => setRegForm({...regForm, motDePasseChiffre: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Date de Naissance</label>
//                 <input type="date" required value={regForm.dateNaissance} onChange={e => setRegForm({...regForm, dateNaissance: e.target.value})} style={inputStyle} />
//               </div>
              
//               {/* 🔴 Si c'est l'administrateur qui crée, on lui laisse même le choix de forcer un rôle spécifique s'il le souhaite */}
//               {authenticatedRole === 'ADMIN' && (
//                 <div style={{ marginBottom: '20px' }}>
//                   <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Rôle de l'utilisateur</label>
//                   <select value={regForm.role} onChange={e => setRegForm({...regForm, role: e.target.value})} style={inputStyle}>
//                     <option value="client">Client</option>
//                     <option value="operator">Opérateur (Gestionnaire)</option>
//                     <option value="admin">Administrateur</option>
//                   </select>
//                 </div>
//               )}

//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsRegisterOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: regForm.role === 'operator' ? '#eab308' : '#0f172a', color: regForm.role === 'operator' ? '#1e293b' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                   {regForm.role === 'operator' ? 'Créer l\'Opérateur' : 'Soumettre au microservice'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }












// import React, { useState } from 'react';
// import axios from 'axios'; 
// import Swal from 'sweetalert2'; 
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';

// // --- COMPOSANT ACCUEIL ---
// function Accueil() {
//   return (
//     <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
//       <div style={{
//         display: 'flex',
//         minHeight: '65vh',
//         position: 'relative',
//         overflow: 'hidden',
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
//         boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
//       }}>
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '45%',
//           height: '100%',
//           backgroundColor: 'white',
//           zIndex: 1,
//           clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
//         }} />

//         <div style={{
//           flex: '1',
//           zIndex: 2,
//           padding: '60px 40px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '38%',
//         }}>
//           <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
//           <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
//           <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
//             Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
//           </p>
//         </div>

//         <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
//           <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
//             <g transform="translate(380, 40)">
//               <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
//               <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
//             </g>
//             <g transform="translate(320, 100) rotate(-15)">
//               <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
//               <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
//             </g>
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- APP PRINCIPALE ---
// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
//   //  Nouvel état pour suivre si l'utilisateur est connecté
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '' });

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE";

//   // 1️ GESTION DE L'INSCRIPTION
//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     Swal.fire({
//       title: 'Traitement en cours...',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URL}/api`, {
//         prenom: regForm.prenom,
//         nom: regForm.nom,
//         motDePasseChiffre: regForm.motDePasseChiffre,
//         role: "ADMIN",
//         dateNaissance: regForm.dateNaissance,
//         email: regForm.email,
//         status: "non"
//       });
      
//       setIsRegisterOpen(false);
//       setRegForm({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '' });

//       Swal.fire({
//         icon: 'success',
//         title: 'Demande soumise avec succès !',
//         html: `Votre compte a été pré-créé.<br><br><b style="color:#eab308;">⚠️ Statut : En attente de validation</b>`,
//         confirmButtonColor: '#1e3a8a'
//       });
//     } catch (error) {
//       Swal.fire({ icon: 'error', title: 'Échec', text: 'Erreur lors de l\'inscription.' });
//     }
//   };

//   // 2️ GESTION DE LA CONNEXION DIRECTE AVEC ROUTAGE PAR RÔLE
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/login`, {
//         username: loginForm.username,
//         password: loginForm.password
//       });

//       setIsLoginOpen(false);
//       setLoginForm({ username: '', password: '' });
      
//       //  1. On valide l'état connecté
//       setIsLoggedIn(true);

//       //  2. Récupération du rôle depuis le backend
//       // Note: s'il s'agit d'une chaîne brute ou d'un objet (ex: response.data.role), ajuste cette variable.
//       const userRole = response.data.role ? response.data.role.toUpperCase() : 'CLIENT'; 

//       //  3. Redirection conditionnelle stricte vers le bon Dashboard
//       if (userRole === 'ADMIN') {
//         setCurrentRole('ADMIN');
//       } else if (userRole === 'OPERATOR' || userRole === 'GESTIONNAIRE') {
//         setCurrentRole('OPERATOR');
//       } else {
//         setCurrentRole('CLIENT');
//       }

//       Swal.fire({
//         icon: 'success',
//         title: 'Connexion réussie',
//         text: `Bienvenue dans votre espace ${userRole}`,
//         timer: 2000,
//         showConfirmButton: false,
//         toast: true,
//         position: 'top-end'
//       });

//     } catch (error) {
//       console.error("Erreur de connexion:", error);
//       Swal.fire({ icon: 'error', title: 'Erreur', text: 'Identifiants invalides.' });
//     }
//   };

//   //  3️ GESTION DE LA DÉCONNEXION
//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setCurrentRole('Accueil');
//     Swal.fire({
//       icon: 'info',
//       title: 'Déconnexion',
//       text: 'Vous avez été déconnecté avec succès.',
//       timer: 1500,
//       showConfirmButton: false,
//       toast: true,
//       position: 'top-end'
//     });
//   };

//   const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
//   const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
//   const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', position: 'relative' };
//   const cancelButtonStyle = { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
//       {/* Navbar */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }} onClick={() => setCurrentRole('Accueil')}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Université de Yaoundé I</span>
//         </div>
        
//         <div style={{ flex: 1, textAlign: 'right' }}>
//           {/*  CONDITION : Affichage des boutons selon l'état de connexion */}
//           {!isLoggedIn ? (
//             <>
//               <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
//               <button onClick={() => setIsRegisterOpen(true)} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
//             </>
//           ) : (
//             <button onClick={handleLogout} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Déconnecter</button>
//           )}

//           <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
//         {currentRole === 'Accueil' ? <Accueil /> : (
//           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//             {currentRole === 'CLIENT' && <ClientDashboard />}
//             {currentRole === 'OPERATOR' && <OperatorDashboard />}
//             {currentRole === 'ADMIN' && <AdminDashboard />}
//           </div>
//         )}
//       </main>

//       <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '20px', textAlign: 'center', fontSize: '12px', marginTop: 'auto' }}>
//         © 2026 Ecobank Microservices. Tous droits réservés. Examineur : Pr. Kimbi Xaveria.
//       </footer>

//       {/* MODALS (Reste identique) */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}> Connexion</h3>
//             <form onSubmit={handleLoginSubmit}>
//               <div style={{ marginBottom: '12px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Identifiant (Username)</label>
//                 <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsLoginOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}> Ouverture de Compte</h3>
//             <form onSubmit={handleRegisterSubmit}>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nom complet</label>
//                 <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Prenom d'utilisateur</label>
//                 <input type="text" required value={regForm.prenom} onChange={e => setRegForm({...regForm, prenom: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email</label>
//                 <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={regForm.motDePasseChiffre} onChange={e => setRegForm({...regForm, motDePasseChiffre: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Date de Naissance</label>
//                 <input type="date" required value={regForm.dateNaissance} onChange={e => setRegForm({...regForm, dateNaissance: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsRegisterOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Soumettre au microservice</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import React, { useState } from 'react';
// import axios from 'axios'; 
// import Swal from 'sweetalert2'; // 🔴 Importation pour les pop-ups professionnels
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';

// // --- COMPOSANT ACCUEIL MODERNISÉ ---
// function Accueil() {
//   return (
//     <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
//       {/* SECTION PRINCIPALE (HERO) */}
//       <div style={{
//         display: 'flex',
//         minHeight: '65vh',
//         position: 'relative',
//         overflow: 'hidden',
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
//         boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
//       }}>
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '45%',
//           height: '100%',
//           backgroundColor: 'white',
//           zIndex: 1,
//           clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
//         }} />

//         <div style={{
//           flex: '1',
//           zIndex: 2,
//           padding: '60px 40px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '38%',
//         }}>
//           <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
//           <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
//           <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
//             Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
//           </p>
//           <button style={{
//             width: '150px',
//             padding: '12px 24px',
//             background: 'linear-gradient(to right, #06b6d4, #22d3ee)',
//             color: 'white',
//             border: 'none',
//             borderRadius: '25px',
//             fontWeight: 'bold',
//             fontSize: '13px',
//             cursor: 'pointer',
//             boxShadow: '0 4px 10px rgba(6, 182, 212, 0.4)',
//           }}>
//             READ MORE
//           </button>
//         </div>

//         <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
//           <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
//             <g transform="translate(380, 40)">
//               <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
//               <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
//             </g>
//             <g transform="translate(320, 100) rotate(-15)">
//               <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
//               <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
//               <rect x="15" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="55" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="95" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//             </g>
//           </svg>
//         </div>
//       </div>

//       {/* CARDS INFO */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #0ea5e9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <h3>👤 Espace Relation Client</h3>
//           <p style={{ fontSize: '14px', color: '#475569' }}>Tout utilisateur peut soumettre une demande d'ouverture de compte...</p>
//         </div>
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #1e3a8a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <h3>🛠️ Espace Gestionnaire</h3>
//           <p style={{ fontSize: '14px', color: '#475569' }}>Les gestionnaires disposent des droits d'activation et de contrôle KYC...</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- APP PRINCIPALE ---
// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '' });

//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE";

//   // 1️ GESTION DE L'INSCRIPTION (POST + POP-UP PROFESSIONNEL)
//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
    
//     // Affichage d'un loader pendant le traitement par le microservice
//     Swal.fire({
//       title: 'Traitement en cours...',
//       text: 'Communication avec le microservice utilisateur.',
//       allowOutsideClick: false,
//       didOpen: () => { Swal.showLoading(); }
//     });

//     try {
//       await axios.post(`${API_BASE_URL}/api`, {
//         prenom: regForm.prenom,
//         nom: regForm.nom,
//         motDePasseChiffre: regForm.motDePasseChiffre,
//         role: "client",
//         dateNaissance: regForm.dateNaissance,
//         email: regForm.email,
//         status: "non"
//       });
      
//       setIsRegisterOpen(false); // Ferme la modal
//       setRegForm({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '' }); // Reset

//       //  Pop-up professionnel de succès pour l'attente de validation KYC
//       Swal.fire({
//         icon: 'success',
//         title: 'Demande soumise avec succès !',
//         html: `Votre compte a été pré-créé.<br><br><b style="color:#eab308;">⚠️ Statut : En attente de validation</b><br>Un administrateur doit examiner vos dossiers avant l'activation finale de vos accès.`,
//         confirmButtonColor: '#1e3a8a',
//         confirmButtonText: 'Compris'
//       });

//     } catch (error) {
//       console.error("Erreur d'inscription:", error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Échec de l\'opération',
//         text: error.response?.data ? `Détail : ${error.response.data}` : "Impossible de joindre l'API Gateway.",
//         confirmButtonColor: '#ef4444'
//       });
//     }
//   };

//   // 2️ GESTION DE LA CONNEXION (POST + REDIRECTION VERS ADMIN)
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API_BASE_URL}/login`, {
//         username: loginForm.username,
//         password: loginForm.password
//       });

//       setIsLoginOpen(false);
//       setLoginForm({ username: '', password: '' });

//       //  REDIRECTION AUTOMATIQUE VERS L'ESPACE ADMINISTRATEUR
//       setCurrentRole('ADMIN');

//       // Notification de bienvenue discrète et pro
//       Swal.fire({
//         icon: 'success',
//         title: 'Connexion réussie',
//         text: 'Bienvenue sur votre tableau de bord Administrateur.',
//         timer: 3000,
//         showConfirmButton: false,
//         toast: true,
//         position: 'top-end'
//       });

//     } catch (error) {
//       console.error("Erreur de connexion:", error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Erreur d\'authentification',
//         text: error.response?.data ? `Échec : ${error.response.data}` : "Identifiants invalides ou serveur Gateway indisponible.",
//         confirmButtonColor: '#ef4444'
//       });
//     }
//   };

//   const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
//   const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
//   const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', position: 'relative' };
//   const cancelButtonStyle = { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
//       {/* Navbar */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Université de Yaoundé I</span>
//         </div>
//         <div style={{ flex: 1, textAlign: 'right' }}>
//           <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
//           <button onClick={() => setIsRegisterOpen(true)} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
//           <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select>
//         </div>
//       </header>

//       {/* Main */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
//         {currentRole === 'Accueil' ? <Accueil /> : (
//           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//             {currentRole === 'CLIENT' && <ClientDashboard />}
//             {currentRole === 'OPERATOR' && <OperatorDashboard />}
//             {currentRole === 'ADMIN' && <AdminDashboard />}
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '20px', textAlign: 'center', fontSize: '12px', marginTop: 'auto' }}>
//         © 2026 Ecobank Microservices. Tous droits réservés. Examineur : Pr. Kimbi Xaveria.
//       </footer>

//       {/* MODAL DE CONNEXION */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>🔐 Connexion</h3>
//             <form onSubmit={handleLoginSubmit}>
//               <div style={{ marginBottom: '12px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Identifiant (Username)</label>
//                 <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} placeholder="ex: alice" />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} placeholder="••••••••" />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsLoginOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL D'INSCRIPTION */}
//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>📝 Ouverture de Compte</h3>
//             <form onSubmit={handleRegisterSubmit}>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nom complet</label>
//                 <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} placeholder="MENGUE Alice" />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Prenom d'utilisateur</label>
//                 <input type="text" required value={regForm.prenom} onChange={e => setRegForm({...regForm, prenom: e.target.value})} style={inputStyle} placeholder="alice_m" />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email</label>
//                 <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} placeholder="alice@ecobank.cm" />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={regForm.motDePasseChiffre} onChange={e => setRegForm({...regForm, motDePasseChiffre: e.target.value})} style={inputStyle} placeholder="••••••••" />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Date de Naissance</label>
//                 <input type="date" required value={regForm.dateNaissance} onChange={e => setRegForm({...regForm, dateNaissance: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsRegisterOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Soumettre au microservice</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




// import React, { useState } from 'react';
// import axios from 'axios'; // Importation essentielle pour la communication REST
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';

// // --- COMPOSANT ACCUEIL MODERNISÉ ---
// function Accueil() {
//   return (
//     <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
//       {/* SECTION PRINCIPALE (HERO) */}
//       <div style={{
//         display: 'flex',
//         minHeight: '65vh',
//         position: 'relative',
//         overflow: 'hidden',
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
//         boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
//       }}>
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '45%',
//           height: '100%',
//           backgroundColor: 'white',
//           zIndex: 1,
//           clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
//         }} />

//         <div style={{
//           flex: '1',
//           zIndex: 2,
//           padding: '60px 40px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '38%',
//         }}>
//           <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
//           <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
//           <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
//             Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
//           </p>
//           <button style={{
//             width: '150px',
//             padding: '12px 24px',
//             background: 'linear-gradient(to right, #06b6d4, #22d3ee)',
//             color: 'white',
//             border: 'none',
//             borderRadius: '25px',
//             fontWeight: 'bold',
//             fontSize: '13px',
//             cursor: 'pointer',
//             boxShadow: '0 4px 10px rgba(6, 182, 212, 0.4)',
//           }}>
//             READ MORE
//           </button>
//         </div>

//         <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
//           <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
//             <g transform="translate(380, 40)">
//               <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
//               <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
//             </g>
//             <g transform="translate(320, 100) rotate(-15)">
//               <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
//               <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
//               <rect x="15" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="55" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="95" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//             </g>
//           </svg>
//         </div>
//       </div>

//       {/* CARDS INFO */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #0ea5e9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <h3>👤 Espace Relation Client</h3>
//           <p style={{ fontSize: '14px', color: '#475569' }}>Tout utilisateur peut soumettre une demande d'ouverture de compte...</p>
//         </div>
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #1e3a8a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <h3>🛠️ Espace Gestionnaire</h3>
//           <p style={{ fontSize: '14px', color: '#475569' }}>Les gestionnaires disposent des droits d'activation et de contrôle KYC...</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// // --- APP PRINCIPALE ---
// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
//   // États des formulaires connectés aux inputs
//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '' });

//   // URL racine de votre API Gateway (Port 8079) configurée pour BANQUE-USER-SERVICE
//   const API_BASE_URL = "http://localhost:8079/BANQUE-USER-SERVICE";

//     //   private String nom;
//     // private String prenom;
//     // private String motDePasseChiffre;
//     // private String role;
//     // private String dateCreation;
//     // private String email;
//   // 1️ GESTION DE L'INSCRIPTION (POST vers le Backend)
//   const handleRegisterSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api`, {
//         prenom: regForm.prenom,
//         nom: regForm.nom,
//         motDePasseChiffre: regForm.motDePasseChiffre,
//         role:"client",
//         dateNaissance: regForm.dateNaissance,
//         email: regForm.email,
//         status:"non"
//       });
      
//       alert(`Succès : ${response.data}`);
//       setIsRegisterOpen(false); // Ferme la modal
//       setRegForm({ prenom: '', nom: '', email: '', motDePasseChiffre: '', dateNaissance: '' }); // Reset
//     } catch (error) {
//       console.error("Erreur d'inscription:", error);
//       alert(error.response?.data ? `Échec : ${error.response.data}` : "Impossible de joindre la Gateway.");
//     }
//   };

//   // 2️ GESTION DE LA CONNEXION (POST vers le Backend)
//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(`${API_BASE_URL}/login`, {
//         username: loginForm.username,
//         password: loginForm.password
//       });

//       alert("Connexion réussie !");
//       setIsLoginOpen(false);
      
//       // Optionnel : Si votre backend renvoie un rôle ou un token JWT, vous pouvez rediriger automatiquement
//       // Ex: setCurrentRole('CLIENT');
//     } catch (error) {
//       console.error("Erreur de connexion:", error);
//       alert(error.response?.data ? `Échec : ${error.response.data}` : "Identifiants invalides ou serveur indisponible.");
//     }
//   };

//   const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
//   const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
//   const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '450px', position: 'relative' };
//   const cancelButtonStyle = { flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
//       {/* Navbar */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'flex', justifyContent: 'between', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ flex: 1 }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Université de Yaoundé I</span>
//         </div>
//         <div style={{ flex: 1, textAlign: 'right' }}>
//           <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
//           <button onClick={() => setIsRegisterOpen(true)} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
//           <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select>
//         </div>
//       </header>

//       {/* Main */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
//         {currentRole === 'Accueil' ? <Accueil /> : (
//           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
//             {currentRole === 'CLIENT' && <ClientDashboard />}
//             {currentRole === 'OPERATOR' && <OperatorDashboard />}
//             {currentRole === 'ADMIN' && <AdminDashboard />}
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '20px', textAlign: 'center', fontSize: '12px', marginTop: 'auto' }}>
//         © 2026 Ecobank Microservices. Tous droits réservés. Examineur : Pr. Kimbi Xaveria.
//       </footer>

//       {/* MODAL DE CONNEXION */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>🔐 Connexion</h3>
//             <form onSubmit={handleLoginSubmit}>
//               <div style={{ marginBottom: '12px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Identifiant (Username)</label>
//                 <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} placeholder="ex: alice" />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} placeholder="••••••••" />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsLoginOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* MODAL D'INSCRIPTION */}
//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>📝 Ouverture de Compte</h3>
//             <form onSubmit={handleRegisterSubmit}>

//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nom complet</label>
//                 <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} placeholder="MENGUE Alice" />
//               </div>


//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Prenom d'utilisateur</label>
//                 <input type="text" required value={regForm.prenom} onChange={e => setRegForm({...regForm, prenom: e.target.value})} style={inputStyle} placeholder="alice_m" />
//               </div>

//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Email</label>
//                 <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} placeholder="alice@ecobank.cm" />
//               </div>
//               <div style={{ marginBottom: '10px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={regForm.motDePasseChiffre} onChange={e => setRegForm({...regForm, motDePasseChiffre: e.target.value})} style={inputStyle} placeholder="••••••••" />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Date de Naissance</label>
//                 <input type="date" required value={regForm.dateNaissance} onChange={e => setRegForm({...regForm, dateNaissance: e.target.value})} style={inputStyle} />
//               </div>
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsRegisterOpen(false)} style={cancelButtonStyle}>Annuler</button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Soumettre au microservice</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// import React, { useState } from 'react';
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';

// // --- COMPOSANT ACCUEIL MODERNISÉ (STYLE LANDING PAGE ET SECTIONS PRO) ---
// function Accueil() {
//   return (
//     <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      
//       {/* SECTION PRINCIPALE (HERO) */}
//       <div style={{
//         display: 'flex',
//         minHeight: '65vh',
//         position: 'relative',
//         overflow: 'hidden',
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
//         boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
//       }}>
        
//         {/* Vague blanche gauche */}
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '45%',
//           height: '100%',
//           backgroundColor: 'white',
//           zIndex: 1,
//           clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
//         }} />

//         {/* Contenu de Gauche */}
//         <div style={{
//           flex: '1',
//           zIndex: 2,
//           padding: '60px 40px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '38%',
//         }}>
//           <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
//           <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
          
//           <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
//             Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
//           </p>

//           <button style={{
//             width: '150px',
//             padding: '12px 24px',
//             background: 'linear-gradient(to right, #06b6d4, #22d3ee)',
//             color: 'white',
//             border: 'none',
//             borderRadius: '25px',
//             fontWeight: 'bold',
//             fontSize: '13px',
//             cursor: 'pointer',
//             boxShadow: '0 4px 10px rgba(6, 182, 212, 0.4)',
//           }}>
//             READ MORE
//           </button>

//           <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
//             <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1e3a8a' }}></span>
//             <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22d3ee' }}></span>
//             <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22d3ee' }}></span>
//           </div>
//         </div>

//         {/* Contenu de Droite (Dessin SVG) */}
//         <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
//           <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
//             <g transform="translate(380, 40)">
//               <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
//               <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
//             </g>
//             <g transform="translate(320, 100) rotate(-15)">
//               <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
//               <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
//               <rect x="15" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="55" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="95" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="15" y="135" width="30" height="20" rx="4" fill="#ef4444" />
//               <rect x="55" y="135" width="30" height="20" rx="4" fill="#eab308" />
//               <rect x="95" y="135" width="30" height="20" rx="4" fill="#22c55e" />
//             </g>
//             <g transform="translate(280, 260) rotate(20)">
//               <rect x="0" y="0" width="150" height="90" rx="8" fill="#1d4ed8" opacity="0.9" />
//               <rect x="15" y="25" width="25" height="18" rx="3" fill="#facc15" />
//               <text x="15" y="70" fill="white" fontSize="8" fontFamily="monospace">0000 0000 0000</text>
//             </g>
//             <g transform="translate(250, 70)">
//               <ellipse cx="25" cy="85" rx="35" ry="15" fill="#facc15" />
//               <path d="M25 35 L15 85 L30 85 Z" fill="#2563eb" />
//               <circle cx="25" cy="20" r="10" fill="#fbcfe8" />
//             </g>
//             <g transform="translate(470, 140)">
//               <circle cx="20" cy="20" r="9" fill="#fbcfe8" />
//               <rect x="11" y="30" width="18" height="55" rx="4" fill="#3b82f6" />
//               <rect x="9" y="30" width="22" height="30" rx="4" fill="#f8fafc" />
//               <line x1="20" y1="30" x2="20" y2="45" stroke="#dc2626" strokeWidth="3" />
//             </g>
//             <g transform="translate(490, 270)">
//               <ellipse cx="30" cy="24" rx="28" ry="12" fill="#facc15" />
//             </g>
//           </svg>
//         </div>
//       </div>

//       {/* CARDS INFO CLIENTS & OPÉRATEURS */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
        
//         {/* Carte Client */}
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #0ea5e9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <div style={{ display: 'flex', itemsCenter: 'center', marginBottom: '15px' }}>
//             <span style={{ fontSize: '30px', marginRight: '15px' }}>👤</span>
//             <div>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Espace Relation Client</h3>
//               <span style={{ fontSize: '12px', color: '#64748b' }}>Statut & Demandes Comptes</span>
//             </div>
//           </div>
//           <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
//             Tout utilisateur peut soumettre une demande d'ouverture de compte. Le profil reste crypté et bloqué sur les nœuds distribués jusqu’à son traitement effectif.
//           </p>
//           <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
//             <div><strong style={{ color: '#0ea5e9', fontSize: '18px' }}>E-Banking</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Accès Privé</div></div>
//             <div><strong style={{ color: '#0ea5e9', fontSize: '18px' }}>24h/24</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Disponibilité</div></div>
//           </div>
//         </div>

//         {/* Carte Opérateur */}
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #1e3a8a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <div style={{ display: 'flex', itemsCenter: 'center', marginBottom: '15px' }}>
//             <span style={{ fontSize: '30px', marginRight: '15px' }}>🛠️</span>
//             <div>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Espace Gestionnaire / Opérateur</h3>
//               <span style={{ fontSize: '12px', color: '#64748b' }}>Supervision des transactions</span>
//             </div>
//           </div>
//           <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
//             Les gestionnaires disposent des droits d'activation, de blocage de profils et d'audit sur l'arbre des transactions. Leurs actions sont tracées et journalisées.
//           </p>
//           <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
//             <div><strong style={{ color: '#1e3a8a', fontSize: '18px' }}>Validation</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Contrôle KYC</div></div>
//             <div><strong style={{ color: '#1e3a8a', fontSize: '18px' }}>Sécurisé</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Audit Interne</div></div>
//           </div>
//         </div>

//       </div>

//     </div>
//   );
// }

// // --- BOÎTE D'APPLICATION PRINCIPALE ---
// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ username: '', nom: '', email: '' });

//   const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
//   const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
//   const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', position: 'relative' };
  
//   // Style partagé pour les boutons d'annulation
//   const cancelButtonStyle = {
//     flex: 1,
//     padding: '12px',
//     background: '#e2e8f0',
//     color: '#475569',
//     border: 'none',
//     borderRadius: '6px',
//     fontWeight: 'bold',
//     cursor: 'pointer',
//     textAlign: 'center'
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      
//       {/* Navbar */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'table', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '40%' }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Travaux Pratiques</span>
//         </div>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '60%', textAlign: 'right' }}>
//           <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
//           <button onClick={() => setIsRegisterOpen(true)} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
//           <span style={{ marginRight: '10px', fontSize: '14px', fontWeight: '500' }}>Espace :</span>
//           <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', backgroundColor: 'white', color: '#1e3a8a', cursor: 'pointer' }}>
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
//         {currentRole === 'Accueil' ? (
//           <Accueil />
//         ) : (
//           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//             {currentRole === 'CLIENT' && <ClientDashboard />}
//             {currentRole === 'OPERATOR' && <OperatorDashboard />}
//             {currentRole === 'ADMIN' && <AdminDashboard />}
//           </div>
//         )}
//       </main>

//       {/* PIED DE PAGE */}
//       <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', paddingTop: '40px', paddingBottom: '30px', marginTop: '60px', borderTop: '4px solid #0ea5e9' }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px' }}>
//           <div>
//             <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px' }}>ECOBANK DISTRIBUÉE</h4>
//             <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
//               Projet Pratique d'Architecture Logicielle (INF462). <br />
//               Développé au Département d'Informatique, Faculté des Sciences.
//             </p>
//             <div style={{ marginTop: '15px', fontSize: '12px', color: '#38bdf8' }}>🏫 Université de Yaoundé I — Cameroun</div>
//           </div>
//           <div>
//             <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px' }}>Navigation Architecture</h4>
//             <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
//               <li>• Clients : Formulaire d'inscription & Dépôts</li>
//               <li>• Opérateurs : Approbation KYC & Déblocage</li>
//               <li>• Administrateurs : Supervision du Cluster</li>
//             </ul>
//           </div>
//           <div>
//             <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px' }}>Évaluation Académique</h4>
//             <p style={{ fontSize: '13px', margin: '0 0 8px 0' }}><strong>Examinateur :</strong> Pr. Kimbi Xaveria</p>
//             <p style={{ fontSize: '13px', margin: 0 }}><strong>Année Académique :</strong> 2026</p>
//             <div style={{ display: 'inline-block', marginTop: '12px', padding: '4px 8px', backgroundColor: '#1e293b', color: '#22c55e', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
//               🟢 STATUT RMI-RÉSEAU : CONNECTÉ
//             </div>
//           </div>
//         </div>
//         <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b' }}>
//           &copy; 2026 — Tous droits réservés. Master Informatique / Technologie Web & Systèmes Distribués.
//         </div>
//       </footer>

//       {/* --- FORMULAIRE DE CONNEXION AVEC BOUTON ANNULER --- */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>🔐 Connexion</h3>
//             <form onSubmit={(e) => { e.preventDefault(); setIsLoginOpen(false); }}>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Username</label><input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} /></div>
//               <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label><input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} /></div>
              
//               {/* Conteneur de boutons côte à côte */}
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsLoginOpen(false)} style={cancelButtonStyle}>
//                   Annuler
//                 </button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                   Se connecter
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* --- FORMULAIRE D'INSCRIPTION AVEC BOUTON ANNULER --- */}
//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>📝 Ouverture de Compte</h3>
//             <form onSubmit={(e) => { e.preventDefault(); setIsRegisterOpen(false); }}>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nom</label><input type="text" required value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} style={inputStyle} /></div>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Prenom</label><input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} /></div>
//               <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email</label><input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} /></div>

//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Password</label><input type="text" required value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} style={inputStyle} /></div>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Date Naissance</label><input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} /></div>

              
//               {/* Conteneur de boutons côte à côte */}
//               <div style={{ display: 'flex', gap: '10px' }}>
//                 <button type="button" onClick={() => setIsRegisterOpen(false)} style={cancelButtonStyle}>
//                   Annuler
//                 </button>
//                 <button type="submit" style={{ flex: 2, padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                   Soumettre
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }





// import React, { useState } from 'react';
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';

// // --- COMPOSANT ACCUEIL MODERNISÉ (STYLE LANDING PAGE ET SECTIONS PRO) ---
// function Accueil() {
//   return (
//     <div style={{ fontFamily: '"Segoe UI", Roboto, sans-serif' }}>
      
//       {/* SECTION PRINCIPALE (HERO) */}
//       <div style={{
//         display: 'flex',
//         minHeight: '65vh',
//         position: 'relative',
//         overflow: 'hidden',
//         borderRadius: '12px',
//         background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 40%, #38bdf8 100%)',
//         boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
//       }}>
        
//         {/* Vague blanche gauche */}
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '45%',
//           height: '100%',
//           backgroundColor: 'white',
//           zIndex: 1,
//           clipPath: 'polygon(0 0, 80% 0, 100% 100%, 0% 100%)',
//         }} />

//         {/* Contenu de Gauche */}
//         <div style={{
//           flex: '1',
//           zIndex: 2,
//           padding: '60px 40px',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           maxWidth: '38%',
//         }}>
//           <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1e3a8a', lineHeight: '1.1', margin: '0' }}>Banking</h1>
//           <h2 style={{ fontSize: '48px', fontWeight: '300', color: '#06b6d4', margin: '0 0 25px 0' }}>operation</h2>
          
//           <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '35px', fontStyle: 'italic' }}>
//             Système bancaire distribué sécurisé, flexible et conçu pour la gestion en temps réel des flux financiers intra-bancaires.
//           </p>

//           <button style={{
//             width: '150px',
//             padding: '12px 24px',
//             background: 'linear-gradient(to right, #06b6d4, #22d3ee)',
//             color: 'white',
//             border: 'none',
//             borderRadius: '25px',
//             fontWeight: 'bold',
//             fontSize: '13px',
//             cursor: 'pointer',
//             boxShadow: '0 4px 10px rgba(6, 182, 212, 0.4)',
//           }}>
//             READ MORE
//           </button>

//           <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
//             <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1e3a8a' }}></span>
//             <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22d3ee' }}></span>
//             <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22d3ee' }}></span>
//           </div>
//         </div>

//         {/* Contenu de Droite (Dessin SVG) */}
//         <div style={{ flex: '1.5', zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
//           <svg viewBox="0 0 600 400" style={{ width: '90%', height: 'auto' }}>
//             <g transform="translate(380, 40)">
//               <ellipse cx="30" cy="40" rx="25" ry="12" fill="#eab308" />
//               <ellipse cx="30" cy="32" rx="25" ry="12" fill="#facc15" />
//             </g>
//             <g transform="translate(320, 100) rotate(-15)">
//               <rect x="0" y="0" width="160" height="240" rx="20" fill="#94a3b8" />
//               <rect x="10" y="10" width="140" height="80" rx="10" fill="#1e293b" />
//               <rect x="15" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="55" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="95" y="105" width="30" height="20" rx="4" fill="#cbd5e1" />
//               <rect x="15" y="135" width="30" height="20" rx="4" fill="#ef4444" />
//               <rect x="55" y="135" width="30" height="20" rx="4" fill="#eab308" />
//               <rect x="95" y="135" width="30" height="20" rx="4" fill="#22c55e" />
//             </g>
//             <g transform="translate(280, 260) rotate(20)">
//               <rect x="0" y="0" width="150" height="90" rx="8" fill="#1d4ed8" opacity="0.9" />
//               <rect x="15" y="25" width="25" height="18" rx="3" fill="#facc15" />
//               <text x="15" y="70" fill="white" fontSize="8" fontFamily="monospace">0000 0000 0000</text>
//             </g>
//             <g transform="translate(250, 70)">
//               <ellipse cx="25" cy="85" rx="35" ry="15" fill="#facc15" />
//               <path d="M25 35 L15 85 L30 85 Z" fill="#2563eb" />
//               <circle cx="25" cy="20" r="10" fill="#fbcfe8" />
//             </g>
//             <g transform="translate(470, 140)">
//               <circle cx="20" cy="20" r="9" fill="#fbcfe8" />
//               <rect x="11" y="30" width="18" height="55" rx="4" fill="#3b82f6" />
//               <rect x="9" y="30" width="22" height="30" rx="4" fill="#f8fafc" />
//               <line x1="20" y1="30" x2="20" y2="45" stroke="#dc2626" strokeWidth="3" />
//             </g>
//             <g transform="translate(490, 270)">
//               <ellipse cx="30" cy="24" rx="28" ry="12" fill="#facc15" />
//             </g>
//           </svg>
//         </div>
//       </div>

//       {/* --- NOUVELLE SECTION : CARDS INFO CLIENTS & OPÉRATEURS --- */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
        
//         {/* Carte Client */}
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #0ea5e9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
//             <span style={{ fontSize: '30px', marginRight: '15px' }}>👤</span>
//             <div>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Espace Relation Client</h3>
//               <span style={{ fontSize: '12px', color: '#64748b' }}>Statut & Demandes Comptes</span>
//             </div>
//           </div>
//           <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
//             Tout utilisateur peut soumettre une demande d'ouverture de compte. Le profil reste crypté et bloqué sur les nœuds distribués jusqu’à son traitement effectif.
//           </p>
//           <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
//             <div><strong style={{ color: '#0ea5e9', fontSize: '18px' }}>E-Banking</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Accès Privé</div></div>
//             <div><strong style={{ color: '#0ea5e9', fontSize: '18px' }}>24h/24</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Disponibilité</div></div>
//           </div>
//         </div>

//         {/* Carte Opérateur */}
//         <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', borderLeft: '5px solid #1e3a8a', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
//             <span style={{ fontSize: '30px', marginRight: '15px' }}>🛠️</span>
//             <div>
//               <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Espace Gestionnaire / Opérateur</h3>
//               <span style={{ fontSize: '12px', color: '#64748b' }}>Supervision des transactions</span>
//             </div>
//           </div>
//           <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
//             Les gestionnaires disposent des droits d'activation, de blocage de profils et d'audit sur l'arbre des transactions. Leurs actions sont tracées et journalisées.
//           </p>
//           <div style={{ display: 'flex', gap: '15px', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
//             <div><strong style={{ color: '#1e3a8a', fontSize: '18px' }}>Validation</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Contrôle KYC</div></div>
//             <div><strong style={{ color: '#1e3a8a', fontSize: '18px' }}>Sécurisé</strong><div style={{ fontSize: '11px', color: '#94a3b8' }}>Audit Interne</div></div>
//           </div>
//         </div>

//       </div>

//     </div>
//   );
// }

// // --- BOÎTE D'APPLICATION PRINCIPALE ---
// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);
//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ username: '', nom: '', email: '' });

//   const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', marginTop: '5px' };
//   const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
//   const modalContentStyle = { background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', position: 'relative' };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
      
//       {/* Navbar */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'table', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '40%' }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Travaux Pratiques</span>
//         </div>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '60%', textAlign: 'right' }}>
//           <button onClick={() => setIsLoginOpen(true)} style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Se Connecter</button>
//           <button onClick={() => setIsRegisterOpen(true)} style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}>Créer un Compte</button>
//           <span style={{ marginRight: '10px', fontSize: '14px', fontWeight: '500' }}>Espace :</span>
//           <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', backgroundColor: 'white', color: '#1e3a8a', cursor: 'pointer' }}>
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto', flex: 1, width: '100%', boxSizing: 'border-box' }}>
//         {currentRole === 'Accueil' ? (
//           <Accueil />
//         ) : (
//           <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//             {currentRole === 'CLIENT' && <ClientDashboard />}
//             {currentRole === 'OPERATOR' && <OperatorDashboard />}
//             {currentRole === 'ADMIN' && <AdminDashboard />}
//           </div>
//         )}
//       </main>

//       {/* --- NOUVEAU PIED DE PAGE EN COLONNES PROFESSIONNEL --- */}
//       <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', paddingTop: '40px', paddingBottom: '30px', marginTop: '60px', borderTop: '4px solid #0ea5e9' }}>
//         <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '40px' }}>
          
//           {/* Colonne 1: Université & Cours */}
//           <div>
//             <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px' }}>ECOBANK DISTRIBUÉE</h4>
//             <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
//               Projet Pratique d'Architecture Logicielle (INF462). <br />
//               Développé au Département d'Informatique, Faculté des Sciences.
//             </p>
//             <div style={{ marginTop: '15px', fontSize: '12px', color: '#38bdf8' }}>
//               🏫 Université de Yaoundé I — Cameroun
//             </div>
//           </div>

//           {/* Colonne 2: Accès Rapide */}
//           <div>
//             <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px' }}>Navigation Architecture</h4>
//             <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', lineHeight: '2' }}>
//               <li>• Clients : Formulaire d'inscription & Dépôts</li>
//               <li>• Opérateurs : Approbation KYC & Déblocage</li>
//               <li>• Administrateurs : Supervision du Cluster</li>
//             </ul>
//           </div>

//           {/* Colonne 3: Cadre d'évaluation */}
//           <div>
//             <h4 style={{ color: 'white', margin: '0 0 12px 0', fontSize: '15px' }}>Évaluation Académique</h4>
//             <p style={{ fontSize: '13px', margin: '0 0 8px 0' }}><strong>Examinateur :</strong> Pr. Kimbi Xaveria</p>
//             <p style={{ fontSize: '13px', margin: 0 }}><strong>Année Académique :</strong> 2026</p>
//             <div style={{ display: 'inline-block', marginTop: '12px', padding: '4px 8px', backgroundColor: '#1e293b', color: '#22c55e', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
//               🟢 STATUT RMI-RÉSEAU : CONNECTÉ
//             </div>
//           </div>
//         </div>

//         {/* Droits d'auteur de fin */}
//         <div style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #1e293b', fontSize: '12px', color: '#64748b' }}>
//           &copy; 2026 — Tous droits réservés. Master Informatique / Technologie Web & Systèmes Distribués.
//         </div>
//       </footer>

//       {/* MODALS DE CONNEXION ET INSCRIPTION (Restauration propre) */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>🔐 Connexion</h3>
//             <form onSubmit={(e) => { e.preventDefault(); setIsLoginOpen(false); }}>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Username</label><input type="text" required style={inputStyle} /></div>
//               <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label><input type="password" required style={inputStyle} /></div>
//               <button type="submit" style={{ padding: '12px', width: '100%', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Se connecter</button>
//             </form>
//           </div>
//         </div>
//       )}

//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <h3 style={{ margin: '0 0 15px 0' }}>📝 Ouverture de Compte</h3>
//             <form onSubmit={(e) => { e.preventDefault(); setIsRegisterOpen(false); }}>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Username</label><input type="text" required style={inputStyle} /></div>
//               <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nom Complet</label><input type="text" required style={inputStyle} /></div>
//               <div style={{ marginBottom: '20px' }}><label style={{ fontSize: '14px', fontWeight: 'bold' }}>Email</label><input type="email" required style={inputStyle} /></div>
//               <button type="submit" style={{ padding: '12px', width: '100%', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Soumettre</button>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }




// import React, { useState } from 'react';
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';
// import Accueil from './views/Accueil';

// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');
  
//   // États pour la gestion des Pop-ups (Modals)
//   const [isLoginOpen, setIsLoginOpen] = useState(false);
//   const [isRegisterOpen, setIsRegisterOpen] = useState(false);

//   // États pour les formulaires (Exemples de structures)
//   const [loginForm, setLoginForm] = useState({ username: '', password: '' });
//   const [regForm, setRegForm] = useState({ username: '', nom: '', email: '' });

//   // Fonctions de soumission
//   const handleLogin = (e) => {
//     e.preventDefault();
//     console.log("Connexion avec :", loginForm);
//     // Ajoutez ici votre logique de connexion (API, etc.)
//     setIsLoginOpen(false); // Fermer le pop-up après soumission
//   };

//   const handleRegister = (e) => {
//     e.preventDefault();
//     console.log("Inscription avec :", regForm);
//     // Ajoutez ici votre logique d'inscription
//     setIsRegisterOpen(false); // Fermer le pop-up après soumission
//   };

//   // Style générique pour les champs de saisie
//   const inputStyle = {
//     width: '100%',
//     padding: '10px',
//     borderRadius: '6px',
//     border: '1px solid #cbd5e1',
//     boxSizing: 'border-box',
//     marginTop: '5px'
//   };

//   // Style générique pour l'arrière-plan des pop-ups
//   const modalOverlayStyle = {
//     position: 'fixed',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000
//   };

//   const modalContentStyle = {
//     background: 'white',
//     padding: '30px',
//     borderRadius: '12px',
//     boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
//     maxWidth: '500px',
//     width: '90%',
//     position: 'relative'
//   };

//   const closeButtonStyle = {
//     position: 'absolute',
//     top: '15px',
//     right: '15px',
//     background: 'none',
//     border: 'none',
//     fontSize: '20px',
//     cursor: 'pointer',
//     color: '#64748b'
//   };

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0 }}>
      
//       {/* Barre de navigation supérieure */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'table', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '40%' }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Travaux Pratiques</span>
//         </div>
        
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '60%', textAlign: 'right' }}>
//           {/* Boutons d'action pour ouvrir les pop-ups */}
//           <button 
//             onClick={() => setIsLoginOpen(true)}
//             style={{ marginRight: '10px', padding: '8px 16px', borderRadius: '6px', border: '1px solid white', backgroundColor: 'transparent', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
//           >
//             Se Connecter
//           </button>
          
//           <button 
//             onClick={() => setIsRegisterOpen(true)}
//             style={{ marginRight: '25px', padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#93c5fd', color: '#1e3a8a', fontWeight: 'bold', cursor: 'pointer' }}
//           >
//             Créer un Compte
//           </button>

//           <span style={{ marginRight: '10px', fontSize: '14px', fontWeight: '500' }}>Espace :</span>
//           <select 
//             value={currentRole} 
//             onChange={(e) => setCurrentRole(e.target.value)} 
//             style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', backgroundColor: 'white', color: '#1e3a8a', cursor: 'pointer' }}
//           >
//             <option value="Accueil">ACCUEIL</option>
//             <option value="CLIENT">ESPACE CLIENT</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR</option>
//           </select>
//         </div>
//       </header>

//       {/* Contenu principal de la page */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
//         <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
//           {currentRole === 'Accueil' && <Accueil />}
//           {currentRole === 'CLIENT' && <ClientDashboard />}
//           {currentRole === 'OPERATOR' && <OperatorDashboard />}
//           {currentRole === 'ADMIN' && <AdminDashboard />}
//         </div>
//       </main>

//       {/* --- POP-UP DE CONNEXION --- */}
//       {isLoginOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsLoginOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <button style={closeButtonStyle} onClick={() => setIsLoginOpen(false)}>&times;</button>
            
//             <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>🔐 Connexion à votre Espace</h3>
//             <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Entrez vos identifiants pour accéder à votre tableau de bord.</p>
            
//             <form onSubmit={handleLogin}>
//               <div style={{ marginBottom: '15px' }}>
//                 <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Nom d'utilisateur</label>
//                 <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} style={inputStyle} placeholder="Ex: amengue" />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Mot de passe</label>
//                 <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} style={inputStyle} placeholder="••••••••" />
//               </div>
//               <button type="submit" style={{ padding: '12px', width: '100%', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                 Se connecter
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* --- POP-UP D'INSCRIPTION --- */}
//       {isRegisterOpen && (
//         <div style={modalOverlayStyle} onClick={() => setIsRegisterOpen(false)}>
//           <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
//             <button style={closeButtonStyle} onClick={() => setIsRegisterOpen(false)}>&times;</button>
            
//             <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>📝 Demande d'Ouverture de Compte Bancaire</h3>
//             <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Le compte créé restera bloqué jusqu'à ce qu'un <strong>Opérateur</strong> se connecte pour valider et activer son profil.</p>
            
//             <form onSubmit={handleRegister}>
//               <div style={{ marginBottom: '15px' }}>
//                 <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Nom d'utilisateur (Username)</label>
//                 <input type="text" required value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} style={inputStyle} placeholder="Ex: amengue" />
//               </div>
//               <div style={{ marginBottom: '15px' }}>
//                 <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Nom Complet</label>
//                 <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} placeholder="Ex: MENGUE Alice" />
//               </div>
//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold' }}>Adresse Email</label>
//                 <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} placeholder="Ex: alice@domain.cm" />
//               </div>
//               <button type="submit" style={{ padding: '12px', width: '100%', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                 Soumettre ma demande à l'Opérateur
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       <footer style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px', marginTop: '40px', borderTop: '1px solid #e2e8f0' }}>
//         &copy; 2026 — Université de Yaoundé I — Département d'Informatique. Examinateur : Pr. Kimbi Xaveria
//       </footer>

//     </div>
//   );
// }






// import React, { useState } from 'react';
// import ClientDashboard from './views/ClientDashboard';
// import OperatorDashboard from './views/OperatorDashboard';
// import AdminDashboard from './views/AdminDashboard';
// import Accueil from './views/Accueil';

// export default function App() {
//   const [currentRole, setCurrentRole] = useState('Accueil');

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', margin: 0, padding: 0 }}>
//       {/* Barre de navigation supérieure */}
//       <header style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '15px 30px', display: 'table', width: '100%', boxSizing: 'border-box' }}>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '50%' }}>
//           <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>ECOBANK-DISTRIBUEE-UI</h1>
//           <span style={{ fontSize: '11px', color: '#93c5fd' }}>Architecture Logicielle INF462 — Travaux Pratiques</span>
//         </div>
//         <div style={{ display: 'table-cell', verticalAlign: 'middle', width: '50%', textAlign: 'right' }}>
//           <span style={{ marginRight: '15px', fontSize: '14px', fontWeight: '500' }}>Changer d'Espace Utilisateur :</span>
//           <button style={{ marginRight: '15px', fontSize: '14px', fontWeight: '500' }}>connexion :</button>
//           <select 
//             value={currentRole} 
//             onChange={(e) => setCurrentRole(e.target.value)} 
//             style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', backgroundColor: 'white', color: '#1e3a8a', cursor: 'pointer' }}
//           >
//             <option value="Accueil">ESPACE CLIENT (Personnel)</option>
//             <option value="CLIENT">ESPACE CLIENT (Personnel)</option>
//             <option value="OPERATOR">ESPACE OPÉRATEUR (Gestionnaire)</option>
//             <option value="ADMIN">ESPACE ADMINISTRATEUR (Supervision)</option>
//           </select>
//         </div>
//       </header>

//       {/* Contenu de la page selon le rôle sélectionné */}
//       <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
//         <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}>
//           {currentRole === 'Accueil' && <Accueil />}
//           {currentRole === 'CLIENT' && <ClientDashboard />}
//           {currentRole === 'OPERATOR' && <OperatorDashboard />}
//           {currentRole === 'ADMIN' && <AdminDashboard />}
//         </div>
//       </main>

//       <footer style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px', marginTop: '40px', borderTop: '1px solid #e2e8f0' }}>
//         &copy; 2026 — Université de Yaoundé I — Département d'Informatique. Examinateur : Pr. Kimbi Xaveria
//       </footer>



//          <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 6px confidentielrgba(0,0,0,0.05)', maxWidth: '600px', margin: '0 auto' }}>
//             <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>📝 Demande d'Ouverture de Compte Bancaire</h3>
//             <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Le compte créé restera bloqué jusqu'à ce qu'un <strong>Opérateur</strong> se connecte pour valider et activer son profil.</p>
            
//             <form onSubmit={handleRegister}>
//               <div style={{ marginBottom: '15px' }}>
//                 <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Nom d'utilisateur (Username)</label>
//                 <input type="text" required value={regForm.username} onChange={e => setRegForm({...regForm, username: e.target.value})} style={inputStyle} placeholder="Ex: amengue" />
//               </div>
//               <div style={{ marginBottom: '15px' }}>
//                 <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Nom Complet</label>
//                 <input type="text" required value={regForm.nom} onChange={e => setRegForm({...regForm, nom: e.target.value})} style={inputStyle} placeholder="Ex: MENGUE Alice" />
//               </div>
//               <div style={{ marginBottom: '15px' }}>
//                 <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Adresse Email</label>
//                 <input type="email" required value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} style={inputStyle} placeholder="Ex: alice@domain.cm" />
//               </div>
//               <button type="submit" style={{ padding: '12px', width: '100%', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
//                 Soumettre ma demande à l'Opérateur
//               </button>
//             </form>
//           </div>


//     </div>
//   );
// }