'use client'

import { useState, useMemo } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import AvailableFieldsPanel from '@/components/FormBuilder/AvailableFieldsPanel'
import FormBuilder from '@/components/FormBuilder/FormBuilder'
import FormField from '@/components/FormBuilder/FormField'

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

  // Track active drag item for DragOverlay
  const [activeId, setActiveId] = useState(null)
  const [activeItem, setActiveItem] = useState(null)

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Find column by ID
  const findColumnById = (columnId) => {
    for (const row of formRows) {
      const column = row.columns.find((col) => col.id === columnId)
      if (column) {
        return {
          ...column,
          rowId: row.id,
        }
      }
    }
    return null
  }

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

  // Move column from one row to another
  const moveColumnBetweenRows = (sourceRowId, targetRowId, columnId, insertAfterColumnId = null) => {
    setFormRows((prevRows) => {
      let columnToMove = null
      
      // First, find and remove the column from source row
      const rowsWithoutColumn = prevRows.map((row) => {
        if (row.id === sourceRowId) {
          const columnIndex = row.columns.findIndex((col) => col.id === columnId)
          if (columnIndex !== -1) {
            columnToMove = row.columns[columnIndex]
            return {
              ...row,
              columns: row.columns.filter((col) => col.id !== columnId),
            }
          }
        }
        return row
      })

      if (!columnToMove) return prevRows

      // Ensure at least one column remains in source row
      const updatedRows = rowsWithoutColumn.map((row) => {
        if (row.id === sourceRowId && row.columns.length === 0) {
          return {
            ...row,
            columns: [
              {
                id: generateId(),
                fields: [],
              },
            ],
          }
        }
        return row
      })

      // Add column to target row
      return updatedRows.map((row) => {
        if (row.id === targetRowId) {
          if (insertAfterColumnId !== null) {
            // Insert at specific position
            const insertIndex = row.columns.findIndex((col) => col.id === insertAfterColumnId)
            if (insertIndex !== -1) {
              const newColumns = [...row.columns]
              newColumns.splice(insertIndex + 1, 0, columnToMove)
              return {
                ...row,
                columns: newColumns,
              }
            }
          }
          // Add to end
          return {
            ...row,
            columns: [...row.columns, columnToMove],
          }
        }
        return row
      })
    })
  }

  // Reorder rows
  const reorderRows = (activeId, overId) => {
    setFormRows((prevRows) => {
      const oldIndex = prevRows.findIndex((row) => row.id === activeId)
      const newIndex = prevRows.findIndex((row) => row.id === overId)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        return arrayMove(prevRows, oldIndex, newIndex)
      }
      return prevRows
    })
  }

  // Reorder columns within a row
  const reorderColumnsInRow = (rowId, activeId, overId) => {
    setFormRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === rowId) {
          const oldIndex = row.columns.findIndex((col) => col.id === activeId)
          const newIndex = row.columns.findIndex((col) => col.id === overId)

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            // Use arrayMove utility from @dnd-kit/sortable for proper reordering
            return {
              ...row,
              columns: arrayMove(row.columns, oldIndex, newIndex),
            }
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

  // Find row by ID (handles both row.id and row-{rowId} formats)
  const findRowById = (id) => {
    // Check if it's the droppable format (row-{rowId})
    if (typeof id === 'string' && id.startsWith('row-')) {
      const rowId = id.replace('row-', '')
      return formRows.find((row) => row.id === rowId) || null
    }
    // Otherwise, treat as direct row ID
    return formRows.find((row) => row.id === id) || null
  }

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event
    setActiveId(active.id)
    
    // Find the item being dragged to render in overlay
    const field = findFieldById(active.id)
    const column = findColumnById(active.id)
    const row = findRowById(active.id)
    
    if (field) {
      setActiveItem({ type: 'field', item: field })
    } else if (column) {
      setActiveItem({ type: 'column', item: column })
    } else if (row) {
      setActiveItem({ type: 'row', item: row })
    }
  }

  // Handle drag cancel/end
  const handleDragCancel = () => {
    setActiveId(null)
    setActiveItem(null)
  }

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event

    setActiveId(null)
    setActiveItem(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Check if dragging rows first (before checking columns/fields)
    // Active should be a row ID (from SortableRow)
    const activeRow = findRowById(activeId)
    
    if (activeRow) {
      // If dragging a row, check what we're dropping on
      // Over could be a row ID, row droppable ID (row-{rowId}), or a column/field
      let overRow = findRowById(overId)
      
      // If overId is a column or field, find the row it belongs to
      if (!overRow) {
        const overColumn = findColumnById(overId)
        if (overColumn) {
          overRow = findRowById(overColumn.rowId)
        } else {
          const overField = findFieldById(overId)
          if (overField?.source === 'form') {
            overRow = findRowById(overField.rowId)
          }
        }
      }
      
      if (overRow) {
        // Dropping on another row - reorder
        const activeRowId = activeRow.id
        const overRowId = overRow.id
        
        if (activeRowId !== overRowId) {
          reorderRows(activeRowId, overRowId)
          return
        }
      }
      // If can't find a valid target row, cancel the drag
      return
    }

    // Check if dragging columns
    const activeColumn = findColumnById(activeId)
    const overColumn = findColumnById(overId)

    if (activeColumn) {
      // Check if dropping on a row (row droppable ID format: "row-{rowId}")
      if (overId.startsWith('row-')) {
        const targetRowId = overId.replace('row-', '')
        if (targetRowId !== activeColumn.rowId) {
          // Move column to target row (at the end)
          moveColumnBetweenRows(activeColumn.rowId, targetRowId, activeId)
          return
        }
      }
      
      // If both are columns
      if (overColumn) {
        // Same row: reorder within row
        if (activeColumn.rowId === overColumn.rowId) {
          reorderColumnsInRow(activeColumn.rowId, activeId, overId)
          return
        }
        // Different row: move column to target row at target position
        else {
          moveColumnBetweenRows(activeColumn.rowId, overColumn.rowId, activeId, overId)
          return
        }
      }
      // If dragging column over a field (in a different row), move column to that field's row
      else {
        const overField = findFieldById(overId)
        if (overField?.source === 'form' && overField.rowId !== activeColumn.rowId) {
          // Move column to the row containing the field, after the field's column
          moveColumnBetweenRows(activeColumn.rowId, overField.rowId, activeId, overField.columnId)
          return
        }
      }
    }

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
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
        <DragOverlay>
          {activeItem ? (
            <>
              {activeItem.type === 'field' && (
                <div className="bg-white border border-gray-300 rounded p-3 shadow-2xl w-64 rotate-2">
                  <div className="font-medium text-gray-800">{activeItem.item.name}</div>
                  {activeItem.item.type && (
                    <div className="text-xs text-gray-500 mt-1">{activeItem.item.type}</div>
                  )}
                </div>
              )}
              {activeItem.type === 'column' && (
                <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-2xl w-64 rotate-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                    <span>☰</span>
                    <span>Column</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {activeItem.item.fields?.length || 0} field(s)
                  </div>
                </div>
              )}
              {activeItem.type === 'row' && (
                <div className="bg-white border border-gray-200 rounded-lg shadow-2xl p-4 min-w-[400px] rotate-1">
                  <div className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <span>☰</span>
                    <span>Row {activeItem.item.id.slice(-4)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {activeItem.item.columns?.length || 0} column(s)
                  </div>
                </div>
              )}
            </>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
