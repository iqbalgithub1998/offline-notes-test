import { useCallback, useEffect, useState } from "react";
import { Button, Container, Heading } from "../styles/styled";
import { SpinnerContainer } from "./LoadingSpinner";
import {
  Note,
  createNote,
  submitNote,
  deleteNote,
  editNote,
  refreshNotes,
  getNotes,
} from "../utils/notes";

import styled from "styled-components";

import NoteForm from "./NoteForm";
import NoteItem from "./NoteItem";
import OfflineIndicator from "./OfflineIndicator";

const FilterContainer = styled.div`
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NotesContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NoteListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%; /* Adjust the width to a percentage value */
  margin: auto; /* Add margin: auto to center the wrapper */
`;

const TagButton = styled(Button)`
  margin: 0.5rem;
  cursor: pointer;
`;

const NoteListLoadingSpinner = styled(SpinnerContainer)`
  margin-top: 20px;
  margin-bottom: 10px;
`;

// interface Note {
//   _id: string;
//   title: string;
//   tags: string[];
//   createdAt: Date;
// }

export default function NoteList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);

  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      const notesFromDB: Note[] = await getNotes(); // Replace with actual function
      setAllNotes(notesFromDB);

      // Extract all unique tags from notes
      const fetchedtags = Array.from(
        new Set(notesFromDB.flatMap((note) => note.tags ?? []))
      );
      console.log("All tags:", fetchedtags);
      setAllTags(fetchedtags);
      // setTags([""]);
    };

    loadNotes();
  }, []);

  useEffect(() => {
    console.log("Filtering notes with tags:", tags);
    if (tags.length === 0) {
      setFilteredNotes(allNotes);
      return;
    }
    const filtered = allNotes.filter((note) => {
      return note.tags.every((tag) => tags.includes(tag));
    });

    console.log("Filtered notes:", filtered);

    setFilteredNotes(filtered);
  }, [tags, allNotes]);

  const handleNoteSubmit = useCallback(
    async (noteTitle: string, noteTags: string[]) => {
      console.log("Submitting note:", noteTitle, noteTags);
      const note: Note = createNote(noteTitle, noteTags);
      await submitNote(note);
      const latesnote: Note[] = await getNotes();
      console.log("Latest notes:", latesnote);
      let fetchedtags: string[] = [];
      for (let i = 0; i < latesnote.length; i++) {
        fetchedtags = [...fetchedtags, ...latesnote[i].tags];
      }
      console.log("Fetched tags:", fetchedtags);
      fetchedtags = Array.from(new Set(fetchedtags)); // Remove duplicates
      console.log("All tags:", fetchedtags);
      setAllTags(fetchedtags);
      // setTags([]);
      setAllNotes(await getNotes());
    },
    []
  );

  const handleNoteDelete = useCallback(async (noteId: string) => {
    await deleteNote(noteId);
    let getchedNotes: Note[] = await getNotes();
    console.log("Fetched notes:", getchedNotes);
    let fetchedtags: string[] = [];
    for (let i = 0; i < getchedNotes.length; i++) {
      fetchedtags = [...fetchedtags, ...getchedNotes[i].tags];
    }
    console.log("Fetched tags:", fetchedtags);
    fetchedtags = Array.from(new Set(fetchedtags)); // Remove duplicates
    console.log("All tags:", fetchedtags);
    setAllNotes(getchedNotes);
    setAllTags(fetchedtags);
    // setTags([fetchedtags[0]]);
  }, []);

  const handleEditNote = useCallback(
    async (noteId: string, updatedTitle: string) => {
      await editNote(noteId, updatedTitle);
      setAllNotes(await getNotes());
    },
    []
  );

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      await refreshNotes();
      setAllNotes(await getNotes());
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { type: "module" })
        .then((registration) => {
          console.log("Service Worker registered:", registration);

          // Listen for the "online" event to trigger sync
          window.addEventListener("online", async () => {
            registration.sync
              .register("sync-notes")
              .then(() => {
                console.log("Sync event registered");
              })
              .catch((error) => {
                console.error("Sync event registration failed:", error);
              });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    window.addEventListener("online", async () => {
      await fetchNotes();
    });
  }, [fetchNotes]);

  const handleTagToggle = (tag: string) => {
    setTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag); // Remove the tag
      } else {
        return [...prevTags, tag]; // Add the tag
      }
    });
  };

  return (
    <NotesContainer>
      <Heading>Notes</Heading>
      <NoteListWrapper>
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        {loading && <NoteListLoadingSpinner />}
        <FilterContainer>
          {allTags.map((tag) => (
            <TagButton
              key={tag}
              onClick={() => handleTagToggle(tag)}
              style={{
                backgroundColor: tags.includes(tag) ? "#007bff" : "#f1f1f1",
                color: tags.includes(tag) ? "#fff" : "#000",
              }}
            >
              #{tag}
            </TagButton>
          ))}
        </FilterContainer>
        <ul>
          {filteredNotes.map((note, index) => (
            <NoteItem
              key={index}
              note={note}
              onDeleteNote={handleNoteDelete}
              onEditNote={handleEditNote}
            />
          ))}
        </ul>
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer>
  );
}

{
  /* <NotesContainer>
      <Heading>Notes</Heading>
      <NoteListWrapper>
        <NoteForm onNoteSubmit={handleNoteSubmit} />
        {loading && <NoteListLoadingSpinner />}
        <ul>
          {allNotes.map((note, index) => (
            <NoteItem
              key={index}
              note={note}
              onDeleteNote={handleNoteDelete}
              onEditNote={handleEditNote}
            />
          ))}
        </ul>
      </NoteListWrapper>
      <OfflineIndicator />
    </NotesContainer> */
}

// <div>
//       <h2>Notes</h2>
//       {/* Tag filter UI */}
//       <FilterContainer>
//         {allTags.map((tag) => (
//           <TagButton
//             key={tag}
//             onClick={() => handleTagToggle(tag)}
//             style={{
//               backgroundColor: tags.includes(tag) ? "#007bff" : "#f1f1f1",
//               color: tags.includes(tag) ? "#fff" : "#000",
//             }}
//           >
//             #{tag}
//           </TagButton>
//         ))}
//       </FilterContainer>
//       {/* Display filtered notes */}
//       <NoteForm onNoteSubmit={handleNoteSubmit} />
//       <div>
//         {filteredNotes.length > 0 ? (
//           filteredNotes.map((note) => (
//             <NoteListWrapper key={note._id}>
//               <h3>{note.title}</h3>
//               <p>{note.createdAt.toString()}</p>
//               <div>Tags: {(note.tags ?? []).join(", ")}</div>
//             </NoteListWrapper>
//           ))
//         ) : (
//           <p>No notes match the selected tags.</p>
//         )}
//       </div>
//     </div>
