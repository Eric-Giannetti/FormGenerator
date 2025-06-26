import React, { useRef } from 'react';
import { Button, Typography } from '@mui/material';

interface ImageSectionProps {
  onAddElement: (element: any) => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({ onAddElement }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageElement = {
          type: 'img',
          content: '',
          style: {
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '1em auto'
          },
          src: e.target?.result
        };
        onAddElement(imageElement);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Image Content
      </Typography>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
      <Button
        fullWidth
        variant="outlined"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload Image
      </Button>
    </div>
  );
};

export default ImageSection;
