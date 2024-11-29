import React, { useState } from 'react';

const SucursalModal = ({ isOpen, onClose, setSelectedBranch, setNotes }) => {
  if (!isOpen) return null; 
  const [selectedBranchLocal, setLocalSelectedBranch] = useState(''); 
  const [notes, setLocalNotes] = useState(''); 

  const branchOptions = [
    'Extravagant Style Sur - Calle 1, Ciudad',
    'Extravagant Style Centro - Calle 2, Ciudad',
    'Extravagant Style Norte - Calle 3, Ciudad',
  ];

  const handleBranchSelect = (branch) => {
    setLocalSelectedBranch(branch); 
    setSelectedBranch(branch); 
  };

  const handleSave = () => {
    setNotes(notes); 
    onClose(); 
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Selecciona una Sucursal</h3>
        <select
          onChange={(e) => handleBranchSelect(e.target.value)}
          value={selectedBranchLocal} 
        >
          <option value="">Sucursal</option>
          {branchOptions.map((branch, index) => (
            <option key={index} value={branch}>
              {branch}
            </option>
          ))}
        </select>

        <textarea
          value={notes}
          onChange={(e) => setLocalNotes(e.target.value)}
          placeholder="Instrucciones o notas"
          rows="4"
          style={{ width: '100%', resize: 'none' }}
        />

        <div>
          <button className="save-modal" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default SucursalModal;