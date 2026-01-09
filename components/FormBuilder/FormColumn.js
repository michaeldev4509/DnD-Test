'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback } from 'react'
import FormField from './FormField'

export default function FormColumn({ column, onDeleteField, onAddField, dragHandleProps, setColumnRef }) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column: column,
    },
  })

  // Merge refs for both sortable (from parent) and droppable
  const setMergedRef = useCallback(
    (node) => {
      setDroppableRef(node)
      if (setColumnRef) {
        setColumnRef(node)
      }
    },
    [setDroppableRef, setColumnRef]
  )

  const fieldIds = column.fields.map((field) => field.id)

  return (
    <div
      ref={setMergedRef}
      className={`flex-1 min-w-0 p-4 border-2 rounded-lg transition-colors ${
        isOver
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      <div 
        {...dragHandleProps}
        className="mb-2 text-xs font-semibold text-gray-500 uppercase cursor-grab active:cursor-grabbing flex items-center gap-2"
      >
        <span>☰</span>
        <span>Column</span>
      </div>
      <div className="min-h-[100px]">
        {column.fields.length === 0 ? (
          <div className="text-center text-gray-400 py-8 border-2 border-dashed border-gray-300 rounded">
            <p className="text-sm">Drop fields here</p>
          </div>
        ) : (
          <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {column.fields.map((field, index) => (
                <FormField
                  key={field.id}
                  field={field}
                  index={index}
                  onDelete={onDeleteField}
                  isSortable={true}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
