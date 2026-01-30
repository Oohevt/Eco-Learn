import { z } from 'zod'

export const ProgressUpdateSchema = z.object({
  chapter_id: z.string(),
  completed: z.boolean().default(false),
  score: z.number().int().min(0).max(100).nullable().default(null)
})

export type ProgressUpdateInput = z.infer<typeof ProgressUpdateSchema>
