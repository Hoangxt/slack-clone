'use client';
import { Loader } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import { Id } from '../../../../convex/_generated/dataModel';

import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';
import { WorkspaceSidebar } from './workspace-sidebar';

import Thread from '@/features/messages/components/thread';
import { Profile } from '@/features/members/components/profile';

import { usePanel } from '@/hooks/use-panel';

interface WorkspaceIdLayoutProps {
  children: React.ReactNode;
}

const WorkspaceIdLayout = ({ children }: WorkspaceIdLayoutProps) => {
  const { parentMessageId, profileMemberId, onCloseMessage, onCloseProfile } =
    usePanel();
  // depending on parentMessageId we can show/hide the message panel
  // exp: http://localhost:3000/workspace/ks76zyj72k98rgbk53h5d67q6171ah5y/channel/k172yc1xaw9htnwe52sgzbrp5h71ebjz?parentMessageId=123 -> will show the message panel
  const showPanel = !!parentMessageId || !!profileMemberId;

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
                ) : profileMemberId ? (
                  <Profile
                    memberId={profileMemberId as Id<'members'>}
                    onCloseProfile={onCloseProfile}
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
