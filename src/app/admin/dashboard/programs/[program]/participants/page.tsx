"use client";
import { useState, useEffect } from "react";
import {
  getParticipants,
  setParticipant,
  deleteParticipant,
  addParticipant,
} from "@/lib/firebase/firestore";
import { Participant } from "@/types";
import { useParams } from "next/navigation";
import {
  Edit,
  Trash2,
  PlusCircle,
  MinusCircle,
  LoaderCircleIcon,
  LogOutIcon,
} from "lucide-react";
import { useAuth } from "@/providers/AuthContext";
import { signOut } from "@/lib/firebase/auth";

export default function ProgramParticipants() {
  const { program } = useParams();
  const { user, authLoading } = useAuth();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [newParticipant, setNewParticipant] = useState<Participant>({
    id: "",
    name: "",
    rank: 0,
  });
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set()
  );
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    async function fetchParticipants() {
      if (program) {
        const participantsRef = (await getParticipants(
          program as string
        )) as Participant[];
        setParticipants(participantsRef);
      }
    }
    fetchParticipants();
  }, [program]);

  const handleParticipantClick = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsAddingParticipant(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedParticipant) {
      setSelectedParticipant({
        ...selectedParticipant,
        [e.target.name]: e.target.value,
      });
    } else {
      setNewParticipant({
        ...newParticipant,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedParticipant) {
      await setParticipant(
        program as string,
        selectedParticipant.id,
        selectedParticipant
      );
      setSelectedParticipant(null);
    } else {
      await addParticipant(program as string, newParticipant);
      setNewParticipant({ id: "", name: "", rank: 0 });
      setIsAddingParticipant(false);
    }
    // Refresh participants list
    const participantsRef = (await getParticipants(
      program as string
    )) as Participant[];
    setParticipants(participantsRef);
  };

  const handleDelete = async (participantId: string) => {
    await deleteParticipant(program as string, participantId);
    // Refresh participants list
    const participantsRef = (await getParticipants(
      program as string
    )) as Participant[];
    setParticipants(participantsRef);
  };

  const handleSelect = (participantId: string) => {
    setSelectedParticipants((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(participantId)) {
        newSelected.delete(participantId);
      } else {
        newSelected.add(participantId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedParticipants(new Set());
    } else {
      const allParticipantIds = participants.map(
        (participant) => participant.id
      );
      setSelectedParticipants(new Set(allParticipantIds));
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteSelected = async () => {
    const deletePromises = Array.from(selectedParticipants).map(
      (participantId) => deleteParticipant(program as string, participantId)
    );
    await Promise.all(deletePromises);
    setSelectedParticipants(new Set());
    setSelectAll(false);
    // Refresh participants list
    const participantsRef = (await getParticipants(
      program as string
    )) as Participant[];
    setParticipants(participantsRef);
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
            <h1 className="text-3xl font-bold mb-6">Program: {program}</h1>
            <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-4xl">
              <table className="min-w-full bg-gray-900">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-700 text-left">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-indigo-600"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-2 px-4 border-b border-gray-700">ID</th>
                    <th className="py-2 px-4 border-b border-gray-700">Name</th>
                    <th className="py-2 px-4 border-b border-gray-700">Rank</th>
                    <th className="py-2 px-4 border-b border-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.id} className="text-center">
                      <td className="py-2 px-4 border-b border-gray-700 text-left">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-indigo-600"
                          checked={selectedParticipants.has(participant.id)}
                          onChange={() => handleSelect(participant.id)}
                        />
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {participant.id}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {participant.name}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {participant.rank}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        <button
                          className="text-blue-300 hover:text-blue-500 mx-2"
                          onClick={() => handleParticipantClick(participant)}
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          className="text-red-300 hover:text-red-500 mx-2"
                          onClick={() => handleDelete(participant.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-col items-center mt-4">
                <button
                  className="bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded mb-4 w-full max-w-xs flex items-center justify-center"
                  onClick={() => {
                    setIsAddingParticipant(!isAddingParticipant);
                    setSelectedParticipant(null);
                  }}
                >
                  {isAddingParticipant ? (
                    <MinusCircle className="h-5 w-5 inline-block mr-2" />
                  ) : (
                    <PlusCircle className="h-5 w-5 inline-block mr-2" />
                  )}
                  {isAddingParticipant ? "Cancel" : "Add Participant"}
                </button>
                {selectedParticipants.size > 0 && (
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full max-w-xs flex items-center justify-center"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-5 w-5 inline-block mr-2" />
                    Delete Selected
                  </button>
                )}
              </div>
            </div>

            {selectedParticipant && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit Participant</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      type="text"
                      id="name"
                      name="name"
                      value={selectedParticipant.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="rank">
                      Rank
                    </label>
                    <input
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      type="text"
                      id="rank"
                      name="rank"
                      value={selectedParticipant.rank}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    type="submit"
                  >
                    Save
                  </button>
                </form>
              </div>
            )}

            {isAddingParticipant && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Participant</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="id">
                      ID
                    </label>
                    <input
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      type="text"
                      id="id"
                      name="id"
                      value={newParticipant.id}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="name">
                      Name
                    </label>
                    <input
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      type="text"
                      id="name"
                      name="name"
                      value={newParticipant.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white mb-2" htmlFor="rank">
                      Rank
                    </label>
                    <input
                      className="w-full p-2 rounded bg-gray-700 text-white"
                      type="text"
                      id="rank"
                      name="rank"
                      value={newParticipant.rank}
                      onChange={handleInputChange}
                    />
                  </div>
                  <button
                    className="bg-indigo-700 hover:bg-indigo-900 text-white font-bold py-2 px-4 rounded w-full max-w-xs"
                    type="submit"
                  >
                    Add
                  </button>
                </form>
              </div>
            )}
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
