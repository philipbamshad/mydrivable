import { createServerFn } from '@tanstack/react-start';
import { waitlistSchema } from './waitlist';
/** Historical caller compatibility only: public registration replaced the waitlist. */
export const joinWaitlist = createServerFn({ method: 'POST' }).inputValidator(waitlistSchema)
  .handler(async (): Promise<{result:'joined'|'duplicate'}> => {
    throw new Error('Drivable is open. Sign up free to start practicing.');
  });
