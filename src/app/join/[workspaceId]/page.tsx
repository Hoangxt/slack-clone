'use client';

import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import VerificationInput from 'react-verification-input';
import { useEffect, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useGetWorkspaceInfo } from '@/features/workspaces/api/use-get-workspace-info';
import { useJoin } from '@/features/workspaces/api/use-join';

const JoinPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useGetWorkspaceInfo({ id: workspaceId });

  const { mutate, isPending } = useJoin();
  // dùng useMemo hook để nhớ id của user
  const isMember = useMemo(() => data?.isMember, [data?.isMember]);
  // nếu user đã là member của workspace rồi thì quay về trang /workspace/${workspaceId} và
  // hiện thông báo
  useEffect(() => {
    if (isMember) {
      router.replace(`/workspace/${workspaceId}`);
      toast.success('You are already a member of this workspace');
    }
  }, [isMember, router, workspaceId]);

  const handleComplete = (value: string) => {
    mutate(
      { workspaceId, joinCode: value },
      {
        onSuccess: (id) => {
          router.replace(`/workspace/${id}`);
          toast.success('Workspace joined');
        },
        onError: () => {
          toast.error('failed to join workspace');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader className='size-6 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8 rounded-lg shadow-md'>
      <Image
        src='/logo.svg'
        width={100}
        height={100}
        alt='logo'
        className='object-contain'
      />
      <div className='flex flex-col gap-y-4 items-center justify-center max-w-md'>
        <div className='flex flex-col gap-y-2 items-center justify-center'>
          <h1 className='text-2xl font-bold'>Join {data?.name} </h1>
          <p className='text-md text-muted-foreground'>
            Enter the workspace code to join
          </p>
        </div>
        <VerificationInput
          onComplete={handleComplete}
          autoFocus
          length={6}
          classNames={{
            container: cn(
              'flex gap-x-2',
              isPending && 'opacity-50 cursor-not-allowed'
            ),
            character:
              'flex items-center justify-center rounded-md border border-gray-300 text-lg font-medium uppercase h-auto text-gray-500',
            characterInactive: 'bg-muted',
            characterSelected: 'bg-white text-black',
            characterFilled: 'bg-white text-black',
          }}
        />
      </div>
      <div className='flex gap-x-4'>
        <Button asChild size='lg' variant='outline'>
          <Link href='/'>Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;
