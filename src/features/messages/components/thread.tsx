import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Id } from '../../../../convex/_generated/dataModel';
import { AlertTriangle, Loader, XIcon } from 'lucide-react';

import { Message } from '@/components/message';

import { useGetMessage } from '../api/use-get-message';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useCurrentMember } from '@/features/members/api/use-current-member';

interface TheadProps {
  messageId: Id<'messages'>;
  onCloseMessage: () => void;
}

export const Thead = ({ messageId, onCloseMessage }: TheadProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });

  const [editingId, setEditingId] = useState<Id<'messages'> | null>(null);

  if (loadingMessage) {
    return (
      <div className='h-full flex flex-col'>
        <div className='h-[49px] flex justify-between items-center px-4 border-b'>
          <p className='font-bold text-lg'>Thread</p>
          <Button onClick={onCloseMessage} size='iconSm' variant='ghost'>
            <XIcon className='size-5 stroke-[1.5]' />
          </Button>
        </div>

        <div className='flex h-full flex-col gap-y-2 items-center justify-center'>
          <Loader className='size-5 animate-spin text-muted-foreground' />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className='h-full flex flex-col'>
        <div className='h-[49px] flex justify-between items-center px-4 border-b'>
          <p className='font-bold text-lg'>Thread</p>
          <Button onClick={onCloseMessage} size='iconSm' variant='ghost'>
            <XIcon className='size-5 stroke-[1.5]' />
          </Button>
        </div>

        <div className='flex h-full flex-col gap-y-2 items-center justify-center'>
          <AlertTriangle className='size-5 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='h-[49px] flex justify-between items-center px-4 border-b'>
        <p className='font-bold text-lg'>Thread</p>
        <Button onClick={onCloseMessage} size='iconSm' variant='ghost'>
          <XIcon className='size-5 stroke-[1.5]' />
        </Button>
      </div>
      <div>
        <Message
          key={message._id}
          id={message._id}
          memberId={message.memberId}
          authorImage={message.user.image}
          authorName={message.user.name}
          isAuthor={message.memberId === currentMember?._id}
          reactions={message.reactions}
          body={message.body}
          image={message.image}
          updatedAt={message.updatedAt}
          createdAt={message._creationTime}
          isEditing={editingId === message._id}
          setEditingId={setEditingId}
          //  isCompact={isCompact}
          //  hideThreadButton={variant === 'thread'}
          //  threadCount={message.threadCount}
          //  threadImage={message.threadImage}
          // threadName={message.threadName}
          //  threadTimestamp={message.threadTimestamp}
        />
      </div>
    </div>
  );
};

export default Thead;
