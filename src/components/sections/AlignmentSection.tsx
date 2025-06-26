import React from 'react';
import { Button, Typography, Box } from '@mui/material';

interface AlignmentSectionProps {
  onStyleChange: (style: any) => void;
}

const AlignmentSection: React.FC<AlignmentSectionProps> = ({ onStyleChange }) => {
  const handleAlignment = (alignment: string) => {
    onStyleChange({ textAlign: alignment });
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Alignment
      </Typography>      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ flex: '1 1 calc(50% - 4px)' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleAlignment('left')}
          >
            Left
          </Button>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 4px)' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleAlignment('center')}
          >
            Center
          </Button>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 4px)' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleAlignment('right')}
          >
            Right
          </Button>
        </Box>
        <Box sx={{ flex: '1 1 calc(50% - 4px)' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleAlignment('justify')}
          >
            Justify
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default AlignmentSection;
