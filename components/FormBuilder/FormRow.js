'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import SortableColumn from './SortableColumn'

export default function FormRow({ row, onDeleteField, onAddColumn, onDeleteColumn, onDeleteRow }) {
  const columnIds = row.columns.map((col) => col.id)
  
  const { setNodeRef, isOver } = useDroppable({
    id: `row-${row.id}`,
    data: {
      type: 'row',
      rowId: row.id,
    },
  })

  return (
    <div 
      ref={setNodeRef}
      className={`mb-4 bg-white border border-gray-200 rounded-lg shadow-sm transition-colors ${
        isOver ? 'border-blue-500 bg-blue-50' : ''
      }`}
    >
      <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-600">Row {row.id.slice(-4)}</div>
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
