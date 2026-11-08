# Research Notes — Video 05

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/AH_ugxmLeUM
- Title: "7 UI/UX mistakes that SCREAM you're a beginner"
- Creator: Kole Jain (individual product designer; same creator as video-01/video-04)
- Duration: 7:17 · Published: 2025-06-07 · Views: ~485.3k
- Classification: standalone listicle + live-redesign tutorial (not the course); earliest
  of his "beginner mistakes" series analyzed so far (predates video-04 by 3 months)
- Access: transcript (En auto-captions) + 20 frames viewed at 720p from full video
- Subject: redesigns a recipe app ("Tasty!" — onboarding allergy picker, home feed,
  recipe detail) mistake by mistake "until it looks polished and production ready";
  opens with a "TravelToday" travel landing page as a bad-design specimen
  (`t00m0m10`), plus a standalone chart-comparison bonus segment

## Structure (chapters verified in metadata)

0:00 Intro → 0:23 User Flow → 1:06 Overusing Effects → 1:55 Spacing →
2:48 Inconsistent Components → 3:34 Icons → 4:56 Redundant Elements →
5:32 Interactive Feedback → 6:22 Charts (bonus, unrelated to the recipe app) → 6:58 Outro.
No sponsor segment (none in transcript — confirmed).

## Teaching format

Numbered mistake chapters over a fast live redesign in Figma: before shot → zoomed panel
or overlay teaching the mechanics → after shot. Technique close-ups include a Figma Drop
shadow panel with exact values, a Type-details "Vertical trim" toggle, and pink/red grid &
spacing overlays over the mockups. Interspersed live-action B-roll: overhead shot of him
sketching phone boxes on grid paper (`t00m0m47`). Ends with a two-chart "which one is from
Dribbble" quiz and a CTA for the Figma file in the description.

## Lesson log

### L05-1 Plan the user flow before pixels: sketch it, and hunt for missing paths
- Problem [transcript 0:26–0:44]: allergy onboarding offers six preset chips (Peanuts,
  Eggs, Milk, Shellfish, Tofu, Wheat — `t00m0m30`) with no search for other allergens and
  no skip for users with no allergies. "These are things you will miss if you don't plan
  out your flow, but users, they'll feel it instantly."
- Decision: "even something as simple as sketching boxes on paper helps you catch major
  gaps early on" (0:46–0:49; B-roll frame `t00m0m47`). Then add the missing pieces: search
  bar (with filter icon) and "Skip →" — both present in the fixed screen by
  `t00m2m10`.
- Decision 2 (0:51–1:05): also check small touches — "a filter icon on the search bar or a
  save button up top go a long way" (`t00m0m55` home screen), because the "most commonly
  missed elements" are navigation links, hidden states, and dynamic interactions (button
  hovers, micro-interactions).
- Reasoning: not stated as a principle beyond "users feel it instantly" — he treats flow
  completeness as the root of perceived quality.
- Implementation: paper-box every screen and state first; then audit sketches for missing
  search/exit/empty paths before styling anything.
- Effect: fewer dead ends; the difference between demo and product.
- Fails: over-sketching edge cases for flows with one linear path.
- Transfer: any app — before styling, list each screen's entry conditions, exits, and
  "what if the user has nothing to pick?" (his allergy screen is literally that case).

### L05-2 Effects: gradients only in one hue (or none); shadows soft, tinted gray, or removed
- Problem [transcript 1:09–1:24]: "overusing them can make your designs feel cluttered
  and amateur." His CTA gradient is blue-and-green (`t00m1m21` — "Start exploring" button
  fading dark green→teal/blue); example gradient-heavy gauge shown in `t00m1m14`
  ("Monthly Goal" 85% ring in green→yellow).
- Decision: "If you really need a gradient, stick to variations of the same color, like a
  darker or lighter green" (1:25–1:29; `t00m1m28` shows the same button re-gradiented
  green→green) — "But honestly, this would look way cleaner with no gradient at all. And
  that's usually the case." Final fixed screen has a flat dark-green button
  (`t00m2m10`).
- Decision 2 (shadows, 1:35–1:50): "These Figma defaults are way too harsh. Instead of
  just lowering opacity, I change the entire shadow color, usually to a light gray, and
  increase the blur significantly. Or once again, remove the shadow completely."
