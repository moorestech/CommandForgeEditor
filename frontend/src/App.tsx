import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { CommandList } from './components/skit/CommandList';
import { CommandEditor } from './components/skit/CommandEditor';
import { Toolbar } from './components/skit/Toolbar';
import { ValidationLog } from './components/skit/ValidationLog';
import { useSkitStore } from './store/skitStore';
import { loadCommandsYaml as loadCommandsYamlFile, loadSkits as loadSkitsFiles } from './utils/fileSystem';
import { Toaster } from 'sonner';
import { DndProvider } from './components/dnd/DndProvider';
import { SidebarProvider } from './components/ui/sidebar';
import './App.css';

function App() {
  const { loadCommandsYaml, loadSkits } = useSkitStore();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const commandsYamlContent = await loadCommandsYamlFile();
        loadCommandsYaml(commandsYamlContent);

        const skits = await loadSkitsFiles();
        loadSkits(skits);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        
        if (import.meta.env.DEV) {
          const sampleSkit = {
            meta: {
              title: 'サンプルスキット',
              version: 1,
              created: new Date().toISOString(),
              modified: new Date().toISOString()
            },
            commands: [
              {
                id: 1,
                type: 'text',
                character: 'キャラA',
                body: 'こんにちは'
              },
              {
                id: 2,
                type: 'emote',
                character: 'キャラA',
                emotion: '笑顔'
              }
            ]
          };
          
          loadSkits({ 'sample': sampleSkit });
          
          try {
            const commandsYaml = `
version: 1
commands:
  - id: text
    label: テキスト
    description: 台詞を表示
    format: "TEXT: {character}, {body}"
    properties:
      character:
        type: enum
        options: ["キャラA", "キャラB"]
        required: true
      body:
        type: string
        multiline: true
        required: true

  - id: emote
    label: エモート
    description: 立ち絵・表情切替
    format: "EMOTE: {character}, {emotion}"
    properties:
      character:
        type: enum
        options: ["キャラA", "キャラB"]
        required: true
      emotion:
        type: enum
        options: ["笑顔", "驚き", "怒り", "悲しみ"]
        required: true

  - id: wait
    label: 待機
    description: 指定秒数だけウェイト
    format: "WAIT: {seconds}"
    properties:
      seconds:
        type: number
        default: 0.5
        constraints:
          min: 0
`;
            loadCommandsYaml(commandsYaml);
          } catch (e) {
            console.error('Failed to load sample commands.yaml:', e);
          }
        }
      }
    };

    loadInitialData();
  }, [loadCommandsYaml, loadSkits]);

  return (
    <SidebarProvider>
      <DndProvider>
        <MainLayout>
          <div className="flex-1 flex flex-col overflow-hidden">
            <Toolbar />
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/3 border-r overflow-y-auto">
                <CommandList />
              </div>
              <div className="w-2/3 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                  <CommandEditor />
                </div>
                <div className="border-t">
                  <ValidationLog />
                </div>
              </div>
            </div>
          </div>
          <Toaster position="top-right" />
        </MainLayout>
      </DndProvider>
    </SidebarProvider>
  );
}

export default App;
