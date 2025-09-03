import React from 'react';

interface ProjectPreviewErrorProps {
  message: string;
  errorReason?: string;
}

export const ProjectPreviewError: React.FC<ProjectPreviewErrorProps> = ({
  message,
  errorReason
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center space-y-2">
      <p className="text-muted-foreground text-sm font-medium">
        {message}
      </p>
      {errorReason && (
        <p className="text-muted-foreground/80 text-xs">
          {errorReason}
        </p>
      )}
    </div>
  );
};