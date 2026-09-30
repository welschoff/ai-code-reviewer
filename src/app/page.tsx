'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CodeEditor } from '@/components/CodeEditor';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShieldAlert, Loader2, Play } from 'lucide-react';

const INITIAL_CODE = `// Füge hier deinen Code für ein Security- & Quality-Review ein`;

export default function HomePage() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [language, setLanguage] = useState('typescript');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReview = async () => {
    if (!code.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();

      if (response.ok && data.id) {
        router.push(`/review/${data.id}`);
      } else {
        alert(data.error || 'Fehler beim Erstellen des Reviews.');
      }
    } catch (err) {
      console.error(err);
      alert('Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-6">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              AI Code Reviewer & Security Linter
            </h1>
            <p className="text-slate-400 text-sm">
              Automatisiertes Security-Audit, Performance-Check und Refactoring
              mit KI.
            </p>
          </div>
        </div>

        {/* Editor Card */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-medium">
                Code Eingabe
              </CardTitle>
              <CardDescription className="text-slate-400">
                Wähle die Sprache und füge den zu prüfenden Code ein.
              </CardDescription>
            </div>

            {/* Sprachauswahl */}
            <Select
              value={language}
              onValueChange={(value) => {
                if (value !== null) setLanguage(value);
              }}
            >
              <SelectTrigger className="w-45 bg-slate-950 border-slate-700 text-slate-100">
                <SelectValue placeholder="Sprache" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>

          <CardContent className="space-y-4">
            <CodeEditor
              code={code}
              onChange={(val) => setCode(val || '')}
              language={language}
            />

            <div className="flex justify-end">
              <Button
                onClick={handleReview}
                disabled={loading || !code.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium min-w-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Code Prüfen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
