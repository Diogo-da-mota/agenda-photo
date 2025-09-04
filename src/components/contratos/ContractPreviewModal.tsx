import React from 'react';

interface ContractPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractData: any;
}

const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({
  isOpen,
  onClose,
  contractData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pré-visualização do Contrato</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <p>Contrato em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
};

export default ContractPreviewModal;