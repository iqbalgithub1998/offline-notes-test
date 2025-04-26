import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import styled from "styled-components";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "../styles/styled";

const NoteFormContainer = styled.form`
  display: flex;
  align-items: stretch;
  align-self: center; /* Center the form horizontally */
`;

const NoteInput = styled.textarea`
  height: 100px;
  width: 100%;
  resize: vertical;
  margin-right: 1rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  flex-grow: 1;
`;

const TagsInput = styled.input`
  margin-top: 10px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
`;

const Tag = styled.span`
  background-color: #e0e0e0;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  margin: 0.2rem;
`;

const AddNoteButton = styled(Button)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
`;

interface NoteFormProps {
  onNoteSubmit: (noteTitle: string, tags: string[]) => Promise<void>;
}

const NoteForm: React.FC<NoteFormProps> = ({ onNoteSubmit }) => {
  const [isSyncing, setSyncing] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleNoteTitleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNoteTitle(event.target.value);
  };

  const handleTagInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTagInput(event.target.value);
  };

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags((prevTags) => [...prevTags, tag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tagInput.trim()) {
      handleAddTag(tagInput.trim());
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (noteTitle.trim() === "") {
      return;
    }
    setSyncing(true);

    await onNoteSubmit(noteTitle, [tagInput.trim()]);
    setSyncing(false);
    setNoteTitle("");
    setTags([""]);
    setTagInput("");
    setTags([]);
  };

  return (
    <NoteFormContainer onSubmit={handleSubmit}>
      <NoteInput
        rows={3}
        value={noteTitle}
        onChange={handleNoteTitleChange}
        placeholder="Enter your note..."
      />
      <TagsInput
        type="text"
        value={tagInput}
        onChange={handleTagInputChange}
        onKeyDown={handleTagKeyDown}
        placeholder="Add tags (Press Enter to add)"
      />
      <TagList>
        {tags.map((tag, index) => (
          <Tag key={index}>{tag}</Tag>
        ))}
      </TagList>
      <AddNoteButton type="submit">
        {isSyncing ? <LoadingSpinner /> : "Add Note"}
      </AddNoteButton>
    </NoteFormContainer>
  );
};

export default NoteForm;
