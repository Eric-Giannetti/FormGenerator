import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';

interface TextEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  isEnabled: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent,
  onContentChange,
  isEnabled
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = event.target.value;
    setContent(newContent);
    onContentChange(newContent);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <TextField
        fullWidth
        label="Edit Text"
        value={content}
        onChange={handleChange}
        disabled={!isEnabled}
        multiline
        rows={2}
      />
    </Box>
  );
};

export default TextEditor;
