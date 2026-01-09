'use client'

import { useDroppable, useDndContext } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback } from 'react'
import SortableColumn from './SortableColumn'

export default function FormRow({ row, onDeleteField, onAddColumn, onDeleteColumn, onDeleteRow, dragHandleProps }) {
  const { active } = useDndContext()
  const columnIds = row.columns.map((col) => col.id)
  
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `row-${row.id}`,
    data: {
      type: 'row',
      rowId: row.id,
    },
  })

  // Determine if we should highlight - only when dragging a column (rows are drop zones for columns)
  // Note: Row highlighting when dragging rows is handled by the SortableRow wrapper
  const isDraggingColumn = active && active.data.current?.type === 'column' && active.data.current?.column
  const shouldHighlight = isOver && isDraggingColumn

  return (
    <div 
      ref={setDroppableRef}
      className={`mb-4 bg-white border rounded-lg shadow-sm transition-colors ${
        shouldHighlight ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`}
    >
      <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
        <div 
          {...(dragHandleProps || {})}
          className="text-sm font-semibold text-gray-600 cursor-grab active:cursor-grabbing flex items-center gap-2 select-none"
        >
          <span>☰</span>
          <span>Row {row.id.slice(-4)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddColumn(row.id)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            + Column
          </button>
          <button
            onClick={() => onDeleteRow(row.id)}
            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete Row
          </button>
        </div>
      </div>
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="p-4 flex gap-4">
          {row.columns.map((column) => (
            <SortableColumn
              key={column.id}
              column={column}
              rowId={row.id}
              onDeleteField={onDeleteField}
              onAddField={onAddColumn}
              onDeleteColumn={row.columns.length > 1 ? onDeleteColumn : null}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
