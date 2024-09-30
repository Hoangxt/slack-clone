import { toast } from 'sonner';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@/components/editor'), { ssr: false });
import Quill from 'quill';

import { differenceInMinutes, format, isToday, isYesterday } from 'date-fns';

import { Id } from '../../../../convex/_generated/dataModel';

import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader, XIcon } from 'lucide-react';

import { Message } from '@/components/message';

import { useGetMessage } from '../api/use-get-message';
import { useCreateMessage } from '../api/use-create-message';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useChannelId } from '@/hooks/use-channel-id';

import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url';
import { useGetMessages } from '../api/use-get-messages';

interface TheadProps {
  messageId: Id<'messages'>;
  onCloseMessage: () => void;
}

type CreateReplyMessageValues = {
  channelId: Id<'channels'>;
  workspaceId: Id<'workspaces'>;
  parentMessageId: Id<'messages'>;
  body: string;
  image: Id<'_storage'> | undefined;
};

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, MMMM d');
};

const TIME_THRESHOLD = 5;

export const Thead = ({ messageId, onCloseMessage }: TheadProps) => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  // state
  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [editingId, setEditingId] = useState<Id<'messages'> | null>(null);
  // ref
  const editorRef = useRef<Quill | null>(null);
  // query
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });
  // mutation
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });
  const canLoadMore = status === 'CanLoadMore';
  const isLoadingMore = status === 'LoadingMore';

  // Submit to db
  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    console.log({ body, image });
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: CreateReplyMessageValues = {
        channelId, // undefined
        workspaceId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) {
          throw new Error('URL not found');
        }

        const result = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error('Failed to upload image');
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, { throwError: true });

      setEditorKey((prevKey) => prevKey + 1);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].unshift(message);
      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (loadingMessage || status === 'LoadingFirstPage') {
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
      <div className='flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar'>
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className='relative my-2 text-center '>
              <hr className='absolute top-1/2 left-0 right-0 border-t border-gray-300' />
              <span className='relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm'>
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              // nhóm tin nhắn lại khi người dùng nhập dưới 5 phút
              // => trong 5 phút 1 người liên tực chat thì sẽ được nhóm các đoạn tin nhắn lại
              const isCompact =
                prevMessage &&
                prevMessage.user?._id === message.user?._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(prevMessage._creationTime)
                ) < TIME_THRESHOLD;

              return (
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
                  isCompact={isCompact}
                  hideThreadButton
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  // threadName={message.threadName}
                  threadTimestamp={message.threadTimestamp}
                />
              );
            })}
          </div>
        ))}

        <div
          className='h-1'
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                { threshold: 1.0 }
              );
              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
        />

        {isLoadingMore && (
          <div className='text-center my-2 relative'>
            <hr className='absolute top-1/2 left-0 right-0 border-t border-gray-300' />
            <span className='relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm'>
              <Loader className='size-4 animate-spin' />
            </span>
          </div>
        )}

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
          hideThreadButton
        />
      </div>
      <div className='px-4'>
        <Editor
          key={editorKey}
          onSubmit={handleSubmit}
          disabled={isPending}
          innerRef={editorRef}
          placeholder='Reply...'
        />
      </div>
    </div>
  );
};

export default Thead;
