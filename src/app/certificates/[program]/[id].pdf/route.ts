export const dynamic = 'force-static'
import { type NextRequest } from 'next/server'
import { generateCertificate } from '@/lib/certificateGenerator';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, program: string }> }) {
  const { program } = await params;
  let { id } = await params;
  if (id.endsWith('.pdf')) id = id.slice(0, -4);
  try {
    const pdf = await generateCertificate(id, program);
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
      }
    });
  }
  catch (error) {
    return new Response((error as Error).message, { status: 404 });
  }
}