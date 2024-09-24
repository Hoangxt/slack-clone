'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
// ui
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
// api
import { useUpdateWorkspace } from '@/features/workspaces/api/use-update-workspace';
import { useRemoveWorkspace } from '@/features/workspaces/api/use-remove-workspace';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useConfirm } from '@/hooks/use-confirm';
interface PreferencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialValue: string;
}

export const PreferencesModal = ({
  open,
  setOpen,
  initialValue,
}: PreferencesModalProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const [ConfirmRemoveDialog, confirmRemove] = useConfirm(
    'Do you really want to delete this workspace?',
    'This action is irreversible.'
  );

  const [ConfirmEditDialog, confirmEdit] = useConfirm(
    'Are you sure ?',
    'This action is irreversible.'
  );

  const [value, setValue] = useState(initialValue);

  const [editOpen, setEditOpen] = useState(false);

  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } =
    useUpdateWorkspace();

  const { mutate: removeWorkspace, isPending: isRemovingWorkspace } =
    useRemoveWorkspace();

  const handleRemove = async () => {
    const ok = await confirmRemove();

    if (!ok) return;

    removeWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success('Workspace removed');
          router.replace('/');
        },
        onError: () => {
          toast.error('Failed to remove workspace');
        },
      }
    );
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const ok = await confirmEdit();

    if (!ok) return;

    updateWorkspace(
      { id: workspaceId, name: value },
      {
        onSuccess: () => {
          toast.success('Workspace updated');
          setEditOpen(false);
        },
        onError: () => {
          toast.error('Failed to update workspace');
        },
      }
    );
  };

  return (
    <>
      <ConfirmRemoveDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='p-0 bg-gray-50 overflow-hidden'>
          <DialogHeader className='p-4 border-b bg-white'>
            <DialogTitle>{value}</DialogTitle>
            <DialogDescription className='hidden'></DialogDescription>
          </DialogHeader>

          {/* Dialog hiện lên khi click edit */}
          <ConfirmEditDialog />
          <div className='px-4 pb-4 flex flex-col gap-y-2'>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className='px-5 py-4 cursor-pointer rounded-lg border bg-white hover:bg-gray-50'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold'>Workspace name</p>
                    <p className='text-sm font-semibold text-[#1264A3] hover:underline'>
                      Edit
                    </p>
                  </div>
                  <p className='text-sm'>{value}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                  <DialogDescription className='hidden'></DialogDescription>
                </DialogHeader>
                <form className='space-y-4' onSubmit={handleEdit}>
                  <Input
                    value={value}
                    disabled={isUpdatingWorkspace}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder="Workspace name e.g. 'Work', 'Personal', 'Home'"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        type='button'
                        variant='outline'
                        disabled={isUpdatingWorkspace}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type='submit' disabled={isUpdatingWorkspace}>
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleRemove}
              disabled={isRemovingWorkspace}
              className='flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-5 py-4 text-rose-600 hover:bg-gray-50'
            >
              <TrashIcon className='size-4' />
              <p className='text-sm font-semibold'>Delete workspace</p>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
