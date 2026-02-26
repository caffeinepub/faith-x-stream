import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Info, Construction, Sparkles, AlertCircle } from 'lucide-react';

interface ContextualModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'info' | 'coming-soon' | 'under-construction' | 'feature-preview';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ContextualModal({
  open,
  onOpenChange,
  type,
  title,
  description,
  actionLabel,
  onAction,
}: ContextualModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-12 w-12 text-primary" />;
      case 'coming-soon':
        return <Sparkles className="h-12 w-12 text-primary" />;
      case 'under-construction':
        return <Construction className="h-12 w-12 text-primary" />;
      case 'feature-preview':
        return <AlertCircle className="h-12 w-12 text-primary" />;
      default:
        return <Info className="h-12 w-12 text-primary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gradient-card border-2 border-primary/40">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="text-center text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2 whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          {actionLabel && onAction && (
            <Button
              onClick={() => {
                onAction();
                onOpenChange(false);
              }}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {actionLabel}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="transition-all duration-300 border-2 border-primary/40 hover:bg-primary/20 hover:border-primary font-medium"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

