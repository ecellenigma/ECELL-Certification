"use client";
import { useState, useEffect } from "react";
import { getPrograms, deleteProgram } from "@/lib/firebase/firestore";
import Link from "next/link";
import { Edit, LoaderCircleIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/providers/AuthContext";

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
    await deleteProgram(program);
    // Refresh programs list
    const programsRef: Program = await getPrograms();
    setPrograms(programsRef);
  };

  return (
    <>
      {user && !authLoading ? (
        <div className="text-white p-6 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-6">Programs</h1>
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="relative bg-indigo-700 p-6 rounded-lg shadow-lg text-center"
                >
                  <h2 className="text-2xl font-semibold mb-4">{program}</h2>
                  <div className="absolute top-2 left-2">
                    <Link
                      href={`dashboard/programs/${program}/participants`}
                      legacyBehavior
                    >
                      <a className="text-blue-300 hover:text-blue-500">
                        <Edit className="h-5 w-5" />
                      </a>
                    </Link>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button
                      className="text-red-300 hover:text-red-500"
                      onClick={() => handleDelete(program)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex justify-center space-x-4 mt-6">
                    <Link
                      href={`dashboard/programs/${program}/template`}
                      legacyBehavior
                    >
                      <a className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                        Details
                      </a>
                    </Link>
                  </div>
                </div>
              ))}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-center">
                <Link href={`dashboard/create`} legacyBehavior>
                  <a className="text-green-300 hover:text-green-500 text-4xl">
                    +
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid place-items-center p-8 gap-2 min-h-[100dvh]">
          <LoaderCircleIcon className="size-16 stroke-indigo-700 animate-spin" />
        </div>
      )}
    </>
  );
}
