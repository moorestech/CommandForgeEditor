import { ReactNode } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent
} from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { SkitList } from '../skit/SkitList';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold">スキット一覧</h2>
            <Separator className="my-2" />
          </SidebarHeader>
          <SidebarContent>
            <SkitList />
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
