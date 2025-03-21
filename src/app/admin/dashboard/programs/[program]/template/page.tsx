"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import {
  getSchemas,
  setParticipants,
  setSchemas,
} from "@/lib/firebase/firestore";
import { useParams } from "next/navigation";
import Papa from "papaparse";
import { Participant } from "@/types";
import TemplateEditor from "@/components/TemplateEditor";
import { Template } from "@pdfme/common";
import {
  ArrowRight,
  UploadCloud,
  LoaderCircleIcon,
  LogOutIcon,
} from "lucide-react";
import Notice from "@/components/Notice";
import { useAuth } from "@/providers/AuthContext";
import { signOut } from "@/lib/firebase/auth";
import { clientUploadBasePdf, readFile } from "@/lib/helpers";

export default function TemplatePage() {
  const { program } = useParams();
  const { user, authLoading } = useAuth();

  const [basePdf, setBasePdf] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [basePdfUrl, setBasePdfUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [template, setTemplate] = useState<Template>({
    schemas: [[]],
    basePdf: "",
  });

  useEffect(() => {
    async function fetchCurrentTemplate() {
      if (program) {
        const res = await fetch("/admin/templates/" + program);
        if (res.ok) {
          const data = await res.blob();
          const schemas = await getSchemas(program as string);
          // console.log("Schemas:", schemas);
          if (schemas) {
            setTemplate({
              schemas: [schemas],
              basePdf: await readFile(
                new File([data], "base.pdf", { type: "application/pdf" }),
                "dataURL"
              ),
            });
          }
        }
      }
    }
    fetchCurrentTemplate();
  }, [program]);

  const handleBasePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBasePdf(e.target.files[0]);
      (async () => {
        if (e.target.files) {
          const basePdfData = await readFile(e.target.files[0], "dataURL");
          setTemplate((prevTemplate) => ({
            ...prevTemplate,
            basePdf: basePdfData,
          }));
        }
      })();
    }
  };

  const onCsvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const handleBasePdfUpload = async () => {
    if (basePdf) {
      try {
        const res = await (
          await clientUploadBasePdf(basePdf, program as string)
        ).json();
        if (res.success) setBasePdfUrl(res.url);
        const basePdfData = await basePdf.arrayBuffer();
        setTemplate((prevTemplate) => ({
          ...prevTemplate,
          basePdf: basePdfData,
        }));
        setMessage("Base PDF uploaded successfully!");
      } catch (error: unknown) {
        setMessage(
          `Error uploading Base PDF: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  };

  const handleUpload = async () => {
    if (!csvFile) return;
    setIsUploadingCsv(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: async (results) => {
        // console.log("CSV data:", results.data);
        const success = await setParticipants(
          program as string,
          results.data as Participant[]
        );
        setIsUploadingCsv(false);
        if (!success) {
          console.log("Error uploading participants");
          return;
        }
        console.log("CSV data uploaded to Firestore!");
        setMessage("CSV data uploaded successfully!");
      },
    });
  };

  const handleTemplateSave = async (newTemplate: Template) => {
    try {
      await setSchemas(program as string, newTemplate.schemas.flat());
      setTemplate(newTemplate);
      setMessage("Template saved successfully!");
    } catch (error: unknown) {
      setMessage(
        `Error saving template: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <>
      {user && !authLoading ? (
        <>
          <div className="w-full flex justify-end px-4">
            <button
              className="flex items-center text-sm justify-center gap-2 px-4 mt-4 py-2 w-fit rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
              onClick={() => signOut()}
            >
              <LogOutIcon className="size-4" />
              Logout
            </button>
          </div>
          <div className="text-white p-6 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit Program</h1>
            {message && <Notice type="success" message={message} />}
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl">
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="basePdf">
                  Upload Base PDF
                </label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white file:bg-indigo-700 file:text-white file:font-bold file:px-4 file:py-2 file:rounded file:cursor-pointer file:border-0"
                  type="file"
                  id="basePdf"
                  accept="application/pdf"
                  onChange={handleBasePdfChange}
                />
                <div className="flex justify-center mt-2">
                  <button
                    className="bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded flex items-center w-full justify-center"
                    onClick={handleBasePdfUpload}
                  >
                    Upload Base PDF <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="csvFile">
                  Upload CSV
                </label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white file:bg-indigo-700 file:text-white file:font-bold file:px-4 file:py-2 file:rounded file:cursor-pointer file:border-0"
                  type="file"
                  id="csvFile"
                  accept=".csv"
                  onChange={onCsvFileChange}
                />
                <div className="flex justify-center mt-2">
                  <button
                    className="bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded flex items-center w-full justify-center"
                    onClick={handleUpload}
                    disabled={isUploadingCsv}
                  >
                    {isUploadingCsv ? (
                      <LoaderCircleIcon className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <UploadCloud className="h-5 w-5" />
                        <span className="ml-2">Upload CSV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              {basePdfUrl && (
                <div className="mt-4 flex justify-center">
                  <a
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center w-full justify-center"
                    href={basePdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Base PDF <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              )}
              <div className="mt-6 w-full">
                {template.basePdf !== "" ? (
                  <TemplateEditor
                    template={template}
                    onSubmit={handleTemplateSave}
                  />
                ) : (
                  <div className="grid place-items-center p-8 gap-2 min-h-[100dvh]">
                    <LoaderCircleIcon className="size-14 stroke-indigo-600 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid place-items-center p-8 gap-2 min-h-[100dvh]">
          <LoaderCircleIcon className="size-16 stroke-indigo-700 animate-spin" />
        </div>
      )}
    </>
  );
}
