
import { generate } from '@pdfme/generator';
import { getParticipantWithSchema, getSchemas } from './firebase/firestore';
import { getBasePdf, getBasePdfVersion, connect } from '@/lib/mongo/client';
import fs from 'fs';
import path from "path";
import { constructTemplate } from './helpers';

export async function generateCertificate(id: string, programSlug: string) {

  programSlug = programSlug.toLowerCase();
  // TODO: [SECURITY] use a user for firestore operation as no public access will be allowed in production
  const res = await getParticipantWithSchema(id, programSlug);
  if (!res) {
    throw new Error('Participant not found');
  }

  let basePdf;
  console.log(programSlug, fs.existsSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}.pdf`)))
  const latestVersion = await getBasePdfVersion(programSlug);
  try {
    // format is programSlug-version.pdf
    if (fs.existsSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}-${latestVersion}.pdf`))) {
      basePdf = new Blob([fs.readFileSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}-${latestVersion}.pdf`))], { type: 'application/pdf' });
      // delete old versions
      fs.readdirSync(path.join(process.cwd(), `.cache/basePdf`)).forEach(file => {
        if (file.startsWith(`${programSlug}-`) && file !== `${programSlug}-${latestVersion}.pdf`) {
          fs.unlinkSync(path.join(process.cwd(), `.cache/basePdf/${file}`));
        }
      });
    }
    // else fetch new
    else {
      basePdf = await getBasePdf(programSlug);
      console.log("Base PDF:", basePdf);
      fs.writeFileSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}-${latestVersion}.pdf`), basePdf);
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