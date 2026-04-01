import React from 'react'

interface DebugInfoProps {
  data: any
  title?: string
}

const DebugInfo: React.FC<DebugInfoProps> = ({ data, title = '调试信息' }) => {
  return (
    <div className="mt-8 p-4 bg-[var(--bg-input)] rounded-lg border border-[var(--border-line)]">
      <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">{title}</h3>
      <pre className="text-sm bg-[var(--bg-card)] p-3 rounded border border-[var(--border-line)] overflow-auto text-[var(--text-secondary)]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default DebugInfo
