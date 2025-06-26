import React from 'react';
import styled from 'styled-components';
import { ContentElement } from '../types';
import { useDrop } from 'react-dnd';

interface GridContainerProps {
  columns: number;
  columnWidths?: string[];
  children?: React.ReactNode;
  style?: Record<string, any>;
  id: string;
  isSelected: boolean;
  onElementSelect: (element: ContentElement) => void;
  onDropToColumn?: (columnIndex: number, item: any) => void;
}

const StyledGridContainer = styled.div<{ $columns: number; $columnWidths?: string[]; $isSelected: boolean }>`
  display: grid;
  grid-template-columns: ${props => props.$columnWidths ? props.$columnWidths.join(' ') : `repeat(${props.$columns}, 1fr)`};
  gap: 16px;
  padding: 16px;
  border: 1px dashed ${props => props.$isSelected ? '#1976d2' : '#ccc'};
  margin: 8px 0;
  min-height: 100px;
  transition: border-color 0.2s ease;
`;

const GridColumn = styled.div<{ $isEmpty: boolean; $isOver: boolean }>`
  min-height: 50px;
  padding: 8px;
  border: 1px dashed ${props => props.$isOver ? '#1976d2' : '#eee'};
  background-color: ${props => props.$isOver ? 'rgba(25, 118, 210, 0.1)' : 
    props.$isEmpty ? 'rgba(0, 0, 0, 0.02)' : 'transparent'};
  transition: all 0.2s ease;
  
  ${props => props.$isEmpty && `
    &::after {
      content: 'Drop content here';
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 80px;
    }
  `}
`;

const GridContainer: React.FC<GridContainerProps> = ({
  columns,
  columnWidths,
  children,
  style,
  id,
  isSelected,
  onElementSelect,
  onDropToColumn
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onElementSelect({
      id,
      type: 'grid',
      content: '',
      style: style || {},
      gridConfig: { columns, columnWidths }
    });
  };

  // Renderiza cada coluna do grid
  const renderColumn = (columnIndex: number) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'content-element',
      drop: (item) => {
        if (onDropToColumn) {
          onDropToColumn(columnIndex, item);
          return { columnIndex };
        }
      },
      collect: monitor => ({
        isOver: monitor.isOver(),
      }),
    });

    // Filtra os elementos que pertencem a esta coluna
    const columnChildren = React.Children.toArray(children).find(
      (child: any) => child.props['data-grid-column'] === columnIndex
    );

    return (
      <GridColumn
        key={`${id}-col-${columnIndex}`}
        ref={drop}
        data-column-index={columnIndex}
        $isEmpty={!columnChildren}
        $isOver={isOver}
      >
        {columnChildren}
      </GridColumn>
    );
  };

  return (
    <StyledGridContainer
      $columns={columns}
      $columnWidths={columnWidths}
      $isSelected={isSelected}
      style={style}
      onClick={handleClick}
    >
      {Array.from({ length: columns }).map((_, index) => renderColumn(index))}
    </StyledGridContainer>
  );
};

export default GridContainer;
