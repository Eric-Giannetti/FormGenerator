import React from 'react';
import styled from 'styled-components';
import { Typography, Paper, Box } from '@mui/material';
import TextSection from './sections/TextSection';
import ImageSection from './sections/ImageSection';
import StyleSection from './sections/StyleSection';
import LayoutSection from './sections/LayoutSection';
import AlignmentSection from './sections/AlignmentSection';
import { ContentElement } from '../types';

const EditorContainer = styled(Paper)`
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
`;

interface EditorPanelProps {
  onAddElement: (element: Omit<ContentElement, 'id'>) => void;
  onStyleChange: (style: Record<string, any>) => void;
  selectedElementId: string | null;
  isEditingEnabled: boolean;
  onContentChange: (content: string) => void;
  selectedElement: ContentElement | null;
}

const EditorPanel: React.FC<EditorPanelProps> = ({
  onAddElement,
  onStyleChange,
  selectedElementId,
  isEditingEnabled,
  onContentChange,
  selectedElement
}) => {
  return (
    <EditorContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Editor Panel
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <LayoutSection 
          onAddElement={onAddElement} 
          isEditingEnabled={true} 
        />
        <TextSection 
          onAddElement={onAddElement}
          isEditingEnabled={true}
        />
        <ImageSection 
          onAddElement={onAddElement}
          isEditingEnabled={true}
        />
        <Box sx={{ opacity: isEditingEnabled ? 1 : 0.5, pointerEvents: isEditingEnabled ? 'auto' : 'none' }}>
          <StyleSection onStyleChange={onStyleChange} />
          <AlignmentSection onStyleChange={onStyleChange} />
        </Box>
      </Box>
    </EditorContainer>
  );
};

export default EditorPanel;
