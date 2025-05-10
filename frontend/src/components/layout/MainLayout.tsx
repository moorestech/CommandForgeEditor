import { ReactNode } from 'react';
import { Sidebar } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { SkitList } from '../skit/SkitList';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar className="w-64 h-full border-r">
        <div className="p-4">
          <h2 className="text-lg font-semibold">スキット一覧</h2>
          <Separator className="my-2" />
          <SkitList />
        </div>
      </Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
