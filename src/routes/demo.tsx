import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BetaBadge } from '@/components/marketing/BetaBadge';
import { CoachChat, DEMO_CARD, DEMO_TAB, DEMO_TAB_LIST, QuestionCard, ScenarioPlayer } from '@/components/demo/DemoPlayers';
import { DEMO_COACH, DEMO_PRACTICE, DEMO_SCENARIOS, DEMO_SCENARIO_QUESTIONS, DEMO_SIGNS, type DemoQuestion } from '@/lib/demo';
import { completedDemoTabs, DEMO_COMPLETION_KEY, demoProgress, demoResults, untriedDemoTabs, type DemoTab, type ScoredDemoTab } from '@/lib/demo-results';
import logo from '@/assets/drivable-logo.png';
import '@/components/simulation/simulation-actions.css';

export const Route = createFileRoute('/demo')({
  head: () => ({ meta: [
    { title: 'Try Drivable | Free Driving Test Demo' },
    { name: 'description', content: 'Try permit practice questions, road signs, a sample AI Coach explanation and driving simulation scenarios without creating an account.' },
    { property: 'og:title', content: 'Try Drivable | Free Driving Test Demo' },
    { property: 'og:description', content: 'Explore permit practice, road signs, AI Coach and real driving decisions. No signup required.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ], links: [{ rel: 'canonical', href: 'https://mydrivable.com/demo' }] }),
  component: DemoPage,
});

const labels: Record<DemoTab, string> = { practice: 'Practice test', signs: 'Road signs', coach: 'AI Coach', simulation: 'Driving Sim', progress: 'Progress' };
const BANKS: Record<ScoredDemoTab, DemoQuestion[]> = { practice: DEMO_PRACTICE, signs: DEMO_SIGNS, coach: [DEMO_COACH], simulation: DEMO_SCENARIO_QUESTIONS };
const ANSWERS_KEY = 'drivable-demo-answers-v1';
type TabProps = { tab: ScoredDemoTab; completed: DemoTab[]; saved: number[]; onComplete: (tab: DemoTab, answers: number[]) => void; onTab: (tab: DemoTab) => void };

function CreateAccount({ text = 'Get full-length exams, every topic, and save your progress.' }: { text?: string }) {
  return <div className="mt-6 border-t border-border pt-5 text-center"><p className="mb-3 text-sm text-muted-foreground">{text}</p><Button asChild className="h-11 rounded-full px-6"><Link to="/auth" search={{mode:'sign-up'}}>Create your account<ArrowRight /></Link></Button></div>;
}
function OtherTabs({ completed, current, onTab }: { completed: DemoTab[]; current: DemoTab; onTab: (t: DemoTab) => void }) {
  const untried = untriedDemoTabs(completed, current);
  return untried.length ? <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">{untried.map(next => <Button key={next} variant="link" className="h-auto px-0 text-sm" onClick={() => onTab(next)}>Try {labels[next]}<ArrowRight className="size-3.5" /></Button>)}</div> : null;
}

function Results({ tab, completed, saved, onTab }: TabProps) {
  const result = demoResults(BANKS[tab], saved);
  return <div data-demo-results={tab} className="text-left">
    <p className="text-xs font-semibold text-primary">{labels[tab]} · Complete</p>
    <h2 className="mt-2 font-display text-2xl font-bold">You got {result.correct}/{result.total} Correct</h2>
    {result.missed.length > 0 && <section className="mt-5 space-y-4"><h3 className="font-semibold">Questions to revisit</h3>{result.missed.map(({question,chosen},index) => <div key={index} className="border-t border-border pt-3"><p className="font-semibold">{question.q}</p><p className="mt-1 text-sm text-destructive">{chosen === undefined ? 'No answer' : `You chose: ${question.options[chosen]}`}</p><p className="mt-1 text-sm text-success">Correct answer: {question.options[question.correct]}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{question.explanation}</p></div>)}</section>}
    <CreateAccount />
    <OtherTabs completed={completed} current={tab} onTab={onTab} />
  </div>;
}

function SequenceDemo(props: TabProps) {
  const items = BANKS[props.tab];
  const [index,setIndex] = useState(0);
  const [answers,setAnswers] = useState<number[]>([]);
  if (props.completed.includes(props.tab)) return <Results {...props} />;
  const chosen = answers[index];
  const last = index === items.length - 1;
  const record = (i: number) => setAnswers(a => a[index] === undefined ? [...a.slice(0,index), i] : a);
  const scenario = props.tab === 'simulation' ? DEMO_SCENARIOS[index] : undefined;
  const q = items[index];
  if (!q) return null;
  return <div>
    <p className="text-left text-xs font-semibold text-muted-foreground">{props.tab === 'simulation' ? 'Scenario' : 'Question'} {index+1} / {items.length}</p>
    <div className="mb-4 mt-2 h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-progress" style={{width:`${(index+1)/items.length*100}%`}} /></div>
    {scenario ? <ScenarioPlayer key={index} scenario={scenario} playFirst onAnswer={record} /> : <QuestionCard key={index} question={q} chosen={chosen} onAnswer={record} />}
    {chosen !== undefined && <div className="mt-4 flex justify-end"><Button onClick={() => last ? props.onComplete(props.tab, answers) : setIndex(index+1)}>{last ? 'See results' : props.tab === 'simulation' ? 'Next scenario' : 'Next question'}<ArrowRight /></Button></div>}
  </div>;
}

function CoachDemo(props: TabProps) {
  const [chosen,setChosen] = useState<number>();
  if (props.completed.includes('coach')) return <Results {...props} />;
  return <div><CoachChat question={DEMO_COACH} chosen={chosen} onAnswer={setChosen} />{chosen !== undefined && <div className="mt-4 flex justify-end"><Button onClick={() => props.onComplete('coach',[chosen])}>See results<ArrowRight /></Button></div>}</div>;
}

function ProgressDemo({ completed, records, onTab }: { completed: DemoTab[]; records: Partial<Record<DemoTab,number[]>>; onTab: (t: DemoTab) => void }) {
  const p = demoProgress(BANKS, records, completed);
  const footer = <CreateAccount text="Create a free account to save your progress and get a study plan for your test date" />;
  if (!p.scores.length) return <div className="text-center"><h2 className="font-display text-xl font-bold">Try a demo tab to see your progress here</h2><div className="mt-4 flex flex-wrap justify-center gap-2">{(Object.keys(BANKS) as ScoredDemoTab[]).map(t => <Button key={t} variant="outline" className="rounded-full" onClick={() => onTab(t)}>{labels[t]}</Button>)}</div>{footer}</div>;
  return <div className="text-left" data-demo-progress>
    <h2 className="font-display text-xl font-bold">Your demo progress</h2>
    <div className="mt-4 rounded-lg bg-muted p-4 text-center"><p className="font-display text-3xl font-bold text-progress-text">{p.accuracy}%</p><p className="mt-1 text-xs text-muted-foreground">Overall accuracy · {p.correct}/{p.total} correct</p></div>
    <h3 className="mt-6 font-semibold">By demo</h3>
    <div className="mt-3 space-y-4">{p.scores.map(s => <div key={s.tab}><div className="flex justify-between gap-3 text-sm"><span>{labels[s.tab]}</span><span>{s.correct}/{s.total} · {s.percent}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-progress" style={{width:`${s.percent}%`}} /></div></div>)}</div>
    <h3 className="mt-6 font-semibold">Topics to review</h3>
    {p.topics.length ? <ul className="mt-2 flex flex-wrap gap-2">{p.topics.map(t => <li key={t} className="rounded-full bg-marketing-amber/10 px-3 py-1 text-xs font-medium text-marketing-amber">{t}</li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">Nothing missed so far.</p>}
    <OtherTabs completed={completed} current="progress" onTab={onTab} />
    {footer}
  </div>;
}

function DemoPage() {
  const [active,setActive] = useState<DemoTab>('practice');
  const [completed,setCompleted] = useState<DemoTab[]>([]);
  const [records,setRecords] = useState<Partial<Record<DemoTab,number[]>>>({});
  useEffect(() => {
    try {
      setCompleted(completedDemoTabs(localStorage.getItem(DEMO_COMPLETION_KEY)).filter(t => t !== 'progress'));
      const raw: unknown = JSON.parse(localStorage.getItem(ANSWERS_KEY) ?? '{}');
      if(raw && typeof raw === 'object') setRecords(Object.fromEntries(Object.entries(raw).filter(([key,value]) => key in BANKS && Array.isArray(value) && value.every(a => Number.isInteger(a) && a >= 0 && a < 4))));
    } catch { /* Storage is optional for the public demo. */ }
  },[]);
  const complete = (tab: DemoTab, answers: number[]) => {
    const next = completed.includes(tab) ? completed : [...completed,tab];
    const nextRecords = {...records,[tab]:answers};
    setCompleted(next);setRecords(nextRecords);
    try {localStorage.setItem(DEMO_COMPLETION_KEY,JSON.stringify(next));localStorage.setItem(ANSWERS_KEY,JSON.stringify(nextRecords));} catch { /* Keep this run in memory. */ }
  };
  const props = (tab: ScoredDemoTab): TabProps => ({tab,completed,saved:records[tab] ?? [],onComplete:complete,onTab:setActive});
  return <div className="min-h-screen bg-background text-foreground">
    <header className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-5 sm:flex sm:justify-between sm:px-8"><Link to="/" className="flex min-w-0 items-center gap-2 font-display font-bold"><img src={logo} alt="" className="size-9 shrink-0 logo-mask" />Drivable</Link><div className="flex shrink-0 items-center gap-1"><Button asChild variant="ghost" className="px-2 sm:px-4"><Link to="/auth">Sign in</Link></Button><Button asChild className="rounded-full px-3 sm:px-4"><Link to="/auth" search={{mode:'sign-up'}}>Get started</Link></Button></div></header>
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />Back to Drivable</Link>
      <h1 className="mt-6 font-display text-3xl font-bold sm:text-5xl">Try Drivable, <span className="hero-serif-gradient">make the call.</span></h1>
      <p className="mt-4 text-muted-foreground">Demo · No account needed</p>
      <Tabs value={active} onValueChange={value => {if(value in labels)setActive(value as DemoTab);}} className="mt-8">
        <TabsList aria-label="Demo features" className={DEMO_TAB_LIST}>{(Object.keys(labels) as DemoTab[]).map(tab => <TabsTrigger key={tab} value={tab} className={DEMO_TAB}>{labels[tab]}{tab === 'simulation' && <BetaBadge />}{completed.includes(tab) && <Check aria-label="Completed" className="size-3.5 shrink-0 text-success" />}</TabsTrigger>)}</TabsList>
        {(['practice','signs','simulation'] as const).map(t => <TabsContent key={t} value={t} className={`mt-3 ${DEMO_CARD}`}><SequenceDemo {...props(t)} /></TabsContent>)}
        <TabsContent value="coach" className={`mt-3 ${DEMO_CARD}`}><CoachDemo {...props('coach')} /></TabsContent>
        <TabsContent value="progress" className={`mt-3 ${DEMO_CARD}`}><ProgressDemo completed={completed} records={records} onTab={setActive} /></TabsContent>
      </Tabs>
    </main>
  </div>;
}
