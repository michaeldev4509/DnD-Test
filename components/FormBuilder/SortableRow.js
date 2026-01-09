'use client'

import { useSortable } from '@dnd-kit/sortable'
import { useDndContext } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import FormRow from './FormRow'

export default function SortableRow({
  row,
  onDeleteField,
  onAddColumn,
  onDeleteColumn,
  onDeleteRow,
}) {
  const { active, over } = useDndContext()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
    data: {
      type: 'row',
      row: row,
    },
  })

  // Highlight when dragging a row and hovering over this row (but not dragging this row itself)
  const isDraggingRow = active && active.data.current?.type === 'row' && active.id !== row.id
  const isOverThisRow = over && (over.id === row.id || (typeof over.id === 'string' && over.id.replace('row-', '') === row.id))
  const shouldHighlight = isOverThisRow && isDraggingRow

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  }

  return (
    <div 
      style={style}
      ref={setNodeRef}
      className={shouldHighlight ? 'ring-2 ring-purple-500 ring-offset-2 rounded-lg' : ''}
    >
      <FormRow
        row={row}
        onDeleteField={onDeleteField}
        onAddColumn={onAddColumn}
        onDeleteColumn={onDeleteColumn}
        onDeleteRow={onDeleteRow}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}
