'use client';

import { useEffect, useMemo } from 'react';
import { Loader, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
// call id from db using hook
import { useWorkspaceId } from '@/hooks/use-workspace-id';
// call api
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';

const WorkspaceIdPage = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });

  return <div>Data: {JSON.stringify(data)}</div>;
};

export default WorkspaceIdPage;
