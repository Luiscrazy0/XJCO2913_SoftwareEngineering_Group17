import React from 'react'

interface DebugInfoProps {
  data: any
  title?: string
}

const DebugInfo: React.FC<DebugInfoProps> = ({ data, title = '调试信息' }) => {
  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <pre className="text-sm bg-white p-3 rounded border border-gray-200 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default DebugInfo