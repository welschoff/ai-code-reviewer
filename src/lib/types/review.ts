import { z } from 'zod';

export const IssueSchema = z.object({
  severity: z
    .enum(['critical', 'warning', 'info'])
    .describe('Schweregrad des Problems'),
  category: z
    .enum(['security', 'performance', 'clean-code', 'bug'])
    .describe('Kategorie des Fehlers'),
  title: z.string().describe('Kurzer prägnanter Titel des Problems'),
  description: z
    .string()
    .describe('Genaue Erklärung, warum das ein Problem ist'),
  lineStart: z
    .number()
    .nullable()
    .describe(
      'Zeilennummer, wo das Problem beginnt (oder null, falls nicht zuordnungsbar)',
    ),
  lineEnd: z
    .number()
    .nullable()
    .describe('Zeilennummer, wo das Problem endet (oder null)'),
});

export const ReviewResultSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe('Gesamt-Score des Codes von 0 bis 100'),
  summary: z.string().describe('1-2 Sätze Zusammenfassung der Code-Qualität'),
  originalCode: z.string(),
  fixedCode: z
    .string()
    .describe('Der vollständig korrigierte, direkt nutzbare Code'),
  issues: z.array(IssueSchema).describe('Liste aller gefundenen Probleme'),
});

export type Issue = z.infer<typeof IssueSchema>;
export type ReviewResult = z.infer<typeof ReviewResultSchema>;
