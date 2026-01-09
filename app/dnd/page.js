'use client'

import { useState, useMemo } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import AvailableFieldsPanel from '@/components/FormBuilder/AvailableFieldsPanel'
import FormBuilder from '@/components/FormBuilder/FormBuilder'

// Initial field names from user's list
const INITIAL_FIELD_NAMES = [
  'AGA Herd Book?',
  'Alternate Idents',
  'Required',
  'Ancestral Code Enhancer',
  'Animal Breed Information',
  'Animal By AI ET Information',
  'Animal Main Pedigree Certificate Name',
  'Animal Pedigree Certificate Name',
  'Animal Status',
  'Brand',
  'Brand Location',
  'Breeder Description',
  'Colour 2',
  'Height Recorded?',
  'Horn Status',
  'Owner Description',
  'PH No. Location',
  'POIS',
  'POMS',
  'Subregister',
  'Tattoo Enhancer',
  'Test Label',
  'Template Add Animal Form Dup 3',
  'Default Form Create - Animal',
  'auto-generated',
  'By ET',
  'BreedPercents',
]

// Helper function to generate unique IDs
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export default function DnD() {
  // Initialize available fields
  const [availableFields, setAvailableFields] = useState(
    INITIAL_FIELD_NAMES.map((name, index) => ({
      id: `available-${index}`,
      name: name,
      type: 'text', // Default type, can be customized later
    }))
  )

  // Initialize form structure with one empty row and one column
  const [formRows, setFormRows] = useState([
    {
      id: generateId(),
      columns: [
        {
          id: generateId(),
          fields: [],
        },
      ],
    },
  ])

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Find field by ID across available fields and form
  const findFieldById = (fieldId) => {
    // Check available fields
    const availableField = availableFields.find((f) => f.id === fieldId)
    if (availableField) return { ...availableField, source: 'available' }

    // Check form fields
    for (const row of formRows) {
      for (const column of row.columns) {
        const field = column.fields.find((f) => f.id === fieldId)
        if (field) {
          return {
            ...field,
            source: 'form',
            rowId: row.id,
            columnId: column.id,
          }
        }
      }
    }
    return null
  }

  // Remove field from its current location
  const removeFieldFromLocation = (fieldId, rowId, columnId) => {
    setFormRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            columns: row.columns.map((col) => {
              if (col.id === columnId) {
                return {
                  ...col,
                  fields: col.fields.filter((f) => f.id !== fieldId),
                }
              }
              return col
            }),
          }
        }
        return row
      })
    )
  }

  // Add field to a column at a specific position
  const addFieldToColumn = (field, rowId, columnId, preserveId = false, insertAfterId = null) => {
    setFormRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            columns: row.columns.map((col) => {
              if (col.id === columnId) {
                const fieldToAdd = preserveId
                  ? { ...field }
                  : { ...field, id: generateId() }
                
                if (insertAfterId !== null) {
                  // Insert at specific position
                  const insertIndex = col.fields.findIndex((f) => f.id === insertAfterId)
                  if (insertIndex !== -1) {
                    const newFields = [...col.fields]
                    newFields.splice(insertIndex + 1, 0, fieldToAdd)
                    return {
                      ...col,
                      fields: newFields,
                    }
                  }
                }
                
                // Add to end by default
                return {
                  ...col,
                  fields: [...col.fields, fieldToAdd],
                }
              }
              return col
            }),
          }
        }
        return row
      })
    )
  }

  // Reorder fields within a column
  const reorderFieldsInColumn = (rowId, columnId, activeId, overId) => {
    setFormRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            columns: row.columns.map((col) => {
              if (col.id === columnId) {
                const oldIndex = col.fields.findIndex((f) => f.id === activeId)
                const newIndex = col.fields.findIndex((f) => f.id === overId)

                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                  // Use arrayMove utility from @dnd-kit/sortable for proper reordering
                  return {
                    ...col,
                    fields: arrayMove(col.fields, oldIndex, newIndex),
                  }
                }

                return col
              }
              return col
            }),
          }
        }
        return row
      })
    )
  }

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Check if dragging to reorder within the same column (both IDs are field IDs)
    const activeField = findFieldById(activeId)
    const overField = findFieldById(overId)

    // If both are fields in the same column, reorder them
    if (
      activeField?.source === 'form' &&
      overField?.source === 'form' &&
      activeField.columnId === overField.columnId
    ) {
      reorderFieldsInColumn(activeField.rowId, activeField.columnId, activeId, overId)
      return
    }

    // Get the field being dragged
    const field = findFieldById(activeId)
    if (!field) return

    // If dragging to available fields panel (returning a field)
    if (overId === 'available-fields') {
      if (field.source === 'form') {
        // Remove from form and add back to available fields
        removeFieldFromLocation(activeId, field.rowId, field.columnId)
        // Extract only the original field properties (exclude source, rowId, columnId)
        const { source, rowId, columnId, ...fieldData } = field
        setAvailableFields((prev) => [...prev, { ...fieldData, id: generateId() }])
      }
      return
    }

    // If dragging to a column or onto a field in a different column
    if (field.source === 'form') {
      // Check if dropping on another field in a different column
      if (overField?.source === 'form' && overField.columnId !== field.columnId) {
        // Moving to a different column at a specific position
        removeFieldFromLocation(activeId, field.rowId, field.columnId)
        addFieldToColumn(field, overField.rowId, overField.columnId, true, overId)
        return
      }

      // Moving to a column (not a field)
      const targetColumn = formRows
        .flatMap((row) => row.columns)
        .find((col) => col.id === overId)

      if (targetColumn && field.columnId !== overId) {
        // Remove from old location
        removeFieldFromLocation(activeId, field.rowId, field.columnId)
        // Add to new location (preserve ID when moving within form)
        const rowId = formRows.find((row) =>
          row.columns.some((col) => col.id === overId)
        )?.id
        if (rowId) {
          addFieldToColumn(field, rowId, overId, true)
        }
      }
    } else if (field.source === 'available') {
      // Check if dropping on a field (insert at that position)
      if (overField?.source === 'form') {
        addFieldToColumn(field, overField.rowId, overField.columnId, false, overId)
        setAvailableFields((prev) => prev.filter((f) => f.id !== activeId))
        return
      }

      // Adding new field from available fields to a column
      const targetColumn = formRows
        .flatMap((row) => row.columns)
        .find((col) => col.id === overId)

      if (targetColumn) {
        const rowId = formRows.find((row) =>
          row.columns.some((col) => col.id === overId)
        )?.id
        if (rowId) {
          addFieldToColumn(field, rowId, overId)
          // Remove from available fields
          setAvailableFields((prev) => prev.filter((f) => f.id !== activeId))
        }
      }
    }
  }

  // Add a new row
  const handleAddRow = () => {
    setFormRows((prev) => [
      ...prev,
      {
        id: generateId(),
        columns: [
          {
            id: generateId(),
            fields: [],
          },
        ],
      },
    ])
  }

  // Add a column to a row
  const handleAddColumn = (rowId) => {
    setFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            columns: [
              ...row.columns,
              {
                id: generateId(),
                fields: [],
              },
            ],
          }
        }
        return row
      })
    )
  }

  // Delete a column
  const handleDeleteColumn = (rowId, columnId) => {
    setFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedColumns = row.columns.filter((col) => col.id !== columnId)
          // Ensure at least one column remains
          if (updatedColumns.length > 0) {
            return {
              ...row,
              columns: updatedColumns,
            }
          }
        }
        return row
      })
    )
  }

  // Delete a row
  const handleDeleteRow = (rowId) => {
    setFormRows((prev) => {
      const updated = prev.filter((row) => row.id !== rowId)
      // Ensure at least one row remains
      if (updated.length === 0) {
        return [
          {
            id: generateId(),
            columns: [
              {
                id: generateId(),
                fields: [],
              },
            ],
          },
        ]
      }
      return updated
    })
  }

  // Delete a field from form (return to available)
  const handleDeleteField = (fieldId) => {
    const field = findFieldById(fieldId)
    if (field && field.source === 'form') {
      removeFieldFromLocation(fieldId, field.rowId, field.columnId)
      // Extract only the original field properties (exclude source, rowId, columnId)
      const { source, rowId, columnId, ...fieldData } = field
      setAvailableFields((prev) => [...prev, { ...fieldData, id: generateId() }])
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Drag & Drop Form Builder</h1>
        <button
          onClick={handleAddRow}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Row
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          <AvailableFieldsPanel
            fields={availableFields}
            onDeleteField={handleDeleteField}
          />
          <FormBuilder
            formRows={formRows}
            onDeleteField={handleDeleteField}
            onAddColumn={handleAddColumn}
            onDeleteColumn={handleDeleteColumn}
            onDeleteRow={handleDeleteRow}
          />
        </div>
      </DndContext>
    </div>
  )
}
