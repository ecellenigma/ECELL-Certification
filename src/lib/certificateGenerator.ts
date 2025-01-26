import { createRequire } from 'node:module';
import { generate } from '@pdfme/generator';
//import { collection, getDocs } from "firebase/firestore"; 
//import {db} from '../../firebase'

export interface Participant {
  id: string;
  name: string;
  rank: number;
}

export interface Program {
  slug: string;
  logo: string;
  name: string;
}

export async function generateCertificate(id: string, programSlug: string) {
  const programs: Program[] = createRequire(import.meta.url)('../assets/data/programs.json');

  const program = programs.find((p: Program) => p.slug === programSlug);
  if (!program) {
    throw new Error('Program not found');
  }

  const { slug } = program;

  //const querySnapshot = await getDocs(collection(db, `${slug}`, `${id}`));
  //const participants: Participant[] = querySnapshot.docs.map(doc => doc.data() as Participant);
  const participants = createRequire(import.meta.url)(`../assets/data/${slug}.json`).data;

  const participant: Participant = participants.find((p: Participant) => p.id === id);
  console.log(id, participant, programSlug, program, slug, participants);
  if (!participant) {
    throw new Error('Participant not found');
  }

  const template = createRequire(import.meta.url)(`../assets/templates/${slug}.json`);

  return await generate({ template, inputs: [{ name: participant.name }] });
}