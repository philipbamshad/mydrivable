import { expect, it } from 'vitest';
import { DEMO_PRACTICE, DEMO_SIGNS, DEMO_SCENARIO, demoAnswerCorrect, setupReady } from './public-demo';
it('offers exactly five real California permit questions',()=>{
  expect(DEMO_PRACTICE).toHaveLength(5);
  for(const q of DEMO_PRACTICE) {expect(q.explanation.length).toBeGreaterThan(0);expect(demoAnswerCorrect(q,q.correct)).toBe(true);expect(demoAnswerCorrect(q,(q.correct+1)%q.options.length)).toBe(false);}
});
it('offers exactly five existing visual sign questions',()=>{expect(DEMO_SIGNS).toHaveLength(5);for(const q of DEMO_SIGNS)expect(q.sign).toBeDefined();});
it('offers one existing Stop scenario at its authored freeze point',()=>{expect(DEMO_SCENARIO?.id).toBe('pedestrian-crosswalk');expect(DEMO_SCENARIO?.steps).toEqual(['stop']);expect(DEMO_SCENARIO?.pauseAt).toBe(1);});
it('setup needs a state and confirmed completion without age',()=>{expect(setupReady('California',true)).toBe(true);expect(setupReady('',true)).toBe(false);expect(setupReady('California',false)).toBe(false);});
