import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode | string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
      <div className="text-5xl mb-2 animate-bounce-subtle">
        {typeof icon === "string" ? icon : icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <Button 
          onClick={action.onClick}
          className="mt-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
