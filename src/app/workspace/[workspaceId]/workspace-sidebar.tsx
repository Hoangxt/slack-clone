import {
  AlertTriangle,
  HashIcon,
  Loader,
  MessageSquareText,
  SendHorizontal,
} from 'lucide-react';

// Api
// import { useGetMembers } from "@/features/members/api/use-get-members";
// import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
// import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";

// Hooks
// import { useMemberId } from "@/hooks/use-member-id";
// import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { WorkspaceHeader } from './workspace-header';
// import { DevelopmentMode } from "@/components/development-mode";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });

  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  if (workspaceLoading || memberLoading) {
    return (
      <div className='flex flex-col bg-[#5E2C5F] h-full items-center justify-center'>
        <Loader className='size-5 animate-spin text-white' />
      </div>
    );
  }

  if (!workspace || !member) {
    return (
      <div className='flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center'>
        <AlertTriangle className='size-5 text-white' />
        <p className='text-white text-sm'>Workspace not found</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col bg-[#5E2C5F] h-full'>
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === 'admin'}
      />
    </div>
  );
};
