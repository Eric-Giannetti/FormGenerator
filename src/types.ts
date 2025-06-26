export interface ContentElement {
  id: string;
  type: string;
  content: string;
  style: Record<string, any>;
  children?: ContentElement[];
  parentId?: string | null;
  columnIndex?: number;
  gridConfig?: {
    columns: number;
    columnWidths?: string[];
  };
}
