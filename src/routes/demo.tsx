import { createFileRoute, Link } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BetaBadge } from '@/components/marketing/BetaBadge';
import { ExamQuestionVisual } from '@/components/dashboard/ExamQuestionVisual';
import { ACTION_ICONS, STANDARD_ACTIONS } from '@/components/simulation/ActionLegend';
import { DEMO_PRACTICE, DEMO_SIGNS, DEMO_SCENARIO } from '@/lib/demo';
import { cn } from '@/lib/utils';
import logo from '@/assets/drivable-logo.png';
import type { PracticeQuestion } from '@/data/dmv/practice-bank';
import '@/components/simulation/simulation-actions.css';

export const Route = createFileRoute('/demo')({
  head: () => ({ meta: [
    { title: 'Try Drivable | Free California Driving Demo' },
    { name: 'description', content: 'Try five California permit questions, road signs, a sample AI Coach explanation and a driving simulation without creating an account.' },
    { property: 'og:title', content: 'Try Drivable | Free California Driving Demo' },
    { property: 'og:description', content: 'Explore California permit practice, road signs, AI Coach and real driving decisions. No signup required.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ], links: [{ rel: 'canonical', href: 'https://mydrivable.com/demo' }] }),
  component: DemoPage,
});

function CreateAccount() {
  return <div className="mt-8 border-t border-border pt-6 text-center"><p className="text-sm text-muted-foreground">Like it? Create a free account to save your progress</p><Button asChild className="mt-4 h-12 rounded-full px-6"><Link to="/auth" search={{mode:'sign-up'}}>Create your account<ArrowRight /></Link></Button></div>;
}

function DemoPage() {
  return <div className="min-h-screen bg-background text-foreground">
    <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-5 sm:px-8"><Link to="/" className="flex items-center gap-2 font-display font-bold"><img src={logo} alt="" className="size-9 logo-mask" />Drivable</Link><div className="flex items-center gap-2"><Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button><Button asChild className="rounded-full"><Link to="/auth" search={{mode:'sign-up'}}>Get started</Link></Button></div></header>
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to Drivable</Link>
      <h1 className="mt-6 font-display text-3xl font-bold sm:text-5xl">Try Drivable, <span className="hero-serif-gradient">make the call.</span></h1>
      <p className="mt-4 text-muted-foreground">California · Demo · No account needed</p>
      <Tabs defaultValue="practice" className="mt-8">
        <TabsList aria-label="Demo features" className="grid h-auto w-full grid-cols-2 gap-1 bg-muted p-1 sm:grid-cols-5">
          <TabsTrigger value="practice" className="min-h-11 whitespace-normal">Practice test</TabsTrigger><TabsTrigger value="signs" className="min-h-11 whitespace-normal">Road signs</TabsTrigger><TabsTrigger value="coach" className="min-h-11">AI Coach</TabsTrigger><TabsTrigger value="simulation" className="min-h-11 gap-1 whitespace-normal">Driving simulation <BetaBadge /></TabsTrigger><TabsTrigger value="progress" className="min-h-11">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="practice"><QuestionDemo questions={DEMO_PRACTICE} /></TabsContent>
        <TabsContent value="signs"><QuestionDemo questions={DEMO_SIGNS} /></TabsContent>
        <TabsContent value="coach"><div className="mt-4 rounded-lg border border-border bg-card p-5 sm:p-8"><h2 className="font-display text-xl font-bold">Understand a missed question</h2><p className="mt-2 text-xs text-muted-foreground">Sample explanation</p><div className="mt-6 space-y-4 text-sm leading-relaxed"><p className="ml-auto max-w-md rounded-lg bg-primary/10 p-4">I chose “Go” at a solid green light while turning left. Why was it wrong?</p><div className="max-w-xl rounded-lg bg-muted p-4"><p className="font-semibold text-success">AI Coach</p><p className="mt-2">A solid green light is not a protected left turn. Yield to oncoming traffic and pedestrians, then turn when there is a safe gap. A green arrow is different: it gives you a protected turn in the arrow's direction.</p></div></div><CreateAccount /></div></TabsContent>
        <TabsContent value="simulation"><SimulationDemo /></TabsContent>
        <TabsContent value="progress"><div className="mt-4 rounded-lg border border-border bg-card p-5 sm:p-8"><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-xl font-bold">Your preparation at a glance</h2><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Example</span></div><div className="mt-6 grid grid-cols-3 gap-3">{[{label:'Best score',value:'89%'},{label:'Last score',value:'83%'},{label:'Attempts',value:'4'}].map(s => <div key={s.label} className="rounded-lg bg-muted p-3 text-center"><p className="font-display text-2xl font-bold text-progress-text">{s.value}</p><p className="mt-1 text-xs text-muted-foreground">{s.label}</p></div>)}</div><h3 className="mt-8 font-semibold">By topic</h3><div className="mt-4 space-y-5">{[{title:'Road signs',score:94},{title:'Right of way',score:68},{title:'Speed limits',score:75}].map(t => <div key={t.title}><div className="flex justify-between gap-3 text-sm"><span>{t.title} {t.score<80 && <span className="ml-1 text-marketing-amber">Needs work</span>}</span><span>{t.score}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-progress" style={{width:`${t.score}%`}} /></div></div>)}</div><CreateAccount /></div></TabsContent>
      </Tabs>
    </main>
  </div>;
}

function QuestionDemo({questions}: {questions: readonly PracticeQuestion[]}) {
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<number[]>([]);
  const [done,setDone]=useState(false);
  const q=questions[index];
  const chosen=answers[index];
  const score=answers.filter((a,i) => a===questions[i]?.correct).length;
  if (!q) return null;
  return <div className="mt-4 rounded-lg border border-border bg-card p-5 sm:p-8">
    {done ? <><h2 className="font-display text-2xl font-bold">{score} of {questions.length} correct</h2><Button variant="secondary" className="mt-6" onClick={() => {setIndex(0);setAnswers([]);setDone(false);}}><RotateCcw />Try again</Button></> : <>
      <p className="text-xs font-semibold text-muted-foreground">California · {index+1} / {questions.length}</p><div className="mt-3 h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-progress" style={{width:`${(index+1)/questions.length*100}%`}} /></div>
      <div className="mt-5 flex justify-center"><ExamQuestionVisual question={q} /></div><h2 className="mt-4 font-display text-xl font-semibold leading-relaxed">{q.q}</h2>
      <div className="mt-5 grid gap-3">{q.options.map((answer,i) => <Button key={answer} variant="outline" disabled={chosen!==undefined} onClick={() => setAnswers(a => [...a,i])} className={cn('h-auto min-h-12 justify-start whitespace-normal rounded-lg px-4 py-3 text-left disabled:opacity-100',chosen!==undefined && i===q.correct && 'border-success bg-success/10 text-success',chosen===i && i!==q.correct && 'border-destructive bg-destructive/10 text-destructive')}><span className="mr-2 shrink-0 text-muted-foreground">{i+1}</span>{answer}{chosen!==undefined && i===q.correct && <Check className="ml-auto shrink-0" />}</Button>)}</div>
      {chosen!==undefined && <div role="status" className="mt-5"><p className={cn('font-semibold',chosen===q.correct ? 'text-success':'text-destructive')}>{chosen===q.correct ? 'Correct':'Incorrect'}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{q.explanation}</p><div className="mt-5 flex justify-end"><Button onClick={() => index===questions.length-1 ? setDone(true):setIndex(index+1)}>{index===questions.length-1 ? 'See results':'Next question'}<ArrowRight /></Button></div></div>}
    </>}
    <CreateAccount />
  </div>;
}

function SimulationDemo() {
  const clip=DEMO_SCENARIO;
  const video=useRef<HTMLVideoElement>(null);
  const [phase,setPhase]=useState<'ready'|'playing'|'decision'|'feedback'>('ready');
  const [chosen,setChosen]=useState<string|null>(null);
  const [error,setError]=useState(false);
  const start=() => { setChosen(null);setError(false);setPhase('playing');const el=video.current;if(el){el.currentTime=0;void el.play().catch(() => setPhase('ready'));} };
  const freeze=() => {video.current?.pause();setPhase(p => p==='playing' ? 'decision':p);};
  if(!clip)return null;
  return <div className="mt-4 rounded-lg border border-border bg-card p-5 sm:p-8"><h2 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold">{clip.title}<BetaBadge /></h2><p className="mt-2 text-sm text-muted-foreground">{clip.subtitle}</p><div className="relative mt-5 aspect-video overflow-hidden rounded-lg bg-muted"><video ref={video} src={clip.videoUrl} muted playsInline preload="auto" className="h-full w-full object-cover" onTimeUpdate={e => {if(phase==='playing' && e.currentTarget.currentTime>=clip.pauseAt)freeze();}} onEnded={freeze} onError={() => setError(true)} /><span className="absolute left-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold">{clip.intent}</span></div>
    {error ? <p role="alert" className="mt-4 text-destructive">Unable to load this clip. <Button variant="link" onClick={() => {video.current?.load();start();}}>Retry</Button></p> : phase==='ready' ? <Button className="mt-5 h-12 w-full" onClick={start}><Play />Start scenario</Button>:phase==='playing' ? <p className="mt-5 text-sm text-muted-foreground">Watch the crosswalk…</p>:<>
      {phase==='decision' && <p className="mt-5 font-semibold">What do you do?</p>}<div className="mt-4 grid grid-cols-3 gap-3">{STANDARD_ACTIONS.map(a => {const Icon=ACTION_ICONS[a.id as keyof typeof ACTION_ICONS];return <Button key={a.id} aria-label={a.label} variant="outline" disabled={phase==='feedback'} data-action={a.id} onClick={() => {setChosen(a.id);setPhase('feedback');}} className="h-auto min-h-16 flex-col rounded-lg py-3">{Icon && <Icon className={cn('size-7',a.id==='go' ? 'text-marketing-green':a.id==='yield' ? 'text-marketing-amber':'text-marketing-red')} />}{a.label}</Button>;})}</div>
      {phase==='feedback' && <div role="status" className="mt-5"><p className={cn('font-semibold',chosen===clip.correctAction ? 'text-success':'text-destructive')}>{chosen===clip.correctAction ? 'Correct':'Incorrect · Correct answer: Stop'}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{clip.explanation}</p><Button variant="secondary" onClick={start} className="mt-4"><RotateCcw />Replay scenario</Button></div>}
    </>}
    <CreateAccount />
  </div>;
}