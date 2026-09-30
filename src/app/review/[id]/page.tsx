'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ReviewResult, Issue } from '@/lib/types/review';
import { DiffViewer } from '@/components/DiffViewer';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewDetailsPage({ params }: ReviewPageProps) {
  const { id } = use(params);
  const [review, setReview] = useState<
    (ReviewResult & { language: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setError('Review konnte nicht gefunden werden.');
          return;
        }

        setReview({
          score: data.score,
          summary: data.summary,
          originalCode: data.original_code,
          fixedCode: data.fixed_code,
          issues: data.issues as Issue[],
          language: data.language,
        });
      } catch (err) {
        console.error(err);
        setError('Fehler beim Laden des Reviews.');
      } finally {
        setLoading(false);
      }
    }

    fetchReview();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-slate-400">Lade Review-Analyse...</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center space-y-4">
        <p className="text-red-400">{error || 'Review nicht gefunden.'}</p>
        <Link href="/">
          <Button variant="outline" className="border-slate-800 text-slate-200">
            <ArrowLeft className="w-4 h-4 mr-2" /> Zurück zum Editor
          </Button>
        </Link>
      </div>
    );
  }

  // Hilfsfunktion zur Darstellung der Schweregrade
  const getSeverityBadge = (severity: Issue['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
            <ShieldAlert className="w-3 h-3 mr-1" /> Kritisch
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" /> Warnung
          </Badge>
        );
      case 'info':
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Info className="w-3 h-3 mr-1" /> Hinweis
          </Badge>
        );
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Neues Review starten
            </Button>
          </Link>
          <span className="text-xs text-slate-500 font-mono">ID: {id}</span>
        </div>

        {/* Score & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Score Card */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
            <CardHeader className="p-0 mb-2">
              <CardDescription className="text-slate-400">
                Security & Quality Score
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div
                className={`text-5xl font-black ${review.score >= 80 ? 'text-emerald-400' : review.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
              >
                {review.score}
                <span className="text-2xl font-normal text-slate-500">
                  /100
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="bg-slate-900 border-slate-800 text-slate-100 md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Zusammenfassung der KI</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">{review.summary}</p>
            </CardContent>
          </Card>
        </div>

        {/* Code Diff Viewer */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Code-Vergleich (Original vs. Gefixt)
          </h2>
          <DiffViewer
            originalCode={review.originalCode}
            fixedCode={review.fixedCode}
            language={review.language}
          />
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Gefundene Probleme ({review.issues.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {review.issues.map((issue, idx) => (
              <Card
                key={idx}
                className="bg-slate-900 border-slate-800 text-slate-100"
              >
                <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(issue.severity)}
                      <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">
                        [{issue.category}]
                      </span>
                    </div>
                    <CardTitle className="text-base pt-1">
                      {issue.title}
                    </CardTitle>
                  </div>
                  {issue.lineStart && (
                    <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      Zeile {issue.lineStart}
                      {issue.lineEnd && issue.lineEnd !== issue.lineStart
                        ? `-${issue.lineEnd}`
                        : ''}
                    </span>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300">{issue.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
