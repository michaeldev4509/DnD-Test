'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import FormColumn from './FormColumn'

export default function SortableColumn({ column, onDeleteField, onAddField, onDeleteColumn, rowId }) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column: column,
      rowId: rowId,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      style={style}
      className="flex-1 flex flex-col relative group"
    >
      <FormColumn
        column={column}
        onDeleteField={onDeleteField}
        onAddField={onAddField}
        dragHandleProps={{ ...attributes, ...listeners }}
        setColumnRef={setSortableRef}
      />
      {onDeleteColumn && (
        <button
          onClick={() => onDeleteColumn(rowId, column.id)}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Delete column"
        >
          ×
        </button>
      )}
    </div>
  )
}
