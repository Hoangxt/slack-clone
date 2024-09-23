'use client';

interface WorkspaceIdPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdPage = ({ params }: WorkspaceIdPageProps) => {
  return <div>Workspace ID: {params.workspaceId}</div>;
};

export default WorkspaceIdPage;