- Evidence (exact recipe, verified in frame): `t00m1m41` shows the Figma Drop shadow panel:
  X 0, Y 3, Blur 30, Spread 0, Color D3D3D3 at 100% — applied to the "Need To Try" recipe
  cards beside it.
- Reasoning (explicit 1:51–1:54): "most of the time, less visual noise equals a better
  design."
- Implementation: gradient = same-hue lightness ramp at most, else solid; shadow =
  light-gray (not black), Y-offset small, blur 30, or none.
- Fails: dark-theme cards (a gray-tinted shadow behaves differently on dark surfaces —
  not covered here).
- Transfer: adoption-worthy because the values are explicit — copy the (0/3/30/D3D3D3)
  recipe as a default card shadow, then delete per surface.

### L05-3 Spacing: grid first, then breathe — auto layout with trim off for stacks
- Problem [transcript 1:56–1:59]: "Most beginner UIs are packed way too tight, like my old
  app design."
- Decision: two tools — (a) grids: "a three column grid for this screen and two column
  grid here with these measurements. Now, just align elements to the grid as closely as
  possible", allowing "if something needs to break the grid slightly... just leave it as
  is if it still feels balanced" (2:03–2:20; pink column bands over both screens in
  `t00m2m10`); (b) vertical spacing: "increase the vertical spacing to let things breathe
  and group naturally, especially on mobile screens, you'll need more space than you
  think" (2:21–2:28; spacing bands on the recipe-detail screen in `t00m2m24`).
- Decision 2 (2:29–2:44): for stacked content that is misaligned ("these cards and chips.
  The layouts are pretty wonky"), use auto layout with "vertical trim" turned OFF for
  pixel-perfect control (`t00m2m36` — Figma Type-details panel, cursor on the Vertical
  trim toggle, tooltip "Cap height to base[line]"), then repeat across the UI.
- Reasoning: consistent spacing is framed as the segue into the consistency mistake ("a
  perfect segue into the next mistake", 2:45).
- Implementation: column grid for macro alignment; spacing tokens for stacks; auto layout
  everywhere, trim off; mobile gets more spacing than feels necessary.
- Effect: elements "breathe and group naturally" — grouping via space, not lines.
- Fails: mechanical grid-hugging that fights optical balance — his own exception clause.
- Transfer: the "more space than you think" rule plus trim-off auto layout are directly
  portable to any design tool and to CSS (gap values, line-height trimming).

### L05-4 Consistency: one radius class per size tier; twin buttons must be identical
- Problem [transcript 2:52–3:07]: "all sorts of different corner radiuses" and components
  "like this back and skip button that are exactly the same but designed differently,
  which just makes the design feel amateur."
- Decision: (a) "make the two search bars identical other than the prompting text" (home
  "Search dishes" vs onboarding "Search Ingredients" — matched in `t00m3m14`); (b) "set
  the corner radius of all smaller components to be 10 pixels. This is an important one
  that most designers miss" (3:14–3:21); (c) match skip/back "in size, corner radius, and
  style" (3:21–3:26).
- Decision 2 (theme, 3:27–3:32): "Being consistent means using styles for colors, variables
  for measurements, and components for UI elements" — i.e., Figma styles/variables/
  components as the enforcement mechanism.
- Evidence: `t00m2m56` (three screens mid-fix, radii still varied) → `t00m3m14` (zoom:
  pills, chips, search bars sharing one radius family).
- Reasoning: "it's just so easy to fix" (2:53) — framed as pure-low-hanging amateur tell.
- Implementation: radius token per component class (small = 10px) instead of ad-hoc
  values; build twins as instances of one component.
- Fails: hero/feature cards that intentionally want a larger radius — the rule is scoped
  to "smaller components".
- Transfer: radius/spacing/color as named tokens synced to code (CSS variables) so design
  and implementation cannot drift.

### L05-5 Icons: add them for scannability, fix the family, label the ambiguous, allow controlled mixing
- Problem [transcript 3:36–3:57]: (a) "no icons on these cards, which forces users to read
  more and slows down the browsing process" (`t00m3m45` — pink highlight over bare
  "450 cals"/"Save" chips); (b) top-row icons "mismatched in fill, line width, and style"
  (`t00m4m00` — outline stars (Special) against filled cookie/coffee/utensils).
- Decision: add icons and "replace the save text" with a bookmark icon
  (`t00m4m00` cards); use ONE icon library — on Flaticon "select interface icons and then
  sort by stroke, width, and corner", download SVG (4:02–4:13, walkthrough unframed,
  transcript-only); in Figma he recommends Feather and Phosphor (4:15–4:18).
