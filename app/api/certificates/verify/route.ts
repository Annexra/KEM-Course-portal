import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const certNo = searchParams.get('certNo');

  if (!certNo) {
    return NextResponse.json({ error: 'Certificate number required' }, { status: 400 });
  }

  // Verification mock check
  return NextResponse.json({
    valid: true,
    certificateNumber: certNo,
    studentName: 'Dr. Arjun Mehta',
    courseTitle: 'Advanced Cardiac Life Support (ACLS 2026)',
    issuedAt: '2026-09-28',
    institution: 'Kauvery Hospital Emergency Medicine Institute',
    status: 'VERIFIED_GENUINE',
  });
}
