import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { ContentElement } from '../../types';

interface TextSectionProps {
  onAddElement: (element: Omit<ContentElement, 'id'>) => void;
  isEditingEnabled?: boolean;
}

const TextSection: React.FC<TextSectionProps> = ({ onAddElement, isEditingEnabled = true }) => {
  const handleAddText = (type: string) => {
    const elements = {
      h1: {
        type: 'h1',
        content: 'New Title',
        style: { 
          fontSize: '2em', 
          marginBottom: '0.5em',
          fontWeight: 'bold'
        }
      },
      h2: {
        type: 'h2',
        content: 'New Subtitle',
        style: { 
          fontSize: '1.5em', 
          marginBottom: '0.5em',
          fontWeight: 'bold'
        }
      },
      h3: {
        type: 'h3',
        content: 'New Heading',
        style: { 
          fontSize: '1.25em', 
          marginBottom: '0.5em',
          fontWeight: 'bold'
        }
      },
      p: {
        type: 'p',
        content: 'New Paragraph',
        style: { 
          marginBottom: '1em',
          lineHeight: '1.5'
        }
      },
      note: {
        type: 'div',
        content: 'New Note',
        style: {
          display: 'block',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderLeft: '4px solid #757575',
          marginBottom: '1em'
        }
      }
    };

    onAddElement(elements[type as keyof typeof elements]);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Text Content
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        opacity: isEditingEnabled ? 1 : 0.5,
        pointerEvents: isEditingEnabled ? 'auto' : 'none'
      }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleAddText('h1')}
        >
          Add Title
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleAddText('h2')}
        >
          Add Subtitle
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleAddText('h3')}
        >
          Add Heading
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleAddText('p')}
        >
          Add Paragraph
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => handleAddText('note')}
        >
          Add Note
        </Button>
      </Box>
    </Box>
  );
};

export default TextSection;
