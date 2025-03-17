
import React, { useState } from 'react';
import { StandardizedMessage } from "@/types/messages";
import EmptyMessageState from './EmptyMessageState';
import MessageCard from './MessageCard';
import { MessageEditDialog } from "./MessageEditDialog";
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { extractMessageData } from '@/utils/messageDataExtractor';

interface CustomerMessagesListProps {
  tableExists: boolean;
  mensagens: StandardizedMessage[];
  formatDate: (dateString: string) => string;
  checkTables: () => void;
  createTable: () => Promise<void>;
  isCreatingTable: boolean;
  deleteMessage?: (id: string) => Promise<void>;
  updateMessage?: (id: string, data: Partial<StandardizedMessage>) => Promise<void>;
}

const CustomerMessagesList: React.FC<CustomerMessagesListProps> = ({
  tableExists,
  mensagens,
  formatDate,
  checkTables,
  createTable,
  isCreatingTable,
  deleteMessage,
  updateMessage
}) => {
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState<StandardizedMessage | null>(null);

  const handleDelete = async () => {
    if (!messageToDelete || !deleteMessage) return;
    
    setIsDeleting(true);
    try {
      await deleteMessage(messageToDelete);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
      setMessageToDelete(null);
    }
  };

  // Handle message editing
  const handleEdit = (message: StandardizedMessage) => {
    setMessageToEdit(message);
  };

  // Handle message saving
  const handleSave = async (updatedMessage: Partial<StandardizedMessage>) => {
    if (messageToEdit && updateMessage) {
      await updateMessage(messageToEdit.id, updatedMessage);
      setMessageToEdit(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mensagens de Contato</h2>
      
      {/* Show empty state when there are no messages or no table */}
      {!tableExists || mensagens.length === 0 ? (
        <EmptyMessageState 
          tableExists={tableExists}
          isCreatingTable={isCreatingTable}
          createTable={createTable}
          checkTables={checkTables}
        />
      ) : (
        <div className="grid gap-6">
          {mensagens.map((message) => {
            const extractedData = extractMessageData(message.message);
            
            return (
              <MessageCard
                key={message.id}
                message={message}
                formatDate={formatDate}
                onDelete={(id) => setMessageToDelete(id)}
                onEdit={handleEdit}
                extractedData={extractedData}
              />
            );
          })}
        </div>
      )}

      {/* Confirmation dialog for message deletion */}
      <DeleteConfirmDialog
        isOpen={!!messageToDelete}
        isDeleting={isDeleting}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleDelete}
      />

      {/* Edit message dialog */}
      {updateMessage && (
        <MessageEditDialog 
          message={messageToEdit} 
          onClose={() => setMessageToEdit(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CustomerMessagesList;
