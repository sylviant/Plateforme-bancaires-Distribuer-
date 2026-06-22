import React, { useState } from 'react';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([
    { id: '1', acteur: 'Client-Pierre', action: 'TRANSFERT_INTER_INITIE', ressource: 'ms-transactions', date: '2026-06-18 15:43:12', ip: '192.168.1.45' },
    { id: '2', acteur: 'Python-OCR-Worker', action: 'EXTRACTION_TEXTE_SUCCES', ressource: 'ms-ocr', date: '2026-06-18 15:41:02', ip: '10.0.2.15' },
    { id: '3', acteur: 'System-Gateway', action: 'AUTHENTIFICATION_JWT_VALIDE', ressource: 'api-gateway', date: '2026-06-18 15:40:00', ip: '192.168.1.100' }
  ]);

  return (
    <div>
      <h2 style={{ color: '#991b1b' }}>Supervision Globale de l'Infrastructure Microservices (ms-audit)</h2>
      <p style={{ fontSize: '14px', color: '#64748b' }}>Logs système immuables consommés en temps réel depuis le bus de messages RabbitMQ.</p>
      
      <div style={{ display: 'table', width: '100%', borderSpacing: '15px', marginBottom: '25px' }}>
        <div style={{ display: 'table-cell', background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>MICROSERVICES EN LIGNE</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>9 / 9</div>
        </div>
        <div style={{ display: 'table-cell', background: '#d1fae5', color: '#065f46', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>MESSAGES TRANSITEURS (AMQP)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>1,432</div>
        </div>
        <div style={{ display: 'table-cell', background: '#e0f2fe', color: '#0369a1', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold' }}>REQUÊTES TOTAL GATEWAY</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>28,918</div>
        </div>
      </div>

      <h3>Journal des Événements et de Traçabilité Réseau</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th style={thStyle}>Horodatage</th>
            <th style={thStyle}>Composant Source</th>
            <th style={thStyle}>Acteur Système</th>
            <th style={thStyle}>Action Enregistrée</th>
            <th style={thStyle}>Adresse IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '13px' }}>
              <td style={tdStyle}>{log.date}</td>
              <td style={tdStyle}><span style={{ color: '#2563eb' }}>{log.ressource}</span></td>
              <td style={tdStyle}>{log.acteur}</td>
              <td style={{ ...tdStyle, fontWeight: 'bold', color: '#1e293b' }}>{log.action}</td>
              <td style={tdStyle}>{log.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { padding: '12px', borderBottom: '2px solid #cbd5e1', color: '#334155' };
const tdStyle = { padding: '12px', borderBottom: '1px solid #e2e8f0' };