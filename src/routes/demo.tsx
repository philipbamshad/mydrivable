import { createFileRoute, Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Play, RotateCcw, Check, X, MessageSquare, ClipboardCheck, Signpost, Video, ChartNoAxesColumn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PublicNav } from '@/components/marketing/PublicNav';
import { BetaBadge } from '@/components/marketing/BetaBadge';
import { ExamQuestionVisual } from '@/components/dashboard/ExamQuestionVisual';
import { ACTION_ICONS, STANDARD_ACTIONS } from '@/components/simulation/ActionLegend';
import { DEMO_PRACTICE, DEMO_SIGNS, DEMO_SCENARIO, demoAnswerCorrect } from '@/lib/public-demo';
import type { PracticeQuestion } from '@/data/dmv/practice-bank';
import '@/components/dashboard/study-question.css';

export const Route = createFileRoute('/demo')({
  head:()=>({meta:[
    {title:'Try Drivable Free | California Practice Demo'},
    {name:'description',content:'Try five California permit questions, road signs, a sample AI tutor, driving simulation and example progress without signing up.'},
    {property:'og:title',content:'Try Drivable Free | California Practice Demo'},
    {property:'og:description',content:'Explore California permit practice and a real driving simulation. No account needed.'},
    {property:'og:type',content:'website'}, {name:'twitter:card',content:'summary_large_image'},
  ]}), component:Demo,
});
function SaveInvite() {
  return <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6"><p className="text-sm text-muted-foreground">Like it? Create a free account to save your progress</p><Button asChild className="rounded-full"><Link to="/auth" search={{mode:'sign-up'}}>Sign up free<ArrowRight className="h-4 w-4"/></Link></Button></div>;
}
function Demo() {
  const tabs=[{id:'practice',label:'Practice test',Icon:ClipboardCheck},{id:'signs',label:'Road signs',Icon:Signpost},{id:'tutor',label:'AI tutor',Icon:MessageSquare},{id:'simulation',label:'Driving simulation',Icon:Video},{id:'progress',label:'Progress',Icon:ChartNoAxesColumn}];
  return <div className="min-h-screen bg-background text-foreground"><PublicNav/><main className="mx-auto max-w-[960px] px-4 py-10 sm:px-8"><Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4"/>Back to Drivable</Link><h1 className="font-display text-3xl font-bold sm:text-4xl">Take Drivable for a spin.</h1><p className="mt-3 text-muted-foreground">California practice. No account required.</p><Tabs defaultValue="practice" className="mt-8"><TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 sm:grid-cols-5">{tabs.map(({id,label,Icon})=><TabsTrigger value={id} key={id} className="min-h-12 flex-wrap gap-2 whitespace-normal px-2 py-2 text-xs sm:text-sm"><Icon className="h-4 w-4"/>{label}{id==='simulation'&&<BetaBadge/>}</TabsTrigger>)}</TabsList>
    <TabsContent value="practice"><Quiz questions={DEMO_PRACTICE} title="Practice test"/></TabsContent>
    <TabsContent value="signs"><Quiz questions={DEMO_SIGNS} title="Road signs"/></TabsContent>
    <TabsContent value="tutor"><Tutor/></TabsContent>
    <TabsContent value="simulation"><SimulationDemo/></TabsContent>
    <TabsContent value="progress"><ProgressDemo/></TabsContent>
  </Tabs></main></div>;
}
function Quiz({questions,title}:{questions:PracticeQuestion[];title:string}) {
  const [index,setIndex]=useState(0),[choice,setChoice]=useState<number|null>(null),[correct,setCorrect]=useState(0);
  const question=questions[index];
  const choose=(answer:number)=>{if(choice!==null||!question)return;setChoice(answer);if(demoAnswerCorrect(question,answer))setCorrect(c=>c+1);};
  return <section aria-label={title} className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8">{question ? <>
    <div className="flex items-center justify-between gap-3 text-sm"><span className="font-medium">California · {index+1} / {questions.length}</span><span className="text-muted-foreground">{correct} correct</span></div><progress aria-label="Question progress" value={index} max={questions.length} className="mt-4 h-1.5 w-full accent-primary"/>
    <div className="my-5 flex justify-center"><ExamQuestionVisual question={question}/></div><h2 className="mb-5 font-display text-xl font-semibold leading-relaxed">{question.q}</h2>
    <div className="grid gap-3">{question.options.map((option,i)=><Button key={option} variant="outline" disabled={choice!==null} onClick={()=>choose(i)} className={`h-auto min-h-12 justify-start whitespace-normal px-4 py-3 text-left text-sm disabled:opacity-100 ${choice!==null&&i===question.correct?'border-success bg-success/10 text-foreground':choice===i?'border-destructive bg-destructive/10 text-foreground':''}`}><span className="mr-2 shrink-0 text-muted-foreground">{i+1}.</span>{option}{choice!==null&&i===question.correct?<Check className="ml-auto h-4 w-4 shrink-0 text-success"/>:choice===i?<X className="ml-auto h-4 w-4 shrink-0 text-destructive"/>:null}</Button>)}</div>
    {choice!==null&&<div role="status" className="mt-5"><p className={`font-semibold ${choice===question.correct?'text-success':'text-destructive'}`}>{choice===question.correct?'Correct':'Incorrect'}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{question.explanation}</p><Button className="mt-5 h-12 rounded-full" onClick={()=>{setIndex(i=>i+1);setChoice(null);}}>{index===questions.length-1?'See results':'Next question'}<ArrowRight className="h-4 w-4"/></Button></div>}
  </>:<><h2 className="font-display text-2xl font-bold">{correct} of {questions.length} correct</h2><Button variant="outline" className="mt-5" onClick={()=>{setIndex(0);setChoice(null);setCorrect(0);}}><RotateCcw className="h-4 w-4"/>Practice again</Button><SaveInvite/></>}</section>;
}
function Tutor() {
  const [shown,setShown]=useState(false);
  return <section className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8"><h2 className="font-display text-xl font-semibold">AI tutor</h2><p className="mt-2 text-xs text-muted-foreground">Sample conversation</p><div className="my-7 flex flex-col gap-5"><p className="ml-auto max-w-[90%] rounded-lg bg-primary/10 px-4 py-3 text-sm leading-relaxed">I chose “slow down” for a stop sign. Why was that wrong?</p>{shown?<div role="status" className="mr-auto max-w-[95%] rounded-lg bg-secondary px-4 py-4"><p className="mb-2 text-xs font-semibold text-primary">Drivable AI Coach</p><p className="text-sm leading-relaxed">A stop sign requires a complete stop—not just slowing down. Stop at the limit line. If there isn't one, stop before the crosswalk; if there's no crosswalk, stop before entering the intersection. Then yield to traffic and pedestrians before proceeding when it's safe.</p></div>:<Button className="mr-auto rounded-full" onClick={()=>setShown(true)}>Show explanation<ArrowRight className="h-4 w-4"/></Button>}</div>{shown&&<SaveInvite/>}</section>;
}
function SimulationDemo() {
  const video=useRef<HTMLVideoElement|null>(null);
  const [phase,setPhase]=useState<'ready'|'playing'|'decision'|'answered'>('ready');
  const [choice,setChoice]=useState<string|null>(null);
  const clip=DEMO_SCENARIO;
  if(!clip)return null;
  const play=async()=>{const el=video.current;if(!el)return;setChoice(null);el.currentTime=0;setPhase('playing');try{await el.play();}catch{setPhase('ready');}};
  return <section className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8"><h2 className="flex items-center gap-2 font-display text-xl font-semibold">Driving simulation <BetaBadge/></h2><p className="mt-2 text-xs text-muted-foreground">Simulations are in beta. More scenarios are coming soon.</p><div className="relative mt-5 aspect-video overflow-hidden rounded-lg bg-secondary"><video ref={video} src={clip.videoUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" onTimeUpdate={()=>{const el=video.current;if(phase==='playing'&&el&&el.currentTime>=clip.pauseAt){el.pause();el.currentTime=clip.pauseAt;setPhase('decision');}}} onEnded={()=>{if(phase==='playing')setPhase('decision');}}/><span className="absolute left-2 top-2 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">{clip.intent}</span>{phase==='ready'&&<div className="absolute inset-0 grid place-items-center"><Button onClick={()=>void play()} className="h-12 rounded-full"><Play className="h-4 w-4"/>Play scenario</Button></div>}{phase==='decision'&&<span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background text-sm font-bold">?</span>}</div><p className="mt-4 text-sm font-medium">{phase==='decision'?'What should you do?':clip.subtitle}</p><div className="mt-4 grid grid-cols-3 gap-2">{STANDARD_ACTIONS.map(action=>{const Icon=ACTION_ICONS[action.icon as keyof typeof ACTION_ICONS];return <Button key={action.id} variant="outline" disabled={phase!=='decision'} className="h-14 gap-2 rounded-lg" onClick={()=>{setChoice(action.id);setPhase('answered');}}><Icon className={`h-5 w-5 ${action.id==='go'?'text-success':action.id==='stop'?'text-destructive':'text-primary'}`}/>{action.label}</Button>;})}</div>{phase==='answered'&&<div role="status" className="mt-5"><p className={`font-semibold ${choice===clip.correctAction?'text-success':'text-destructive'}`}>{choice===clip.correctAction?'Correct':'Incorrect'} · Correct action: Stop</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{clip.explanation}</p><Button variant="outline" className="mt-4" onClick={()=>void play()}><RotateCcw className="h-4 w-4"/>Try again</Button><SaveInvite/></div>}</section>;
}
function ProgressDemo() {
  return <section className="mt-6 rounded-lg border border-border bg-card p-5 sm:p-8"><div className="flex items-center gap-3"><h2 className="font-display text-xl font-semibold">Your progress</h2><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">Example</span></div><div className="mt-7 grid grid-cols-3 gap-3">{[{label:'Best score',value:'89%'},{label:'Last score',value:'83%'},{label:'Attempts',value:'4'}].map(stat=><div key={stat.label} className="border-b border-border py-4"><p className="font-display text-2xl font-semibold">{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.label}</p></div>)}</div><h3 className="mt-8 font-semibold">By topic</h3><div className="mt-4 space-y-5">{[{label:'Road signs',score:92},{label:'Right of way',score:76},{label:'Speed limits',score:68}].map(row=><div key={row.label}><div className="flex justify-between gap-3 text-sm"><span>{row.label} {row.score<80&&<span className="ml-2 text-xs text-muted-foreground">Needs work</span>}</span><span>{row.score}%</span></div><progress aria-label={`${row.label} mastery`} value={row.score} max={100} className="mt-2 h-2 w-full accent-primary"/></div>)}</div><SaveInvite/></section>;
}
