import { createServerFn } from '@tanstack/react-start';
import { waitlistSchema } from './waitlist';

/** Retired endpoint: old clients cannot collect emails or trigger waitlist sends. */
export const joinWaitlist = createServerFn({ method: 'POST' }).inputValidator(waitlistSchema).handler(async (): Promise<{ result: 'joined' | 'duplicate' }> => {
  throw new Error('Drivable is open. Create an account to start practicing.');
});
