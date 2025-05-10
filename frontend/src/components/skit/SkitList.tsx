import { useEffect, useState } from 'react';
import { useSkitStore } from '../../store/skitStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { PlusCircle } from 'lucide-react';
import { createNewSkit } from '../../utils/fileSystem';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function SkitList() {
  const { skits, currentSkitId, setCurrentSkit, projectPath, loadSkits } = useSkitStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSkitTitle, setNewSkitTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!currentSkitId && Object.keys(skits).length > 0) {
      setCurrentSkit(Object.keys(skits)[0]);
    }
  }, [skits, currentSkitId, setCurrentSkit]);

  const handleCreateNewSkit = async () => {
    if (!newSkitTitle.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }

    setIsCreating(true);
    try {
      const { id, errors } = await createNewSkit(newSkitTitle, projectPath);
      
      if (errors.length > 0) {
        toast.error(`スキット作成エラー: ${errors.join(', ')}`);
        return;
      }
      
      if (projectPath) {
        const updatedSkits = await import('../../utils/fileSystem').then(
          module => module.loadSkits(projectPath)
        );
        loadSkits(updatedSkits);
      }
      
      setCurrentSkit(id);
      toast.success('新しいスキットを作成しました');
      setIsDialogOpen(false);
      setNewSkitTitle('');
    } catch (error) {
      console.error('Failed to create new skit:', error);
      toast.error(`スキット作成に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const openNewSkitDialog = () => {
    if (!projectPath) {
      toast.error('プロジェクトフォルダを選択してください');
      return;
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2">
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={openNewSkitDialog}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規スキット作成</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="skit-title">タイトル</Label>
            <Input
              id="skit-title"
              value={newSkitTitle}
              onChange={(e) => setNewSkitTitle(e.target.value)}
              placeholder="スキットのタイトルを入力"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleCreateNewSkit}
              disabled={!newSkitTitle.trim() || isCreating}
            >
              {isCreating ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