- Decision 2 (labels, 4:20–4:35): known glyphs (house, bookmark, user) need no labels;
  ambiguous ones get "a tool tip pop-up" for onboarding; "just try not to have bizarre
  icons everywhere."
- Decision 3 (pro tip, 4:36–4:55): "it is okay to have different styles of icons in the
  same design, but only if they're visually separate" — demonstrated with a specimen
  board: FOOD ICONS (outline), NAVBAR ICONS (outline), RECIPE ICONS (filled, dark green)
  in `t00m4m42`.
- Evidence: `t00m3m45`, `t00m4m00`, `t00m4m42`.
- Effect: browsing by recognition (icon + photo) instead of reading; family consistency
  reads as craft.
- Fails: mixing styles WITHIN one visual zone; icon-without-tooltip for novel glyphs.
- Transfer: an icon audit = presence (is there an icon where there's text?), family (one
  stroke/weight/corner), labeling (tooltip the non-universal), zoning (style may change
  across separated zones). Matches and extends L01-1's "one family" rule.

### L05-6 Redundant elements: delete anything that repeats a platform behavior
- Problem [transcript 4:57–5:29]: carousel affordances duplicated by native gestures —
  "we can get rid of this arrow since we'll be able to swipe on mobile" (the round green
  arrow chip on the Caesar Salad card in `t00m5m07`); plus strokes that add noise: "the
  stroke on these elements is really not needed."
- Decision: remove the redundant arrow(s) (gone in `t00m6m04`), rip out the strokes ("we'll
  just rip them straight out"), with a fallback: "If you are worried about contrast
  ratios, dimming it down significantly is a good option, too." Some arrows stay — "you
  could probably argue that these arrows aren't needed either, but we are going to keep
  those" (See All →, Skip →, Back) because they carry navigation meaning [interp — he
  keeps directional affordances, drops scroll hints]. He also dims a button's color
  (5:14–5:16) rather than deleting it.
- Implementation: sweep each screen asking "does the OS do this already?" (swipe, scroll);
  second pass on strokes/borders; dim instead of delete when unsure.
