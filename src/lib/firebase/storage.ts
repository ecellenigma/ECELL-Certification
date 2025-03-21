import { storage } from "@/lib/firebase/clientApp";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const uploadBasePdf = async (file: File, programId: string) => {
  const storageRef = ref(storage, `programs/${programId}/base.pdf`);
  const snapshot = await uploadBytesResumable(storageRef, file);
  return getDownloadURL(snapshot.ref);

};
export async function getBasePdf(name: string) {
  const storageRef = ref(storage, `basePdfs/${name}`);
  const url = await getDownloadURL(storageRef);
  if(!url) throw new Error("File not found");
  const response = await fetch(url);
  const data = await response.blob();
  return data;
}

