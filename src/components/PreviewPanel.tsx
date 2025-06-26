import React, { useState } from 'react';
import styled from 'styled-components';
import { Paper, Typography, Button } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import html2pdf from 'html2pdf.js';
import DraggableContent from './DraggableContent';
import GridContainer from './GridContainer';
import { ContentElement } from '../types';

const PreviewContainer = styled(Paper)`
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
`;

const PreviewContent = styled.div`
  min-height: 842px;
  width: 595px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

interface PreviewPanelProps {
  content: ContentElement[];
  activeStyles: any;
  onElementSelect: (element: ContentElement | null) => void;
  selectedElementId: string | null;
  onReorderElements: (newOrder: ContentElement[]) => void;
  onDeleteElement: (elementId: string) => void;
  onContentChange: (elementId: string, newContent: string) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  content,
  activeStyles,
  onElementSelect,
  selectedElementId,
  onReorderElements,
  onDeleteElement,
  onContentChange
}) => {
  console.log('Preview content:', content);

  const handleElementClick = (event: React.MouseEvent, element: ContentElement) => {
    event.stopPropagation();
    onElementSelect(element);
  };

  const handleBackgroundClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onElementSelect(null);
    }
  };

  const handleExportPDF = () => {
    const element = document.getElementById('preview-content');
    if (element) {
      const opt = {
        margin: 10,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const moveElement = (dragIndex: number, hoverIndex: number, sourceParentId: string | null, targetParentId: string | null) => {
    console.log('Moving element:', { dragIndex, hoverIndex, sourceParentId, targetParentId });
    
    const newContent = [...content];
    
    // Helper function to find element and its parent array
    const findElementAndParent = (elements: ContentElement[], parentId: string | null = null): [ContentElement[], number, ContentElement] | null => {
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        
        // Check current level
        if (element.parentId === parentId && i === dragIndex) {
          return [elements, i, element];
        }
        
        // Check grid columns
        if (element.type === 'grid' && element.children) {
          for (let colIndex = 0; colIndex < element.children.length; colIndex++) {
            const column = element.children[colIndex];
            if (column.children) {
              const gridParentId = `grid-${element.id}-${colIndex}`;
              if (gridParentId === sourceParentId) {
                for (let itemIndex = 0; itemIndex < column.children.length; itemIndex++) {
                  if (itemIndex === dragIndex) {
                    return [column.children, itemIndex, column.children[itemIndex]];
                  }
                }
              }
              const found = findElementAndParent(column.children, gridParentId);
              if (found) return found;
            }
          }
        }
        
        // Check regular children
        if (element.children) {
          const found = findElementAndParent(element.children, element.id);
          if (found) return found;
        }
      }
      return null;
    };

    // Find source element
    const sourceResult = findElementAndParent(newContent, sourceParentId);
    if (!sourceResult) {
      console.warn('Source element not found');
      return;
    }

    const [sourceArray, sourceIndex, movedElement] = sourceResult;
    sourceArray.splice(sourceIndex, 1);

    // Handle grid targets
    if (targetParentId?.startsWith('grid-')) {
      const [gridId, columnIndex] = targetParentId.replace('grid-', '').split('-');
      
      const findGridColumn = (elements: ContentElement[]): ContentElement[] | null => {
        for (const element of elements) {
          if (element.id === gridId && element.type === 'grid' && element.children) {
            // Ensure column exists and has children array
            if (!element.children[parseInt(columnIndex)]) {
              element.children[parseInt(columnIndex)] = { id: `${gridId}-col-${columnIndex}`, type: 'column', content: '', style: {}, children: [] };
            }
            if (!element.children[parseInt(columnIndex)].children) {
              element.children[parseInt(columnIndex)].children = [];
            }
            return element.children[parseInt(columnIndex)].children!;
          }
          if (element.children) {
            const found = findGridColumn(element.children);
            if (found) return found;
          }
        }
        return null;
      };

      const targetColumn = findGridColumn(newContent);
      if (targetColumn) {
        const updatedElement = { ...movedElement, parentId: targetParentId };
        targetColumn.splice(hoverIndex, 0, updatedElement);
        onReorderElements(newContent);
        return;
      } else {
        console.warn('Target grid column not found');
        return;
      }
    }

    // Handle container targets
    if (targetParentId) {
      const insertIntoParent = (elements: ContentElement[]): boolean => {
        for (const element of elements) {
          if (element.id === targetParentId) {
            if (!element.children) element.children = [];
            element.children.splice(hoverIndex, 0, { ...movedElement, parentId: targetParentId });
            return true;
          }
          if (element.children && insertIntoParent(element.children)) {
            return true;
          }
        }
        return false;
      };
      
      if (insertIntoParent(newContent)) {
        onReorderElements(newContent);
        return;
      } else {
        console.warn('Target parent not found');
      }
    }

    // Moving to root level
    newContent.splice(hoverIndex, 0, { ...movedElement, parentId: null });
    onReorderElements(newContent);
    console.log('Updated content:', newContent);
  };

  const handleDropToColumn = (gridId: string, columnIndex: number, item: any) => {
    const targetParentId = `grid-${gridId}-${columnIndex}`;
    moveElement(item.index, 0, item.parentId, targetParentId);
  };

  const renderElement = (element: ContentElement, index: number, parentId: string | null = null) => {
    console.log('Rendering element:', { id: element.id, type: element.type, parentId });

    if (element.type === 'grid' && element.gridConfig && element.children) {
      return (
        <DraggableContent
          key={element.id}
          id={element.id}
          index={index}
          type={element.type}
          content={element.content}
          style={element.style}
          isSelected={selectedElementId === element.id}
          onClick={(e) => handleElementClick(e, element)}
          onMove={moveElement}
          onDelete={onDeleteElement}
          onContentChange={(newContent) => onContentChange(element.id, newContent)}
          parentId={parentId}
          isContainer={true}
        >
          <GridContainer
            id={element.id}
            columns={element.gridConfig.columns}
            columnWidths={element.gridConfig.columnWidths}
            style={element.style}
            isSelected={selectedElementId === element.id}
            onElementSelect={(el) => handleElementClick(new MouseEvent('click') as any, el)}
            onDropToColumn={(columnIndex, item) => handleDropToColumn(element.id, columnIndex, item)}
          >
            {element.children.map((column, columnIndex) => (
              <div key={`${element.id}-col-${columnIndex}`} data-grid-column={columnIndex}>
                {column.children?.map((child, childIndex) => 
                  renderElement(child, childIndex, `grid-${element.id}-${columnIndex}`)
                )}
              </div>
            ))}
          </GridContainer>
        </DraggableContent>
      );
    }

    return (
      <DraggableContent
        key={element.id}
        id={element.id}
        index={index}
        type={element.type}
        content={element.content}
        style={element.style}
        isSelected={selectedElementId === element.id}
        onClick={(e) => handleElementClick(e, element)}
        onMove={moveElement}
        onDelete={onDeleteElement}
        onContentChange={(newContent) => onContentChange(element.id, newContent)}
        parentId={parentId}
        isContainer={element.type === 'section' || element.type === 'div'}
      >
        {element.children?.map((child, childIndex) => 
          renderElement(child, childIndex, element.id)
        )}
      </DraggableContent>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <PreviewContainer elevation={3}>
        <Typography variant="h5" gutterBottom>
          Preview
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExportPDF}
          style={{ marginBottom: 20 }}
        >
          Export to PDF
        </Button>
        <PreviewContent id="preview-content" onClick={handleBackgroundClick}>
          {content.map((element, index) => renderElement(element, index, null))}
        </PreviewContent>
      </PreviewContainer>
    </DndProvider>
  );
};

export default PreviewPanel;
