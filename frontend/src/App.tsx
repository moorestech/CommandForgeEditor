import { useEffect } from 'react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { MainLayout } from './components/layout/MainLayout';
import { CommandList } from './components/skit/CommandList';
import { CommandEditor } from './components/skit/CommandEditor';
import { Toolbar } from './components/skit/Toolbar';
import { ValidationLog } from './components/skit/ValidationLog';
import { useSkitStore } from './store/skitStore';
import {
  loadCommandsYaml as loadCommandsYamlFile,
  loadSkits as loadSkitsFiles
} from './utils/fileSystem';
import {
  loadSampleCommandsYaml,
  loadSampleSkit
} from './utils/devFileSystem';
import { Toaster } from 'sonner';
import { DndProvider } from './components/dnd/DndProvider';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./components/ui/resizable"
import './App.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

function App() {
  const { loadCommandsYaml, loadSkits, projectPath } = useSkitStore();
  useKeyboardShortcuts();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const commandsYamlContent = await loadCommandsYamlFile(projectPath);
        loadCommandsYaml(commandsYamlContent);

        const skits = await loadSkitsFiles(projectPath);
        loadSkits(skits);
      } catch (error) {
        if (import.meta.env.DEV) {
          // 外部ファイルからサンプルデータをロード
          try {
            const sampleSkits = await loadSampleSkit();
            loadSkits(sampleSkits);
          } catch (e) {
            console.error('Failed to load sample skit:', e);
          }
          
          try {
            const commandsYaml = await loadSampleCommandsYaml();
            loadCommandsYaml(commandsYaml);
          } catch (e) {
            console.error('Failed to load sample commands.yaml:', e);
          }
        }else{
          console.error('Failed to load initial data:', error);
        }
      }
    };

    loadInitialData();
  }, [loadCommandsYaml, loadSkits, projectPath]);

  return (
    <I18nextProvider i18n={i18n}>
      <DndProvider>
        <MainLayout>
          <div className="w-full flex flex-col overflow-hidden h-full">
            <Toolbar />
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 flex overflow-hidden"
            >
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="overflow-y-auto h-full">
                  <CommandList />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="flex-1 flex flex-col overflow-hidden h-full">
                  <div className="flex-1 overflow-y-auto p-4">
                    <CommandEditor />
                  </div>
                  <div>
                    <ValidationLog />
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <Toaster position="bottom-right" />
        </MainLayout>
      </DndProvider>
    </I18nextProvider>
  );
}

export default App;
