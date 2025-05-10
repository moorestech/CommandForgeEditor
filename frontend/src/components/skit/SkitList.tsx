import { useEffect } from 'react';
import { useSkitStore } from '../../store/skitStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { PlusCircle } from 'lucide-react';

export function SkitList() {
  const { skits, currentSkitId, setCurrentSkit } = useSkitStore();

  useEffect(() => {
    if (!currentSkitId && Object.keys(skits).length > 0) {
      setCurrentSkit(Object.keys(skits)[0]);
    }
  }, [skits, currentSkitId, setCurrentSkit]);

  const handleCreateNewSkit = () => {
    console.log('Create new skit');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={handleCreateNewSkit}
        >
          <PlusCircle className="h-4 w-4" />
          新規作成
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {Object.entries(skits).map(([id, skit]) => (
            <Button
              key={id}
              variant={currentSkitId === id ? "default" : "ghost"}
              className="w-full justify-start text-left font-normal"
              onClick={() => setCurrentSkit(id)}
            >
              {skit.meta.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
