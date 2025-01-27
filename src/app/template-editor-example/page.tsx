"use client";
import Editor from '@/components/TemplateEditor';
import React, { useState ,ChangeEvent, useContext} from 'react';
import { Template } from '@pdfme/common';
import Papa from 'papaparse';
import {db} from '../../../firebase'
import { doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../../lib/AuthContext';

export default function TemplateEditorExample() {
  const { user } = useContext(AuthContext); 
  const [pdf, setPdf] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      setPdf(e.target.files[0]);
    }
  };
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [name,setName] = useState('')
    const [message,setMessage] = useState('')
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]; 
      if (file) {
          setCsvFile(file);
      }
  };
  const handleUpload = async () => {
    if (!csvFile) return;

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log('CSV data:', results.data);
        for (const row of results.data) {
          console.log('row:', row.Id)
          try {
            await setDoc(doc(db, `${name}`, `${row.Id}`), row);
          } catch (error) {
            console.error("Error adding document: ", error);
          }
        }

        console.log('CSV data uploaded to Firestore!');
        setMessage('CSV data uploaded successfully!')
      },
    });
  }

  const onSubmit = async (template: Template) => {
    console.log(template.schemas);
    setTemplate(template);
    const obTemp = Object.assign({}, template.schemas);
    console.log(obTemp);
    try{
      await setDoc(doc(db, `${name}_template`,`${name}`),obTemp);
    } catch(err){
      console.log(err)
    }
    console.log('Templates updated');
    setMessage('Schema updated successfully')
  };

  return (
    <>
    {user ? (
    <div className="flex flex-col items-center  justify-center background-color-gray-100 margin-top-100 w-3/4 my-12 mx-auto">
    <h2 className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-8 font-dm-serif-display">
          Admin Panel
        </h2>
      <input required className="w-1/3 my-6 border shadow-sm font-medium text-neutral-600 dark:bg-black placeholder:bg-black dark:placeholder:text-neutral-600 border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md px-4 py-3 text-sm" type="text" placeholder='Enter Name' onChange={(e) => setName(e.target.value)} />
     <input className="block w-1/3 border shadow-sm  font-medium bg-neutral-black dark:bg-black dark:placeholder:text-neutral-600 px-4 py-3 text-sm text-neutral-600 placeholder-slate-950 dark:border-neutral-800 rounded-md file:bg-transparent file:text-neutral-600 border-neutral-300 file:border-0  cursor-pointer" type="file" accept=".csv" onChange={handleFileChange} />
     <button className="flex items-center justify-center max-w-xs gap-2 px-4 mt-4 py-2 w-full rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white" onClick={handleUpload}>Upload</button>
      {!pdf ? (
        <label
          htmlFor="pdf"
          className="flex items-center justify-center max-w-xs gap-2 px-4 mt-4 py-2 w-full rounded-md shadow-sm cursor-pointer bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
        >
          <input
            id="pdf"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onFileChange(e)}
          />
          <span className="text-sm">Choose Base PDF</span>
        </label>
      ) : template ? (
        <div>
          <a
            href={`data:application/json;base64,${btoa(JSON.stringify(template))}`}
            download="template.json"
            className="block m-4 w-fit p-4 border bg-indigo-700 text-white border-neutral-800 rounded-md"
          >
            Download Template
          </a>
        </div>
      ) : (
        <Editor
          basePdf={pdf}
          onSubmit={onSubmit}
          fields={[{ name: 'name' }, { name: 'age', y: 18 }, { name: 'rank', y: 36 }]}
        />
      )}
      <h5 className=" text-center font-semibold text-red-400 dark:text-white mb-8 font-dm-serif-display">
          {message}
        </h5>
      </div>
    ) : (
      <a href='/admin-login' className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-8 font-dm-serif-display">
          Please Login
        </a>
    ) }
    </>
  );
}