import { redirect } from 'next/navigation';

export default async function MockTestExamPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  redirect(`/student/assessments/${testId}`);
}