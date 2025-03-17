
import React, { useState, useCallback } from 'react';
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
  isLoading?: boolean;
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
  isLoading = false,
  deleteMessage,
  updateMessage
}) => {
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState<StandardizedMessage | null>(null);

  const handleDelete = useCallback(async () => {
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
  }, [messageToDelete, deleteMessage]);

  // Handle message editing
  const handleEdit = useCallback((message: StandardizedMessage) => {
    console.log("Editing message:", message);
    setMessageToEdit(message);
  }, []);

  // Handle message saving
  const handleSave = useCallback(async (updatedMessage: Partial<StandardizedMessage>) => {
    if (messageToEdit && updateMessage) {
      console.log("Saving message:", updatedMessage);
      await updateMessage(messageToEdit.id, updatedMessage);
      setMessageToEdit(null);
    }
  }, [messageToEdit, updateMessage]);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Mensagens de Contato</h2>
        <div className="flex justify-center items-center min-h-[200px]">
          <p>Carregando mensagens...</p>
        </div>
      </div>
    );
  }

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
            console.log("Message data:", { id: message.id, extractedData });
            
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
