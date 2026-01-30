import { z } from 'zod'

export const ChapterSchema = z.object({
  chapter_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  content: z.string(),
  simple_explanation: z.string(),
  category: z.enum(['micro', 'macro', 'finance']),
  difficulty: z.number().int().min(1).max(5),
  order: z.number().int().min(0),
  examples: z.array(z.any()).default([]),
  related_charts: z.array(z.string()).default([]),
  is_published: z.boolean().default(false)
})

export const ChapterUpdateSchema = ChapterSchema.partial()

export type ChapterInput = z.infer<typeof ChapterSchema>
export type ChapterUpdateInput = z.infer<typeof ChapterUpdateSchema>
