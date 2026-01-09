'use client'

import FormColumn from './FormColumn'

export default function FormRow({ row, onDeleteField, onAddColumn, onDeleteColumn, onDeleteRow }) {
  return (
    <div className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm">
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
      <div className="p-4 flex gap-4">
        {row.columns.map((column) => (
          <div key={column.id} className="flex-1 flex flex-col relative group">
            <FormColumn
              column={column}
              onDeleteField={onDeleteField}
              onAddField={onAddColumn}
            />
            {row.columns.length > 1 && (
              <button
                onClick={() => onDeleteColumn(row.id, column.id)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                aria-label="Delete column"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
