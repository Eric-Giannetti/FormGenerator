import React, { useEffect, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import styled from 'styled-components';
import InlineTextEditor from './InlineTextEditor';

const DraggableElement = styled.div<{ $isDragging: boolean; $isSelected: boolean; $isOver: boolean }>`
  position: relative;
  cursor: move;
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  outline: ${props => props.$isSelected ? '2px solid #1976d2' : 'none'};
  background-color: ${props => props.$isOver ? 'rgba(25, 118, 210, 0.1)' : 'transparent'};
  &:hover {
    outline: ${props => !props.$isSelected ? '2px solid #90caf9' : '2px solid #1976d2'};
  }
  margin: 4px 0;
  padding: 4px;
  min-height: 30px;
`;

interface DraggableContentProps {
  id: string;
  index: number;
  type: string;
  content: string;
  style: Record<string, any>;
  isSelected: boolean;
  isContainer?: boolean;
  parentId?: string | null;
  onClick: (event: React.MouseEvent) => void;
  onMove: (dragIndex: number, hoverIndex: number, sourceParentId: string | null, targetParentId: string | null) => void;
  onDelete?: (id: string) => void;
  onContentChange?: (newContent: string) => void;
  children?: React.ReactNode;
}

const DraggableContent: React.FC<DraggableContentProps> = ({
  id,
  index,
  type,
  content,
  style,
  isSelected,
  isContainer = false,
  parentId = null,
  onClick,
  onMove,
  onDelete,
  onContentChange,
  children
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [{ isDragging }, drag] = useDrag({
    type: 'content-element',
    item: { id, index, type, parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'content-element',
    hover: (item: { index: number; parentId: string | null }, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;
      const sourceParentId = item.parentId;
      const targetParentId = isContainer ? id : parentId;

      if (dragIndex === hoverIndex && sourceParentId === targetParentId) {
        return;
      }

      onMove(dragIndex, hoverIndex, sourceParentId, targetParentId);
      item.index = hoverIndex;
      item.parentId = targetParentId;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && onDelete && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Previne a deleção quando estiver editando texto
        if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          onDelete(id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [id, isSelected, onDelete]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'].includes(type)) {
      setIsEditing(true);
    }
  };

  const handleContentSave = (newContent: string) => {
    setIsEditing(false);
    if (onContentChange) {
      onContentChange(newContent);
    }
  };

  const ElementTag = type as keyof JSX.IntrinsicElements;

  return (
    <div ref={drop}>
      <DraggableElement
        ref={drag}
        $isDragging={isDragging}
        $isSelected={isSelected}
        $isOver={isOver}
        onClick={onClick}
        onDoubleClick={handleDoubleClick}
        tabIndex={0} // Permite que o elemento receba foco via teclado
      >
        {type === 'img' ? (
          <img src={content} style={style} alt="" />
        ) : isEditing ? (
          <InlineTextEditor
            initialText={content}
            onSave={handleContentSave}
            style={style}
          />
        ) : (
          <ElementTag style={style}>
            {content}
            {children}
          </ElementTag>
        )}
      </DraggableElement>
    </div>
  );
};

export default DraggableContent;
