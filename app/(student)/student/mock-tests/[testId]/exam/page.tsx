import { MockTestExam } from '@/components/mock-test-exam';

export default async function MockTestExamPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  return <MockTestExam testId={testId} />;
}