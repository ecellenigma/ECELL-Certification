"use client";
import { useState, useEffect } from "react";
import { getPrograms, deleteProgram } from "@/lib/firebase/firestore";
import Link from "next/link";
import {
  LayoutTemplate,
  LoaderCircleIcon,
  LogOutIcon,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { formatProgramName } from "@/lib/helpers";
import { signOut } from "@/lib/firebase/auth";

type Program = Array<string>;

export default function Programs() {
  const { user, authLoading } = useAuth();
  const [programs, setPrograms] = useState<Program>([]);

  useEffect(() => {
    async function fetchPrograms() {
      const programsRef: Program = await getPrograms();
      setPrograms(programsRef);
    }
    fetchPrograms();
  }, []);

  const handleDelete = async (program: string) => {
    const action = confirm(
      `Are you sure you want to delete program "${program}"?`
    );
    if (!action) return;
    const success = await deleteProgram(program);
    if (!success)
      return alert(`An error occured deleting program "${program}"`);
    // Refresh programs list
    setPrograms(programs.filter((p) => p !== program));
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
          <div className="text-neutral-800 dark:text-white p-6 md:p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 font-dm-serif-display">
              Programs
            </h1>
            <div className="flex justify-center px-4 sm:px-8 w-full max-w-5xl">
              <div className="grid w-full grid-cols-1 auto-rows-min max-w-sm md:max-w-none md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program, index) => (
                  <div
                    key={index}
                    className="border border-neutral-200 dark:border-neutral-800 p-2 rounded-lg flex flex-col justify-between gap-6"
                  >
                    <div className="flex justify-between items-start gap-3 pl-1.5">
                      <span className="text-xl flex-1 mt-0.5 font-semibold">
                        {formatProgramName(program)}
                      </span>
                      <button
                        className="p-2 max-h-fit rounded-md text-white bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600 active:scale[99%] transition-transform duration-100 ease"
                        onClick={() => handleDelete(program)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="flex flex-col justify-center gap-2 p-1">
                      <Link
                        href={`dashboard/programs/${program}/participants`}
                        className="w-full px-3 py-2 text-sm font-medium flex justify-center items-center gap-2 rounded-md bg-none border border-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition active:scale-[99%] duration-100 ease"
                      >
                        <Users className="size-4" />
                        <span>Edit Participants</span>
                      </Link>
                      <Link
                        href={`dashboard/programs/${program}/template`}
                        className="w-full px-3 py-2 text-sm font-medium flex justify-center items-center gap-2 rounded-md bg-none border border-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition active:scale-[99%] duration-100 ease"
                      >
                        <LayoutTemplate className="size-4" />
                        <span>Edit Template</span>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link
                  href={`dashboard/create`}
                  className="border p-6 min-h-36 md:min-h-none border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-900 rounded-lg flex flex-col justify-center items-center gap-2 transition duration-100 ease"
                >
                  <Plus className="size-7" />
                  <span className="text-lg font-semibold">
                    Create a Program
                  </span>
                </Link>
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
