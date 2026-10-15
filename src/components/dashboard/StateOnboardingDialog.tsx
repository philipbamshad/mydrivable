import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { US_STATES, useUserProfile } from "@/lib/user-profile";

/**
 * Blocking first-run step: learners must pick their state before any
 * practice questions are generated. Shown whenever the profile has loaded
 * and no state is saved.
 */
export function StateOnboardingDialog() {
  const { state, hydrating, setState } = useUserProfile();
  const [choice, setChoice] = useState("");
  const open = !hydrating && !state;

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Which state are you testing in?</DialogTitle>
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
        <DialogFooter>
          <Button className="w-full" disabled={!choice} onClick={() => setState(choice)}>
            Start studying
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
