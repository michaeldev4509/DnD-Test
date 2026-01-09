'use client'

import FormRow from './FormRow'

export default function FormBuilder({
  formRows,
  onDeleteField,
  onAddColumn,
  onDeleteColumn,
  onDeleteRow,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        {formRows.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No rows yet. Start by adding a row.</p>
            <p className="text-sm text-gray-400">
              Drag fields from the sidebar to build your form
            </p>
          </div>
        ) : (
          <div>
            {formRows.map((row) => (
              <FormRow
                key={row.id}
                row={row}
                onDeleteField={onDeleteField}
                onAddColumn={onAddColumn}
                onDeleteColumn={onDeleteColumn}
                onDeleteRow={onDeleteRow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
