import {describe,it,expect} from 'vitest';
import {attemptAccess,simulationHistoryStats,type StudyAttempt} from './study-attempt';
describe('saved practice access',()=>{
  for(const feature of ['exam','signs','intersections','substances','speed','simulation']) {
    it(`${feature} reserves one free attempt and resumes before completion`,()=>{
      expect(attemptAccess(false)).toBe('start');
      expect(attemptAccess(false,{completed:false})).toBe('resume');
      expect(attemptAccess(false,{completed:true})).toBe('locked');
      expect(attemptAccess(true,{completed:true})).toBe('start');
    });
  }
  it('shows best accuracy across completed runs and latest reaction only',()=>{
    const rows=[{feature:'simulation',completed:true,score:80,average_reaction:1.1,created_at:'2026-11-01'},{feature:'simulation',completed:true,score:60,average_reaction:1.4,created_at:'2026-11-02'},{feature:'simulation',completed:false,score:100,average_reaction:0.1,created_at:'2026-11-03'}] as StudyAttempt[];
    expect(simulationHistoryStats(rows)).toEqual({best:80,reaction:1.4});
    expect(simulationHistoryStats([])).toEqual({best:null,reaction:null});
  });
});