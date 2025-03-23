import { Template, Font, getDefaultFont, Schema } from '@pdfme/common';
import { text } from '@pdfme/schemas';
import { CollectionReference, DocumentData, Firestore, query as firestoreQuery, orderBy, limit, Query, getDocs, writeBatch } from 'firebase/firestore';

export const getFontsData = (): Font => {
  return {
    ...getDefaultFont(),
    Roboto: {
      data: "https://fonts.gstatic.com/s/roboto/v47/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
      fallback: true
    },
    "Open Sans": {
      data: "https://fonts.gstatic.com/s/opensans/v40/mem8YaGs126MiZpBA-U1UpcaXcl0Aw.ttf"
    },
    "Noto Sans JP": {
      data: "https://fonts.gstatic.com/s/notosansjp/v53/-F62fjtqLzI2JPCgQBnw7HFoxgIO2lZ9hg.ttf"
    },
    Montserrat: {
      data: "https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm45xW5rygbi49c.ttf"
    },
    Poppins: {
      data: "https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrFJDUc1NECPY.ttf"
    },
    Inter: {
      data: "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTfvlaQc78lA2.ttf"
    },
    Lato: {
      data: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk6XweuBCY.ttf"
    },
    Oswald: {
      data: "https://fonts.gstatic.com/s/oswald/v53/TK3iWkUHHAIjg75GHjUHte5fKg.ttf"
    },
    "Noto Sans": {
      data: "https://fonts.gstatic.com/s/notosans/v38/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf"
    },
    Raleway: {
      data: "https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPN-CoCTqluHfE.ttf"
    },
    Nunito: {
      data: "https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKof4MuyAbsrVcA.ttf"
    },
    Rubik: {
      data: "https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV4nGp32S0H3f.ttf"
    },
    "Playfair Display": {
      data: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXPTvSgWE_-xU.ttf"
    },
    "Noto Sans KR": {
      data: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm21nTs4JMMuA.ttf"
    },
    Merriweather: {
      data: "https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5OeyxNV-bnrw.ttf"
    },
  }
};

export const readFile = (file: File | null, type: 'text' | 'dataURL' | 'arrayBuffer') => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

export const getPlugins = () => {
  return {
    Text: text
  };
};

export const defaultField = (name: string, x: number = 0, y: number = 0) => {
  return {
    name,
    type: "text",
    content: name,
    position: { x, y },
    width: 76.22,
    height: 17.41,
    rotate: 0,
    alignment: "center",
    verticalAlignment: "middle",
    fontSize: 32,
    lineHeight: 1,
    characterSpacing: 0,
    fontColor: "#000000",
    backgroundColor: "",
    opacity: 1,
    strikethrough: false,
    underline: false,
    required: false,
    readOnly: false
  };
};

export const getDefaultTemplate = () =>
({
  schemas: [
    [
      {
        name: "name",
        type: "text",
        content: "John Doe",
        position: { x: 110.4, y: 96.34 },
        width: 76.22,
        height: 17.41,
        rotate: 0,
        alignment: "center",
        verticalAlignment: "middle",
        fontSize: 40,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: "#000000",
        backgroundColor: "",
        opacity: 1,
        strikethrough: false,
        underline: false,
        required: false,
        readOnly: false
      }
    ]
  ],
  basePdf: {
    width: 210,
    height: 297,
    padding: [20, 10, 20, 10]
  },
  pdfmeVersion: "52.16"
} as Template)

export const convertFirestoreArray = (data: DocumentData) => {
  const result = [];
  for (const key in data) {
    result.push(data[key]);
  }
  return result;
};

export async function toDataUrl(buffer: Buffer, type: string) {
  return "data:" + type + ";base64," + buffer.toString("base64");
}

export async function constructTemplate(basePdf: Buffer, schemas: Schema[]) {
  return {
    basePdf: await toDataUrl(basePdf, "application/pdf"),
    schemas: [schemas],
    pdfmeVersion: "5.2.16",
  };
}

// function to get the program name into the correct format
// only a-z and 0-9 are allowed, rest all are converted to _ and repeated _ are reduced to single _
// and it can't be program_list nor end with _schemas
export function sanitizerogramName(name: string) {
  const res = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/_schemas$/, 'schemas');
  if (res === 'programs_list') {
    throw new Error('Invalid program name');
  }
  return res;
}

// function to convert program names for display
// all _ are converted to space and first letter of each word is capitalized
export function formatProgramName(name: string) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function generateId() {
  // use time, random number and random string to generate a unique id to generate a unique id of lentgh 10
  return Date.now().toString(36).toUpperCase();
}

// client side upload via post request
export async function clientUploadBasePdf(file: File, programId: string) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`/admin/templates/${programId}`, {
    method: 'POST',
    body: formData
  });
  return res;
}

export async function deleteCollection(db: Firestore, collectionRef: CollectionReference<DocumentData, DocumentData>, batchSize: number = 50) {
  const query = firestoreQuery(collectionRef, orderBy('__name__'), limit(batchSize));

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db: Firestore, query: Query, resolve: (value?: unknown) => void) {
  const snapshot = await getDocs(query);

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc: DocumentData) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}