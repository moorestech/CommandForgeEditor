import { ReactNode } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter
} from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { SkitList } from '../skit/SkitList';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '../ui/button';
import { FolderOpen } from 'lucide-react';
import { useSkitStore } from '@/store/skitStore';
import { useTranslation } from 'react-i18next';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { t } = useTranslation();
  const { projectPath, openFolder } = useSkitStore();

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 space-y-3">
            {/* Current Directory Display */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('editor.toolbar.currentDirectory')}</p>
              <p className="text-sm font-mono truncate" title={projectPath || undefined}>
                {projectPath || t('editor.toolbar.noFolderOpen')}
              </p>
            </div>
            
            {/* Folder Open Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openFolder}
              className="w-full justify-start"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              {t('editor.toolbar.folder')}
            </Button>
            
            <Separator className="mt-3" />
            
            <h2 className="text-lg font-semibold">{t('skitList.title')}</h2>
          </SidebarHeader>
          <SidebarContent>
            <SkitList />
          </SidebarContent>
          <SidebarFooter className="p-4 pt-2">
            <Separator className="mb-3" />
            {/* Language Switcher */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t('language.label')}</p>
              <LanguageSwitcher />
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
