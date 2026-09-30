'use client';

import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  originalCode: string;
  fixedCode: string;
  language: string;
}

export function DiffViewer({
  originalCode,
  fixedCode,
  language,
}: DiffViewerProps) {
  return (
    <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#1e1e1e] shadow-md">
      <DiffEditor
        height="450px"
        language={language.toLowerCase()}
        theme="vs-dark"
        original={originalCode}
        modified={fixedCode}
        options={{
          readOnly: true,
          renderSideBySide: true, // Side-by-Side Ansicht für Vorher/Nachher
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
