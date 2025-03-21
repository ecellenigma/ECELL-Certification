import { type NextRequest } from 'next/server'
import { generateCertificate } from '@/lib/certificateGenerator';
import { getIdFromEmail, getParticipant, getPrograms } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, program: string }> }) {
  let { program } = await params;
  let { id } = await params;
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email');

  console.log("Generating certificate for", id, program, email);

  program = program.toLowerCase()

  if (id == "certificate.pdf" && email) {
    const emailValidity = await validateEmail(email);
    if (!emailValidity.success) {
      return new Response(emailValidity.body, { status: emailValidity.status });
    }
    const res = await getIdFromEmail(email, program);
    if (!res) {
      return new Response('Participant not found', { status: 404 });
    }
    console.log("Found participant", res, program, email, id);
    id = res;
  }
  
  // if (id.endsWith('.pdf')) id = id.slice(0, -4);
  id = id.replace('.pdf', '');

  const validity = await validateDetails(id, program);
  if (!validity.success) {
    return new Response(validity.body, { status: validity.status });
  }

  const pdf = await generateCertificate(id, program);
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
    }
  });
}

async function validateEmail(email: string) {
  if (!email) return {
    success: false,
    status: 400,
    body: 'Invalid Email',
  };
  if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return {
    success: false,
    status: 400,
    body: 'Invalid Email',
  };
  return {
    success: true,
    status: 200,
    body: 'OK',
  };
}

async function validateDetails(id: string, programSlug: string) {
  console.log("Validating details for certificate", id, programSlug);
  if (!id || !programSlug) return {
    success: false,
    status: 400,
    body: 'Invalid ID or Program',
  };
  if (!id.match(/^[a-zA-Z0-9]+$/) || !programSlug.toLowerCase().match(/^[a-z0-9_]+$/)) return {
    success: false,
    status: 400,
    body: 'Invalid ID or Program',
  };

  const programs = await getPrograms();
  if (!programs.includes(programSlug.toLowerCase())) return {
    success: false,
    status: 404,
    body: 'Program not found',
  };

  const participant = await getParticipant(id, programSlug.toLowerCase());
  if (!participant) return {
    success: false,
    status: 404,
    body: 'Participant not found',
  }

  return {
    success: true,
    status: 200,
    body: 'OK',
  };
}