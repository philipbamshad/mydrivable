import {z} from 'zod';
export const studyAnswerSchema=z.object({id:z.string().uuid(),version:z.number().int().nonnegative(),answer:z.number().int().min(0).max(3).optional(),steps:z.array(z.object({action:z.enum(['go','yield','stop']).nullable(),elapsed:z.number().min(0).max(86400000)})).min(1).max(2).optional(),timed:z.boolean().optional()});
