
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WebhookUrlInputProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  isLoading: boolean;
  onSaveWebhook: () => void;
  onTestWebhook: () => void;
}

const WebhookUrlInput: React.FC<WebhookUrlInputProps> = ({
  webhookUrl,
  setWebhookUrl,
  isLoading,
  onSaveWebhook,
  onTestWebhook
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor="webhook-url" className="block text-sm font-medium">
        URL do Webhook
      </label>
      <div className="flex gap-2">
        <Input
          id="webhook-url"
          type="url"
          placeholder="https://example.com/api/webhook"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={onSaveWebhook}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </Button>
        <Button 
          onClick={onTestWebhook}
          disabled={isLoading || !webhookUrl}
          variant="secondary"
        >
          Testar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Esta URL receberá as notificações via POST quando eventos ocorrerem.
      </p>
    </div>
  );
};

export default WebhookUrlInput;
