
import { generate } from '@pdfme/generator';
import { getParticipantWithSchema, getSchemas } from './firebase/firestore';
import { getBasePdf, getBasePdfVersion } from '@/lib/mongo/client';
import fs from 'fs';
import path from "path";
import { constructTemplate } from './helpers';

const isVercel = process.env.VERCEL == '1';

export async function generateCertificate(id: string, programSlug: string) {
  programSlug = programSlug.toLowerCase();
  // TODO: [SECURITY] use a user for firestore operation as no public access will be allowed in production
  const res = await getParticipantWithSchema(id, programSlug);
  if (!res) {
    throw new Error('Participant not found');
  }

  let basePdf: Buffer | null = null, latestVersion: string | null = null;
  try {
    // format is programSlug-version.pdf
    if (!isVercel) {
      latestVersion = await getBasePdfVersion(programSlug);
      if (fs.existsSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}-${latestVersion}.pdf`))) {
        basePdf = fs.readFileSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}-${latestVersion}.pdf`));
        // delete old versions
        fs.readdirSync(path.join(process.cwd(), `.cache/basePdf`)).forEach(file => {
          if (file.startsWith(`${programSlug}-`) && file !== `${programSlug}-${latestVersion}.pdf`) {
            fs.unlinkSync(path.join(process.cwd(), `.cache/basePdf/${file}`));
          }
        });
      }
    }
    if (!basePdf) {
      basePdf = await getBasePdf(programSlug);
      if (!basePdf) {
        throw new Error('Base PDF not found');
      }
      if (!isVercel && latestVersion) fs.writeFileSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}-${latestVersion}.pdf`), basePdf);
    }
    const schemas = await getSchemas(programSlug);
    if (!schemas) {
      throw new Error('No schemas found');
    }
    const fields = schemas.map(schema => schema.name);
    const template = await constructTemplate(basePdf, schemas);
    const inputs: { [key: string]: string } = {};
    fields.forEach(field => {
      inputs[field] = res.participant[field];
    });
    return await generate({ template, inputs: [inputs] });
  }
  catch (e) {
    console.error(e);
    throw new Error('Error generating certificate');
  }
}