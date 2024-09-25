import { toast } from 'sonner';
import { useState } from 'react';
import { TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaChevronDown } from 'react-icons/fa';
// ui com
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// api hook
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useChannelId } from '@/hooks/use-channel-id';
import { useConfirm } from '@/hooks/use-confirm';
import { useCurrentMember } from '@/features/members/api/use-current-member';
import { useUpdateChannel } from '@/features/channels/api/use-update-channel';
import { useRemoveChannel } from '@/features/channels/api/use-remove-channel';

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  // state
  const [value, setValue] = useState(title);
  const [editOpen, setEditOpen] = useState(false);

  const [ConfirmRemoveDialog, confirmRemove] = useConfirm(
    'Delete this channel ?',
    'You are about to delete this channel. This action is irreversible'
  );

  // xác định member role trong workspace [member or admin]
  const { data: member } = useCurrentMember({ workspaceId });

  const { mutate: updateChannel, isPending: isUpdatingChannel } =
    useUpdateChannel();

  const { mutate: removeChannel, isPending: isRemovingChannel } =
    useRemoveChannel();

  // role admin mới được Edit
  const handleEditOpen = (value: boolean) => {
    if (member?.role !== 'admin') return;

    setEditOpen(value);
  };

  // format tên channel mới được sửa
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, '-').toLowerCase();
    setValue(value);
  };

  const handleEditChannel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateChannel(
      { id: channelId, name: value },
      {
        onSuccess: () => {
          toast.success('Channel updated');
          setEditOpen(false);
        },
        onError: () => {
          toast.error('Failed to update channel');
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    removeChannel(
      { id: channelId },
      {
        onSuccess: () => {
          toast.success('Channel removed');
          router.push(`/workspace/${workspaceId}`);
        },
        onError: () => {
          toast.error('Failed to remove channel');
        },
      }
    );
  };

  return (
    <div className='bg-white border-b h-[49px] flex items-center px-4 overflow-hidden'>
      <ConfirmRemoveDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            className='text-lg font-semibold px-2 overflow-hidden w-auto'
          >
            <span className='truncate'># {title}</span>
            <FaChevronDown className='size-2.5 ml-2' />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className='p-4 border-b bg-white'>
            <DialogTitle># {title}</DialogTitle>
            <DialogDescription className='hidden'></DialogDescription>
          </DialogHeader>
          {/* Dialog hiện lên khi click edit chanel */}
          <div className='px-4 pb-4 flex flex-col gap-y-2'>
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className='px-5 py-4 cursor-pointer rounded-lg border bg-white hover:bg-gray-50'>
                  <div className='flex items-center justify-between'>
                    {/* Role la admin mới được edit */}
                    <p className='text-sm font-semibold'>Channel name</p>
                    {member?.role === 'admin' && (
                      <p className='text-sm text-[#1264A3] hover:underline font-semibold'>
                        Edit
                      </p>
                    )}
                  </div>
                  <p className='text-sm'>{value}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this channel</DialogTitle>
                  <DialogDescription className='hidden'></DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditChannel} className='space-y-4'>
                  <Input
                    value={value}
                    disabled={isUpdatingChannel}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder='e.g. plan-budget'
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant='outline' disabled={isUpdatingChannel}>
                        cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingChannel}>save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            {/* role admin mới được xóa channel*/}
            {member?.role === 'admin' && (
              <button
                onClick={handleRemove}
                disabled={isRemovingChannel}
                className='flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600'
              >
                <TrashIcon className='size-4' />
                <p className='text-sm font-semibold'>Delete channel</p>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
