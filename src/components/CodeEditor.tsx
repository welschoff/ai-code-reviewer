'use client';

import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language: string;
}

export function CodeEditor({ code, onChange, language }: CodeEditorProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-[#1e1e1e]">
      <Editor
        height="400px"
        language={language.toLowerCase()}
        theme="vs-dark"
        value={code}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
