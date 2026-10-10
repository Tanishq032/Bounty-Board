import TaskDetailClientPage from './ClientPage';
import { Suspense } from 'react';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading Task Details...</div>}>
      <TaskDetailContent params={params} />
    </Suspense>
  );
}

async function TaskDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TaskDetailClientPage id={resolvedParams.id} />;
}
