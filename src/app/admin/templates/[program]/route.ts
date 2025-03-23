import { type NextRequest } from 'next/server'
import { getPrograms } from '@/lib/firebase/firestore';
import { deleteBasePdf, getBasePdf, uploadBasePdf } from '@/lib/mongo/client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ program: string }> }) {
  let { program } = await params;

  const validity = await validateDetails(program);

  program = program.toLowerCase();

  if (!validity.success) {
    return new Response(validity.body, { status: validity.status });
  }
  const pdf = await getBasePdf(program);
  if (!pdf) return new Response(JSON.stringify({
    success: false,
    message: 'File not found',
  }), { status: 404 });

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
    }
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ program: string }> }) {
  let { program } = await params;
  // get pdf file
  const formData = await request.formData();
  const body = Object.fromEntries(formData);
  const file = (body.file as Blob) || null;

  if (!file) return new Response(JSON.stringify({
    success: false,
    message: 'No file in request',
  }), { status: 400 });

  if (!file.type.match('application/pdf')) return new Response(JSON.stringify({
    success: false,
    message: 'File is not a pdf',
  }), { status: 400 });

  const validity = await validateDetails(program);

  program = program.toLowerCase();

  if (!validity.success) {
    return new Response(validity.body, { status: validity.status });
  }

  const res = await uploadBasePdf(new File([file], `${program}.pdf`, {
    type: 'application/pdf',
  }), program);
  console.log(res);
  if (!res) return new Response(JSON.stringify({
    success: false,
    message: 'Error uploading file',
  }), { status: 500 });
  return new Response(JSON.stringify({
    success: true,
    url: `/admin/templates/${program}`,
  }), {
    status: 200,
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ program: string }> }) {
  let { program } = await params;
  const validity = await validateDetails(program);
  program = program.toLowerCase();
  if (!validity.success) {
    return new Response(validity.body, { status: validity.status });
  }
  const res = await deleteBasePdf(program);
  if (!res) return new Response(JSON.stringify({
    success: false,
    message: 'Error deleting file',
  }), { status: 500 });
  console.log(res);
  // if (!res.deletedCount) return new Response(JSON.stringify({
  //   success: false,
  //   message: 'File not found',
  // }), { status: 404 });
  return new Response(JSON.stringify({
    success: true,
    message: 'File deleted successfully',
  }), {
    status: 200,
  });
}

async function validateDetails(programSlug: string) {
  if (!programSlug.toLowerCase().match(/^[a-z0-9_]+$/)) return {
    success: false,
    status: 400,
    body: JSON.stringify({
      success: false,
      message: 'Invalid ID or Program',
    }),
  };

  const programs = await getPrograms();
  if (!programs.includes(programSlug.toLowerCase())) return {
    success: false,
    status: 404,
    body: JSON.stringify({
      success: false,
      message: 'Program not found',
    }),
  };

  return {
    success: true,
    status: 200,
    body: 'OK',
  };
}