'use client'

import { useDraggable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Separate components to avoid conditional hook calls
function SortableFormField({ field, index, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field',
      field: field,
      index: index,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.2 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-300 rounded p-3 mb-2 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="flex-1 cursor-grab active:cursor-grabbing"
      >
        <div className="font-medium text-gray-800">{field.name}</div>
        {field.type && (
          <div className="text-xs text-gray-500 mt-1">{field.type}</div>
        )}
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(field.id)
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
          aria-label="Delete field"
        >
          ×
        </button>
      )}
    </div>
  )
}

function DraggableFormField({ field, index, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: field.id,
    data: {
      type: 'field',
      field: field,
      index: index,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.2 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-300 rounded p-3 mb-2 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="flex-1 cursor-grab active:cursor-grabbing"
      >
        <div className="font-medium text-gray-800">{field.name}</div>
        {field.type && (
          <div className="text-xs text-gray-500 mt-1">{field.type}</div>
        )}
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(field.id)
          }}
          className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
          aria-label="Delete field"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function FormField({ field, index, onDelete, isSortable = false }) {
  if (isSortable) {
    return <SortableFormField field={field} index={index} onDelete={onDelete} />
  }
  return <DraggableFormField field={field} index={index} onDelete={onDelete} />
}
