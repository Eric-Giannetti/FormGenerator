import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Slider
} from '@mui/material';

interface GridConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (config: { columns: number; columnWidths?: string[] }) => void;
}

const GridConfigDialog: React.FC<GridConfigDialogProps> = ({
  open,
  onClose,
  onConfirm
}) => {
  const [columns, setColumns] = useState(2);
  const [customWidths, setCustomWidths] = useState<number[]>([]);
  const [useCustomWidths, setUseCustomWidths] = useState(false);

  const handleColumnsChange = (_: Event, value: number | number[]) => {
    const newColumns = value as number;
    setColumns(newColumns);
    if (useCustomWidths) {
      setCustomWidths(Array(newColumns).fill(100 / newColumns));
    }
  };

  const handleWidthChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWidths = [...customWidths];
    newWidths[index] = Number(event.target.value);
    setCustomWidths(newWidths);
  };

  const handleConfirm = () => {
    const config = {
      columns,
      columnWidths: useCustomWidths ? customWidths.map(w => `${w}%`) : undefined
    };
    onConfirm(config);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configure Grid Layout</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Number of Columns</Typography>
          <Slider
            value={columns}
            onChange={handleColumnsChange}
            step={1}
            marks
            min={1}
            max={6}
            valueLabelDisplay="auto"
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button
            variant={useCustomWidths ? "contained" : "outlined"}
            onClick={() => {
              setUseCustomWidths(!useCustomWidths);
              if (!useCustomWidths) {
                setCustomWidths(Array(columns).fill(100 / columns));
              }
            }}
            sx={{ mb: 2 }}
          >
            {useCustomWidths ? "Using Custom Widths" : "Use Custom Column Widths"}
          </Button>

          {useCustomWidths && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: columns }).map((_, index) => (
                <TextField
                  key={index}
                  type="number"
                  label={`Column ${index + 1} Width (%)`}
                  value={customWidths[index] || 100 / columns}
                  onChange={handleWidthChange(index)}
                  inputProps={{ min: 1, max: 100 }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" color="primary">
          Create Grid
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GridConfigDialog;
