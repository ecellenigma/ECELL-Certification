"use client";
import Notice from "@/components/Notice";
import { getPrograms } from "@/lib/firebase/firestore";
import { formatProgramName } from "@/lib/helpers";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  LoaderCircleIcon,
} from "lucide-react";
import { FormEvent, useEffect, useState, Suspense, useRef } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useSearchParams } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Home() {
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [programs, setPrograms] = useState<string[]>([]);
  const userDetails = useRef<{ email: string; program: string } | null>(null);
  const userInputRef = useRef<HTMLInputElement>(null);
  const programSelectRef = useRef<HTMLSelectElement>(null);

  const fetchCertificate = async (program: string, email: string) => {
    const query = new URLSearchParams();
    query.set("email", email);
    const res = await fetch(`/certificates/${program}/certificate.pdf?${query.toString()}`);
    setLoading(false);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdf(url);
    } else {
      const json = await res.json();
      setError(json.message);
      console.error("Error fetching certificate");
    }
  };
  const PopulateSearchParams = () => {
    const searchParams = useSearchParams();
    useEffect(() => {
      if (!searchParams) return;
      const email = searchParams.get("email");
      const program = searchParams.get("program");
      if (program && email) {
        userDetails.current = { email, program };
        if (userInputRef.current && programSelectRef.current) {
          userInputRef.current.value = email;
          programSelectRef.current.value = program;
        }
        fetchCertificate(program as string, email as string);
      }
    }, [searchParams]);
    return null;
  };

  useEffect(() => {
    async function fetchPrograms() {
      setPrograms(await getPrograms());
    }
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPdf(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email")?.toString().toLowerCase();
    const program = formData.get("program")?.toString();
    userDetails.current = {
      email: email as string,
      program: program as string,
    };

    fetchCertificate(program as string, email as string);
  };

  return (
    <Suspense>
      <PopulateSearchParams />
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center py-8">
        <h2 className="text-4xl text-center font-semibold text-text-heading dark:text-text-heading-dark mb-8 font-dm-serif-display">
          Claim Your Certificate
        </h2>
        <form
          className="space-y-4 p-6 md:p-8 max-w-sm w-full"
          onSubmit={handleSubmit}
        >
          {error && <Notice type="error" message={error} />}
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="font-semibold text-sm text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Email:
            </label>
            <input
              type="email"
              // pattern="[a-zA-Z0-9]+"
              id="email"
              name="email"
              placeholder="name@example.com"
              minLength={8}
              required
              ref={userInputRef}
              onKeyDown={() => {
                setError(null);
              }}
              className="w-full border shadow-sm font-medium text-text dark:text-text-dark placeholder:text-text-placeholder dark:placeholder:text-text-placeholder-dark border-border dark:border-border-dark bg-transparent rounded-md px-4 py-3 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="program"
              className="font-semibold text-sm text-text-secondary dark:text-text-secondary-dark mb-1"
            >
              Program:
            </label>
            <div className="relative">
              <select
                required
                name="program"
                id="program"
                ref={programSelectRef}
                onChange={() => {
                  setError(null);
                }}
                className="w-full appearance-none border shadow-sm font-medium bg-transparent text-text dark:text-text-dark border-border dark:border-border-dark rounded-md px-4 py-3 text-sm"
              >
                {programs.map((program) => (
                  <option
                    key={program}
                    value={program}
                    className="bg-background text-text dark:bg-background-dark dark:text-text-dark"
                  >
                    {formatProgramName(program)}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-5 stroke-text-secondary dark:stroke-text-secondary-dark absolute top-3.5 right-3.5" />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-md shadow-sm bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:shadow-md transition duration-150 ease active:scale-[99%]"
          >
            {loading ? (
              <LoaderCircleIcon className="size-5 my-0.5 animate-spin" />
            ) : (
              <>
                <span>Submit</span>
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>
        {pdf && (
          <div className="mt-2 p-6 md:p-8 w-full lg:max-w-xl flex flex-col items-center">
            <Document
              file={pdf}
              className="w-full border-none rounded-lg shadow-sm overflow-hidden"
            >
              <Page
                pageNumber={1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="w-full h-auto"
              />
            </Document>
            <a
              href={pdf}
              download={`${userDetails.current?.program}_${
                userDetails.current?.email || "certificate"
              }.pdf`}
              className="flex items-center justify-center max-w-xs gap-2 px-4 mt-4 py-2 w-full rounded-md shadow-sm bg-primary dark:bg-primary-dark text-on-primary dark:text-on-primary-dark hover:shadow-md transition duration-150 ease active:scale-[99%]"
            >
              <span>Download</span>
              <ArrowDown className="size-5" />
            </a>
          </div>
        )}
      </div>
    </Suspense>
  );
}
