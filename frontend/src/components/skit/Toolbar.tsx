import React from 'react';
import { useSkitStore } from '../../store/skitStore';
import { Button } from '../ui/button';
import {
  Plus, Copy, Trash, Undo, Redo, Save,
  FolderOpen
} from 'lucide-react';
import { SidebarTrigger } from '../ui/sidebar';
import { toast } from 'sonner';
import { DropZone } from '../dnd/DropZone';
import { selectProjectFolder } from '../../utils/fileSystem';
import { CommandPickerMenu } from './CommandPickerMenu';

export function Toolbar() {
  const { 
    currentSkitId, 
    selectedCommandId, 
    removeCommand, 
    duplicateCommand,
    undo,
    redo,
    saveSkit,
    projectPath,
    setProjectPath,
    loadSkits,
    loadCommandsYaml
  } = useSkitStore();

  const [showCommandPicker, setShowCommandPicker] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  const handleSelectFolder = async () => {
    const selectedPath = await selectProjectFolder();
    if (selectedPath) {
      setProjectPath(selectedPath);
      
      try {
        const commandsYamlContent = await import('../../utils/fileSystem').then(
          module => module.loadCommandsYaml(selectedPath)
        );
        loadCommandsYaml(commandsYamlContent);
        
        const skits = await import('../../utils/fileSystem').then(
          module => module.loadSkits(selectedPath)
        );
        loadSkits(skits);
        
        toast.success('プロジェクトフォルダを読み込みました');
      } catch (error) {
        console.error('Failed to load project data:', error);
        toast.error('プロジェクトの読み込みに失敗しました');
      }
    }
  };

  const handleSave = async () => {
    try {
      await saveSkit();
      toast.success('スキットを保存しました');
    } catch (error) {
      toast.error(`保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const isDisabled = !currentSkitId;
  const isCommandSelected = selectedCommandId !== null;

  return (
    <div className="flex items-center p-2 border-b w-full">
      <SidebarTrigger className="mr-2" />
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          disabled={isDisabled}
          onClick={(e) => {
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setShowCommandPicker(true);
          }}
        >
          <Plus className="h-4 w-4" />
          追加
        </Button>
        
        {showCommandPicker && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onMouseDown={(e) => {
                e.stopPropagation();
                setTimeout(() => {
                  setShowCommandPicker(false);
                }, 50);
              }}
            />
            <CommandPickerMenu 
              position={menuPosition} 
              onClose={() => setShowCommandPicker(false)} 
            />
          </>
        )}

        <DropZone id="copy-zone" className="inline-flex">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!isCommandSelected}
            onClick={() => selectedCommandId && duplicateCommand(selectedCommandId)}
          >
            <Copy className="h-4 w-4 mr-1" />
            複製
          </Button>
        </DropZone>

        <DropZone id="trash-zone" className="inline-flex">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!isCommandSelected}
            onClick={() => selectedCommandId && removeCommand(selectedCommandId)}
          >
            <Trash className="h-4 w-4 mr-1" />
            削除
          </Button>
        </DropZone>
      </div>

      <div className="flex-1 flex items-center mx-2">
        {projectPath && (
          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={projectPath}>
            {projectPath}
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectFolder}
        title="プロジェクトフォルダを開く"
        className="mr-2"
      >
        <FolderOpen className="h-4 w-4 mr-1" />
        フォルダ
      </Button>

      <div className="ml-auto flex items-center">
        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={undo}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isDisabled}
          onClick={redo}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Button
          variant="default"
          size="sm"
          disabled={isDisabled}
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-1" />
          保存
        </Button>
      </div>
    </div>
  );
}
