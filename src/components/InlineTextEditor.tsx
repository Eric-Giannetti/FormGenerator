import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const EditorInput = styled.textarea`
  width: 100%;
  min-height: 24px;
  padding: 4px;
  margin: 0;
  border: 1px solid #1976d2;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  resize: vertical;
  background: white;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`;

interface InlineTextEditorProps {
  initialText: string;
  onSave: (newText: string) => void;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}

const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  initialText,
  onSave,
  style,
  autoFocus = true
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [autoFocus]);

  const handleBlur = () => {
    if (text !== initialText) {
      onSave(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave(text);
    }
    if (e.key === 'Escape') {
      setText(initialText);
      onSave(initialText);
    }
  };

  return (
    <EditorInput
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={style}
      rows={1}
    />
  );
};

export default InlineTextEditor;