- Effect: less chrome; the remaining arrows signal actual navigation.
- Fails: desktop/web where swipe does not exist — his reasoning is explicitly mobile.
- Transfer: before removing any element, name the behavior it duplicates; if a gesture
  covers it (and it's mobile), delete; if it encodes navigation, keep.

### L05-7 Interactive feedback: every tap must collapse the "did it work?" gap
- Problem [transcript 5:39–5:54]: "if it takes a split second longer for the next screen
  to load, it looks like we haven't even clicked on the button at all." L05-1 noted hidden
  states as the most-missed element class — this chapter fixes them.
- Decision: (a) gray out the clicked button ("we've added some interaction and it shows
  the user that the next screen is coming"); (b) "Even better, we could add a loading
  wheel if it's really taking a long time" (5:53–5:58); (c) save affordance: "Filling it
  in is a great first step" — clicking the bookmark fills it — "but we could also add a
  red dot to our save tab" so the user sees "there's a new recipe added to the save tab"
  (5:58–6:10).
- Evidence: `t00m5m44` (Peanuts tile selected: green ring + check overlay under cursor),
  `t00m6m04` (red badge dot on the bookmark tab in the bottom nav; both recipe cards'
  bookmarks filled in). The gray-out and loading-wheel variants were described in motion,
  not captured as frames (see Unverified).
- Effect: perceived responsiveness; state recall across screens (badge = cross-screen
  memory).
- Fails: fake feedback (loading wheels that lie); badges that never clear.
- Transfer: minimum interaction contract = press state + immediate result state + badge/
  indicator on the receiving destination; he cross-references his dedicated
  micro-interactions video [transcript 6:13–6:19].

### L05-8 Charts: data-ink over aesthetics (bonus)
- Problem [transcript 6:29–6:49]: "charts are so often messed up by overdesigning."
  The right-hand "Sales overview" card (`t00m6m36`) — his Dribbble-picked specimen — has
  no vertical axis, rounded capsule bars that hide where a bar ends ("it's hard to tell
  where the bar ends with a rounded top"), and "there are 16 bars here, but only 7 days of
  the week. Why would you do that?"
- Decision: prefer the plain left chart — y-axis ticks (30k/60k/90k), dashed gridlines,
  rectangular bars over labeled days S–S — "definitely less aesthetic, but conveys so much
  more useful information to the user" (6:51–6:56).
- Reasoning: legibility IS the job of a chart; styling that obscures measurement is a
  beginner tell (this was a bonus because it unrelated to the recipe app).
- Evidence: `t00m6m36`.
- Effect: values become readable and comparable.
- Transfer: any dashboard — every decorative chart choice must survive the question "can
  the user read a value off this?"; counts of marks must match the count of categories.
  Aligns with L01-2/L01-9 (semantic chart colors, chart type by question).

## Creator tendencies observed (feeds creator-profiles.md)

- Confirmed series format: numbered-mistake listicle + one-app live redesign, speech full
  of first-person confession ("I've spent years making bad designs", "like my old app
  design") — teaches from self-diagnosis, not condescension.
- Progressive disclosure of technique: zooms into exact Figma panel values (shadow
  0/3/30/D3D3D3; vertical trim) so viewers can copy settings, not just outcomes.
- Uses measurement overlays (pink grid columns, spacing bands) as visual proof rather than
  only narrating.
- Recommended toolchain here: Flaticon (sort by stroke/width/corner, SVG), Feather,
  Phosphor plugins; styles/variables/components as consistency enforcement. Matches his
  L01-1 Phosphor preference.
- Uses Dribbble as the named anti-pattern source (overdesigned charts, "candy" gradients)
  while real product patterns (his own fixed screens) are the positive examples.
- Visual identity of his specimens differs per video (dark green serif "Tasty!" recipe app
  here; purple sans "Open Cloud" in video-04) — he designs a plausible brand per case
  rather than reusing a template.
- End CTA: full Figma file (mistakes + finished app) in the description.

## Unverified / transcript-only observations

- Flaticon website walkthrough steps (4:02–4:17): not framed (site demo happens fast
  between framed moments).
- Button gray-out on click and loading-wheel states (5:47–5:57): described as motion;
  only the end-state selection/badge frames were captured (`t00m5m44`, `t00m6m04`).
- Exact grid "measurements" values (2:09–2:11): stated in speech, numbers not legible in
  `t00m2m10`.
- Which buttons get "dimmed" color in the redundancy chapter (5:14–5:16): narration
  overlay on a moving frame; not isolated in a frame.
- The intro "TravelToday" landing page (`t00m0m10`, 0:08–0:20) is presented as a bad-design
  specimen during the intro; [interp] it is one of the "real examples" he references, not
  part of the recipe-app redesign.
- Frames at 1:10 and 2:06 caught camera transitions and were replaced (protocol ±2s rule);
  1:48 was a near-duplicate of 1:41 and was dropped to keep the 20-frame budget.

## Quotable diagnostics (explicit)

- "I've spent years making bad designs, so I can tell you exactly what makes something
  look like it was made by a beginner." (0:02–0:05)
- "Users, they'll feel it instantly." (0:42–0:44)
- "Even something as simple as sketching boxes on paper helps you catch major gaps early
  on." (0:46–0:49)
- "Most of the time, less visual noise equals a better design." (1:51–1:54)
- "Especially on mobile screens, you'll need more space than you think." (2:26–2:29)
- "Set the corner radius of all smaller components to be 10 pixels. This is an important
  one that most designers miss." (3:14–3:21)
- "Being consistent means using styles for colors, variables for measurements, and
  components for UI elements." (3:27–3:32)
- "It is okay to have different styles of icons in the same design, but only if they're
  visually separate." (4:38–4:44)
- "It's hard to tell where the bar ends with a rounded top... there are 16 bars here, but
  only 7 days of the week. Why would you do that?" (6:43–6:50)
