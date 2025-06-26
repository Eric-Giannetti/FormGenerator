import React from 'react';
import { Typography, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

interface StyleSectionProps {
  onStyleChange: (style: any) => void;
}

const StyleSection: React.FC<StyleSectionProps> = ({ onStyleChange }) => {
  const handleStyleChange = (property: string, value: string) => {
    onStyleChange({ [property]: value });
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Styling
      </Typography>      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Font Size</InputLabel>
          <Select
            defaultValue="16px"
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
          >
            <MenuItem value="12px">Small</MenuItem>
            <MenuItem value="16px">Medium</MenuItem>
            <MenuItem value="20px">Large</MenuItem>
            <MenuItem value="24px">Extra Large</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Font Weight</InputLabel>
          <Select
            defaultValue="normal"
            onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="bold">Bold</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Font Style</InputLabel>
          <Select
            defaultValue="normal"
            onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
          >
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="italic">Italic</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Text Color</InputLabel>
          <Select
            defaultValue="black"
            onChange={(e) => handleStyleChange('color', e.target.value)}
          >
            <MenuItem value="black">Black</MenuItem>
            <MenuItem value="gray">Gray</MenuItem>
            <MenuItem value="blue">Blue</MenuItem>
            <MenuItem value="red">Red</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </div>
  );
};

export default StyleSection;
