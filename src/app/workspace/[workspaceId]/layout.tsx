'use client';

import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';

import Thread from '@/features/messages/components/thread';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { WorkspaceSidebar } from './workspace-sidebar';
import { usePanel } from '@/hooks/use-panel';
import { Loader } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {
  const { parentMessageId, onCloseMessage } = usePanel();
  // depending on parentMessageId we can show/hide the message panel
  // exp: http://localhost:3000/workspace/ks76zyj72k98rgbk53h5d67q6171ah5y/channel/k172yc1xaw9htnwe52sgzbrp5h71ebjz?parentMessageId=123 -> will show the message panel
  const showPanel = !!parentMessageId;

  return (
    <div className='h-full'>
      <Toolbar />
      <div className='flex h-[calc(100vh-40px)]'>
        <Sidebar />
        <ResizablePanelGroup
          direction='horizontal'
          autoSaveId='id-workspace-layout'
        >
          <ResizablePanel
            defaultSize={20}
            minSize={11}
            className='bg-[#5E2C5F]'
          >
            <WorkspaceSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={20} defaultSize={80}>
            {children}
          </ResizablePanel>
          {showPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={20} defaultSize={20}>
                {parentMessageId ? (
                  <Thread
                    messageId={parentMessageId as Id<'messages'>}
                    onCloseMessage={onCloseMessage}
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    <Loader className='size-5 animate-spin text-muted-foreground' />
                  </div>
                )}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default WorkspaceIdLayout;
