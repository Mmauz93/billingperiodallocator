/**
 * Accessible Table Component
 * 
 * Enhances the standard table component with improved accessibility features
 * for screen readers, keyboard navigation, and proper ARIA attributes.
 */

'use client';

import React, { useRef } from 'react';

import { useAnnouncer } from './announcer';
import { useArrowNavigation } from '@/lib/hooks/use-keyboard';

interface AccessibleTableProps {
  caption?: string;
  summary?: string;
  children: React.ReactNode;
  onRowSelect?: (index: number) => void;
  className?: string;
  selectable?: boolean;
}

export function AccessibleTable({
  caption,
  summary,
  children,
  onRowSelect,
  className = '',
  selectable = false,
}: AccessibleTableProps) {
  const [selectedRow, setSelectedRow] = React.useState<number>(-1);
  const tableRef = useRef<HTMLTableElement>(null);
  const { announce } = useAnnouncer();
  
  // Get all data rows (ignore header and footer)
  const getDataRows = () => {
    if (!tableRef.current) return [];
    const tbody = tableRef.current.querySelector('tbody');
    if (!tbody) return [];
    return Array.from(tbody.querySelectorAll('tr'));
  };
  
  // Handle row selection
  const handleRowSelect = (index: number) => {
    setSelectedRow(index);
    if (onRowSelect) {
      onRowSelect(index);
    }
    
    // Announce the selected row to screen readers
    const rows = getDataRows();
    if (rows[index]) {
      // Create a descriptive message from the row's cell contents
      const cells = Array.from(rows[index].querySelectorAll('td')).map(cell => cell.textContent);
      announce(`Row selected: ${cells.join(', ')}`, 'polite');
    }
  };
  
  // Set up keyboard navigation if selectable
  useArrowNavigation({
    containerRef: tableRef as React.RefObject<HTMLElement>,
    selectedIndex: selectedRow,
    onIndexChange: handleRowSelect,
    itemCount: tableRef.current ? getDataRows().length : 0,
    orientation: 'vertical',
    enabled: selectable,
  });
  
  // Handle click events on rows
  const handleRowClick = (e: React.MouseEvent<HTMLTableElement>) => {
    if (!selectable) return;
    
    const target = e.target as HTMLElement;
    const row = target.closest('tr');
    if (!row) return;
    
    const rows = getDataRows();
    const index = rows.indexOf(row as HTMLTableRowElement);
    if (index !== -1) {
      handleRowSelect(index);
    }
  };

  return (
    <div className="accessible-table-container">
      {summary && (
        <div className="sr-only" aria-hidden="false">
          {summary}
        </div>
      )}
      
      <table
        ref={tableRef}
        className={className}
        onClick={handleRowClick}
        role="grid"
        aria-rowcount={getDataRows().length}
        aria-describedby={summary ? 'table-summary' : undefined}
      >
        {caption && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}

export function AccessibleTableRow({
  children,
  isSelected,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { isSelected?: boolean }) {
  return (
    <tr
      {...props}
      role="row"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      className={`${props.className || ''} ${isSelected ? 'bg-accent/20' : ''}`}
    >
      {children}
    </tr>
  );
} 
