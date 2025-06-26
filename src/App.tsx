import { useState } from 'react';
import styled from 'styled-components';
import { Box, ThemeProvider, createTheme } from '@mui/material';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import { ContentElement } from './types';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const theme = createTheme();

function App() {
  const [content, setContent] = useState<ContentElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeStyles, setActiveStyles] = useState<Record<string, any>>({});

  console.log('Current content:', content); // Para debug

  const handleAddElement = (element: Omit<ContentElement, 'id'>) => {
    const newElement: ContentElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
      style: { ...element.style },
      children: element.type === 'grid' ? [] : undefined,
      parentId: null
    };

    // Se for um grid, inicialize suas colunas
    if (element.type === 'grid' && element.gridConfig) {
      newElement.children = Array.from({ length: element.gridConfig.columns }).map((_, index) => ({
        id: `${newElement.id}-col-${index}`,
        type: 'column',
        content: '',
        style: {},
        children: []
      }));
    }

    setContent(prev => {
      // Função helper para procurar elemento dentro das colunas do grid
      const findInGrid = (grid: ContentElement): boolean => {
        if (!grid.children) return false;
        
        // Procura nas colunas do grid
        const updatedColumns = grid.children.map((column, columnIndex) => {
          if (grid.id === selectedElementId && columnIndex === 0) {
            // Adiciona na primeira coluna do grid selecionado
            return {
              ...column,
              children: [...(column.children || []), { 
                ...newElement,
                parentId: `grid-${grid.id}-${columnIndex}`
              }]
            };
          }
          return column;
        });

        if (JSON.stringify(updatedColumns) !== JSON.stringify(grid.children)) {
          grid.children = updatedColumns;
          return true;
        }

        return false;
      };

      // Função helper para atualizar a estrutura do conteúdo
      const updateContent = (elements: ContentElement[]): ContentElement[] => {
        return elements.map(el => {
          if (el.id === selectedElementId) {
            // Se for um grid
            if (el.type === 'grid') {
              const found = findInGrid(el);
              if (found) return el;
            }
            // Se for outro tipo de container
            else if (el.type === 'section' || el.type === 'div') {
              return {
                ...el,
                children: [...(el.children || []), { ...newElement, parentId: el.id }]
              };
            }
          }
          
          // Procura recursivamente
          if (el.children) {
            const updatedEl = {
              ...el,
              children: updateContent(el.children)
            };
            if (el.type === 'grid') {
              const found = findInGrid(updatedEl);
              if (found) return updatedEl;
            }
            return updatedEl;
          }
          return el;
        });
      };

      const updatedContent = updateContent(prev);
      // Se não foi adicionado em nenhum container, adiciona na raiz
      if (JSON.stringify(updatedContent) === JSON.stringify(prev)) {
        return [...prev, newElement];
      }
      return updatedContent;
    });

    // Seleciona o novo elemento e limpa os estilos ativos
    setSelectedElementId(newElement.id);
    setActiveStyles({});
  };

  const handleStyleChange = (style: Record<string, any>) => {
    if (selectedElementId) {
      setContent((prev) => {
        const updateStyles = (elements: ContentElement[]): ContentElement[] => {
          return elements.map(el => {
            if (el.id === selectedElementId) {
              return { ...el, style: { ...el.style, ...style } };
            }
            if (el.children) {
              return {
                ...el,
                children: updateStyles(el.children)
              };
            }
            return el;
          });
        };
        return updateStyles(prev);
      });
      setActiveStyles(style);
    }
  };

  const handleElementSelect = (element: ContentElement | null) => {
    if (element) {
      setSelectedElementId(element.id);
      setActiveStyles(element.style || {});
    } else {
      setSelectedElementId(null);
      setActiveStyles({});
    }
  };

  const handleContentChange = (elementId: string, newContent: string) => {
    setContent((prev) => {
      const updateContent = (elements: ContentElement[]): ContentElement[] => {
        return elements.map(el => {
          if (el.id === elementId) {
            return { ...el, content: newContent };
          }
          if (el.children) {
            return {
              ...el,
              children: updateContent(el.children)
            };
          }
          return el;
        });
      };
      return updateContent(prev);
    });
  };

  const handleReorderElements = (newContent: ContentElement[]) => {
    setContent(newContent);
  };

  const handleDeleteElement = (elementId: string) => {
    setContent((prev) => {
      const deleteFromArray = (elements: ContentElement[]): ContentElement[] => {
        return elements.filter(el => {
          if (el.id === elementId) {
            return false;
          }
          if (el.children) {
            el.children = deleteFromArray(el.children);
          }
          return true;
        });
      };

      return deleteFromArray(prev);
    });

    // Limpa a seleção e estilos ativos se o elemento deletado estava selecionado
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
      setActiveStyles({});
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap' }}>
          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '50%' } }}>
            <EditorPanel
              onAddElement={handleAddElement}
              onStyleChange={handleStyleChange}
              selectedElementId={selectedElementId}
              isEditingEnabled={selectedElementId !== null}
              onContentChange={(newContent) => {
                if (selectedElementId) {
                  handleContentChange(selectedElementId, newContent);
                }
              }}
              selectedElement={
                content.find(el => el.id === selectedElementId) ||
                content.flatMap(el => el.children || []).find(el => el?.id === selectedElementId) ||
                null
              }
            />
          </Box>
          <Box sx={{ flex: '1 1 100%', maxWidth: { xs: '100%', md: '50%' } }}>
            <PreviewPanel
              content={content}
              activeStyles={activeStyles}
              onElementSelect={handleElementSelect}
              selectedElementId={selectedElementId}
              onReorderElements={handleReorderElements}
              onDeleteElement={handleDeleteElement}
              onContentChange={handleContentChange}
            />
          </Box>
        </Box>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
