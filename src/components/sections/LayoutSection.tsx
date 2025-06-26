import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import GridConfigDialog from '../GridConfigDialog';
import { ContentElement } from '../../types';

interface LayoutSectionProps {
  onAddElement: (element: Omit<ContentElement, 'id'>) => void;
  isEditingEnabled: boolean;
}

const LayoutSection: React.FC<LayoutSectionProps> = ({ onAddElement, isEditingEnabled }) => {
  const [isGridDialogOpen, setIsGridDialogOpen] = useState(false);

  const handleAddSection = () => {
    onAddElement({
      type: 'section',
      content: '',
      style: {
        padding: '16px',
        margin: '16px 0',
        border: '1px solid #ddd',
      }
    });
  };

  const handleAddGrid = (config: { columns: number; columnWidths?: string[] }) => {
    onAddElement({
      type: 'grid',
      content: '',
      style: {
        width: '100%',
        margin: '16px 0'
      },
      gridConfig: config,
      children: []
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Layout
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleAddSection}
          disabled={!isEditingEnabled}
          fullWidth
        >
          Add Section
        </Button>
        <Button
          variant="outlined"
          onClick={() => setIsGridDialogOpen(true)}
          disabled={!isEditingEnabled}
          fullWidth
        >
          Add Grid Layout
        </Button>
      </Box>

      <GridConfigDialog
        open={isGridDialogOpen}
        onClose={() => setIsGridDialogOpen(false)}
        onConfirm={handleAddGrid}
      />
    </Box>
  );
};

export default LayoutSection;
