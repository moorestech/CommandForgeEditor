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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./components/ui/resizable"
import './App.css';

function App() {
  const { loadCommandsYaml, loadSkits, projectPath } = useSkitStore();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const commandsYamlContent = await loadCommandsYamlFile(projectPath);
        loadCommandsYaml(commandsYamlContent);

        const skits = await loadSkitsFiles(projectPath);
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

  - id: group_start
    label: グループ開始
    description: グループの開始位置
    format: "GROUP_START: {groupName}"
    properties:
      groupName:
        type: string
        default: "新しいグループ"
        required: true
      isCollapsed:
        type: boolean
        default: false

  - id: group_end
    label: グループ終了
    description: グループの終了位置
    format: "GROUP_END"
    properties: {}
`;
            loadCommandsYaml(commandsYaml);
          } catch (e) {
            console.error('Failed to load sample commands.yaml:', e);
          }
        }
      }
    };

    loadInitialData();
  }, [loadCommandsYaml, loadSkits, projectPath]);

  return (
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
        <Toaster position="top-right" />
      </MainLayout>
    </DndProvider>
  );
}

export default App;
