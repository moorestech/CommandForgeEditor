import { useEffect } from 'react';
import { useSkitStore } from '../../store/skitStore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export function ValidationLog() {
  const { validationErrors } = useSkitStore();
  const { toast } = useToast();
  
  useEffect(() => {
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast({
          title: "エラー",
          description: error,
          variant: "destructive"
        });
      });
    }
  }, [validationErrors, toast]);

  if (validationErrors.length === 0) {
    return null;
  }

  return (
    <div className="p-4 space-y-2">
      {validationErrors.map((error, index) => (
        <Alert key={index} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>エラー</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
