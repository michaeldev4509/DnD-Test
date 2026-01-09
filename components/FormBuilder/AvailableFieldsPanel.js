'use client'

import { useDroppable, useDndContext } from '@dnd-kit/core'
import FormField from './FormField'

export default function AvailableFieldsPanel({ fields, onDeleteField }) {
  const { active } = useDndContext()
  const { setNodeRef, isOver } = useDroppable({
    id: 'available-fields',
  })

  // Only highlight when dragging a field (not columns or rows)
  const isDraggingField = active && (
    active.data.current?.type === 'field' ||
    active.data.current?.field ||
    (typeof active.id === 'string' && active.id.startsWith('available-'))
  )
  const shouldHighlight = isOver && isDraggingField

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Available Fields</h2>
        <p className="text-sm text-gray-400 mt-1">
          Drag fields to the form builder
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-4 transition-colors ${
          shouldHighlight ? 'bg-gray-700' : ''
        }`}
      >
        {fields.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No available fields</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                field={field}
                index={index}
                onDelete={null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
