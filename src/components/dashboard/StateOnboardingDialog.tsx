import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { US_STATES, useUserProfile } from "@/lib/user-profile";

/**
 * Blocking first-run step: learners must pick their state before any
 * practice questions are generated. Shown whenever the profile has loaded
 * and no state is saved.
 */
export function StateOnboardingDialog() {
  const { hydrating, onboardingCompleted, completeSetup } = useUserProfile();
  const [choice, setChoice] = useState("");
  const [date, setDate] = useState("");
  const [age, setAge] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = !hydrating && !onboardingCompleted;
  const save = async () => {
    if (!choice || !age || busy) return;
    setBusy(true); setError(null);
    try { await completeSetup(choice, date || null, age === "yes"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save setup."); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Set up your practice</DialogTitle>
          <DialogDescription>
            Your questions, speed limits, and passing score will match your state's DMV handbook. You can change this later in Settings.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="onboarding-state">State</Label>
          <Select value={choice} onValueChange={setChoice}>
            <SelectTrigger id="onboarding-state" className="h-11">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {US_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="onboarding-date">DMV test date (optional)</Label><Input id="onboarding-date" type="date" value={date} onChange={e => setDate(e.target.value)} /><Button variant="link" className="h-8 px-0" onClick={() => setDate("")}>Skip test date</Button></div>
        <div className="space-y-2"><Label htmlFor="onboarding-age">Are you under 18?</Label><Select value={age} onValueChange={setAge}><SelectTrigger id="onboarding-age"><SelectValue placeholder="Select an answer" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button className="w-full" disabled={!choice || !age || busy} onClick={() => void save()}>
            {busy ? "Setting up…" : "Start studying"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
