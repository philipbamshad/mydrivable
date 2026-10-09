# Add a video to the Drivable site

Yes, you can. Since you skipped the follow-up, this plan uses the most likely setup: a short Drivable promo clip generated for you and shown on the landing page. You can swap in your own clip any time.

## What you'll see

A new "See Drivable in action" band on the homepage, sitting between the hero and the scrolling list of states:

- A rounded, white-framed video card, roughly 900px wide on desktop and full width on phones.
- The clip starts playing on its own, muted, looping quietly while the page is idle.
- A small sound button in the corner turns audio on and off.
- Below the clip, one short caption line and the existing "Get Started" pill so the video leads straight into sign-up.
- The clip fades in as you scroll to it, matching the way the feature cards already appear.

Nothing else on the page moves, and no existing section is restyled.

## How the clip is made

I generate a short (~6 second) promo clip for you with the built-in video generator: a clean, bright driving-lesson scene in Drivable's blue and orange palette, with the steering wheel logo held at the end. It is saved into the project as a normal site asset, so it loads with the rest of the site.

Two things worth knowing before I start:

- Generating video uses AI credits from your workspace balance. A 6 second clip at 1080p is the priciest single item we've added so far.
- Generation takes a couple of minutes. If you'd rather not spend credits, tell me and I'll build the video card empty so you can drop in an MP4 you already have.

## Swapping in your own video later

If you have a clip you made, upload the MP4 and I'll replace the generated one. Same card, same look. Anything up to about 10MB plays directly from the site; anything larger should be a YouTube or Vimeo link instead, which I'd embed the same way.

## Technical details

- New component `src/components/marketing/VideoShowcase.tsx`: a `<video>` with `autoPlay muted loop playsInline`, a poster frame, and a mute toggle. It uses the project's existing reveal-on-scroll observer and design tokens, no new dependencies.
- Generated asset saved at `src/assets/drivable-promo.mp4`, imported directly so Vite bundles it.
- Inserted in `src/routes/index.tsx` between `<Hero />` and `<StatesMarquee />`; no layout, routing, or copy changes elsewhere.
- Homepage metadata gains `og:video` and `twitter:player` pointing at the clip URL so shared links show the video, following the existing absolute-URL rule.
- Mobile: the card is capped at `92vw`, the toggle grows to a 44px tap target, and the clip stays muted-autoplay so iOS allows it.
- After building, I'll load the page in a browser, scroll to the section, and confirm the clip actually plays before reporting it done.
