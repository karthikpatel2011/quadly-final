# Research Notes — Video 12, Part A (of 3)

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/truRwcI7-kg
- Title: "UI/UX Design Full Course for Beginners 2025 | Lets Uncover"
- Channel: Lets Uncover (Soban Tariq, host/intro). Course instructor: Ali Hassan (@alihassanux, ~5 yrs in the field, per transcript 2:38–3:14)
- Duration: 3:08:14 · Published: 2025-05-06 · Views: ~511k · Language: Hindi/Urdu (auto-captions; slides are in English)
- Classification: full beginner course (help-wanted "course" type). **This file covers Part A only: 0:00:00–1:04:00.** Part B starts at Jacob's Law (1:04:00).
- Access: Hindi machine-captions transcript (`media/transcripts/video-12.hi-raw.txt` lines 1–1741, quoted lines below are `translated-from-hi` unless marked slide text) + 36 frames viewed at 720p (AV1 720p full-file source `media/segments/video-12-full.mp4`; yt-dlp `--download-sections` crashed the local ffmpeg build — SIGSEGV — so frames were cut directly from the verified full file, timestamps identical to section cuts)
- Subject of range: course intro → "what is UI/UX" and designer roles → complete beginner Figma walkthrough (install → dashboard → frames/layers/assets/styles/strokes/effects/export/prototyping) → 10 UI design principles → first 5 UX laws

## Structure of 0:00–1:04:00 (no chapters in metadata; map built from transcript + frames)

0:00–1:29 Host intro (Lets Uncover frames the course as a money skill) → 1:29–3:15 Ali Hassan intro (career story; who should learn design) → 3:16–7:00 What is UI vs UX (definitions, designer roles, restaurant + e-commerce analogies, wireframe concept) → 7:00–8:00 spoken course roadmap → 8:00–37:00 live Figma walkthrough (Google search → download → plans → dashboard → first design file → layers → assets/components → canvas navigation → top bar → frame presets → desktop frame → dev mode → constraints → fills → color styles → strokes → effects → export → prototyping → thumbnails) → 37:00–38:22 own-course-file showcase + presentation mode → 38:22–41:03 slides: components of UI design, steps of UX design, UI vs UX differences → 41:03–55:14 ten UI design principles with brand evidence → 55:14–55:47 meta transition ("basics first") → 55:47–1:03:59 UX laws: Aesthetic-Usability Effect, Doherty Threshold, Fitts's Law, Serial Position Effect, Hick's Law. (0:00 marks: no chapters exist in `media/metadata/truRwcI7-kg.json` — `chapters: null`.)

## Teaching format

One continuous instructor-led screencast: talking head at the start, then live Figma, then an in-Figma slide deck presented via Play/fit-width. Slides are in **English** (read directly as slide evidence; screenshots of real products: Google, Facebook, Amazon, Messenger, Apple, Spotify, Medium, 1998/2020 Google). Every abstract concept is anchored to a householder analogy (house map, restaurant, traffic signals, WhatsApp ticks, book with tiny words). The instructor repeats each definition twice (say → re-explain), typical of learner-facing Hindi lecture style.

## Lesson log

### L12A-1 Split UI and UX by output: UI owns beauty, UX owns whether it works
- Problem: beginners use "UI/UX" as one blob and don't know what either job does.
- Decision [transcript 3:19–6:51, translated-from-hi]: UI = "the one who puts buttons, pictures and text on the website — who makes the whole website beautiful — we call the UI designer" (3:39–3:55). UX = "what problems the user faces when using it… whether the e-commerce site gets the customer what they came for, whether payment integration exists on checkout, whether the user stays or closes the site" (6:03–6:43). Restaurant analogy: "from outside the restaurant is very beautiful, but only tasting the food tells you whether it is worth the price tag" (5:33–5:52).
- Reasoning: explicit — both roles are hired at roughly equal (one-lakh-plus) salaries (7:20–7:29) [salary claim unverified].
- Evidence: transcript 3:16–7:00; frames `t00m02m45`, `t00m05m45` (talking-head delivery — no slide in this stretch).
- Implementation: teach role boundary before tools; use quality-of-experience examples the learner already lives (restaurant, shopping, checkout).
- Effect: a mental file system for the 15+ topics that follow.
- Fails: solo freelancers who must do both — the course's own client scenario (design → review) collapses the split.
- Transfer: any curriculum or team SOP: define which artifacts belong to "make it beautiful" vs "make it work" before naming tools.

### L12A-2 Wireframe = the house map: structure before color or fonts
- Problem: beginners jump straight to nice-looking screens.
- Decision [transcript 4:11–4:53, translated-from-hi]: on receiving requirements, first "make a rough sketch" — low-fidelity design "on which there are neither colors nor a proper font selection… you simply make a structure. Just like we get a map made before building a house — first 2D, then 3D. The house's blueprint isn't made directly; likewise we first create the wireframing of the website or mobile app design."
- Reasoning: explicit (map analogy given as the reasoning).
- Evidence: transcript only — this stretch is talking head (frames `t00m02m45`, `t00m05m45` show no slide). Listed here because it is the course's process backbone; visual steps appear later in the Figma section.
- Implementation: requirement → questionnaire → wireframe → UI design → principles check.
- Effect: separates structure decisions from aesthetic decisions.
- Fails: tiny redesigns where sketching costs more than doing.
- Transfer: applies to any new page: block out the skeleton in grayscale boxes first.

### L12A-3 Day-1 scaffold: prebuilt frame + OS status bar before any design decisions
- Problem: beginners stare at an empty canvas not knowing the first concrete move.
- Decision [transcript 18:37–18:41, translated-from-hi]: "this is how website designing starts" — take a frame (a phone-size frame from presets), drop the ready-made iPhone status bar (time, wifi, battery icons) and even the OS wallpaper onto it. Debated the iPad vs iPhone status bar choice on screen (18:00–18:05).
- Evidence: `t00m18m40` (iPhone wallpaper + status bar "9:41" inside Frame 402×874; Assets panel showing "iOS 18… Wallpapers: iPad/iPhone"), `t00m22m25` (F-press preset list: iPhone 16 393×852, 16 Pro 402×874, Pro Max 440×956, SE 320×568… under Phone, plus Tablet/Desktop/Presentation/Watch/Paper/Social media groups).
- Implementation: Assets panel/library drag-and-drop; never hand-draw system chrome.
- Effect: instant realistic starting block; demystifies the blank canvas.
- Fails: designing for platforms whose chrome isn't in a library.
- Transfer: any tool — stock feed the system chrome, invest effort only in product surface.

### L12A-4 Never design what already exists: pull buttons and components from libraries
- Problem [transcript 17:44–17:55, translated-from-hi]: drawing every control from scratch wastes time and quality.
- Decision: "if I need a button, I simply drag-and-drop it from here; I especially don't need to design it myself." Prebuilt libraries shown: iOS 18 (156 components), Material 3 (245), Simple Design System (372) (17:26–17:42).
- Evidence: `t00m17m55` (blue "Play" button instance dragged in; inspector shows it as an iOS 18 Button instance — Size Small, Style Filled, State Enabled — with auto layout 66 Hug × 28 Hug).
- Implementation: Assets tab → search ("button") → drag instance; detach variant if needed (27:33–27:40).
- Effect: consistent, production-grade controls at zero design cost; teaches what components are before the theory.
- Fails: student over-relies on defaults and never builds a component — instructor defers component creation to "its own class" (24:27–24:41).
- Transfer: check the asset kit before opening the shape tools.

### L12A-5 Define every color once as a style; reuse it by name across pages
- Problem [transcript 28:11–28:17, translated-from-hi]: "I want this color as my final, to use throughout the website — I shouldn't have to come back again and again, click, and copy-paste the hex code."
- Decision: pick the color, open the color panel (formats shown: hexadecimal, RGB, CSS, HSL, HSB — 27:58–28:07), "Add style", name it ("cyan color", 28:27–28:31), then on any page pick it from the dropdown. "Once the color is defined, you can use it again and again" (29:25–29:29).
- Evidence: `t00m27m45` (picker with Libraries tab — M3/ref/primary surface tokens), `t00m28m45` (cyan frame fill + saved custom palette entry), `t00m33m55` (Fill row now reads "Cyan" as a named style with swatch; Selection colors lists Cyan/6052FF/EFEEFF) — this is the course's first design-token lesson, demonstrated as a workflow.
- Implementation: hex/HSL entry → create color style → apply from list everywhere; variables alluded to as the next level (28:36–28:40).
- Effect: whole-project consistency, one-click re-theming; frames the token concept before the word appears.
- Fails: un-named ad-hoc swatches (his own first attempt lacked a name — he pauses to rename it "Cyan", 29:08–29:14).
- Transfer: name semantic roles, not vibes; one style per role, used everywhere.

### L12A-6 Elevation = drop shadow with x/y offset, blur, spread; inner shadow is the rare one
- Problem: flat cards don't separate from the surface; beginners overuse exotic effects.
- Decision [transcript 31:57–33:02, translated-from-hi]: "the main thing is drop shadow… move it along the x-axis and y-axis… the area below gets blurred… increase… spread… change the color… whichever suits your design. That's how a proper 3D look comes from adding a shadow." Inner shadow "isn't used much, we can even skip it"; layer blur and background blur named for whole-layer and frosting jobs.
- Evidence: `t00m32m25` (purple rounded square on cyan with shadow editor open: X 44, Y 39, Blur 4, Spread 0, Color 000000 25%; Drop shadow chip in Effects).
- Implementation: one drop shadow per card, soft black at low opacity, y-offset for light-from-above.
- Effect: depth hierarchy without borders.
- Fails: heavy/dark shadows read as cheap; stacking multiple effects.
- Transfer: elevation ladder = offset distance; keep opacity low.

### L12A-7 Constraints teach responsiveness before you ever build a breakpoint
- Problem: beginners see desktop-only artboards and don't grasp how elements should behave when width changes.
- Decision [transcript 25:19–25:58, translated-from-hi]: move a rectangle and show the left/right constraint pins: "if I want it to move only on the left side… it will move only on the left… these are used for responsiveness" — behavior demonstration now, "detailed explanation as the class moves forward" (25:55).
- Evidence: `t00m25m40` (rectangle inside Desktop-1 frame mid-resize; red constraint handles implied).
- Implementation: pin objects left/right/center; combine with the preset frame sizes.
- Effect: early mental model that desktop layouts must survive resizing.
- Fails: constraints alone aren't layouts — no grids/auto layout taught in this range.
- Transfer: every element in a fluid page makes a choice: anchor left, right, or stretch.

### L12A-8 Don't memorize device sizes — use the preset list, know only the surfaces
- Problem [transcript 23:23–23:31, translated-from-hi]: beginners think screen sizes must be memorized.
- Decision: "you don't need to remember what the desktop size is, or Mac's size… everything here is predefined." Press F, pick from the list; desktop = 1440 width × 1024 height (read off the inspector, 23:10–23:16); presentation slides = 1920×1080 (23:40).
- Evidence: `t00m22m25` (full preset menu: Phone/Tablet/Desktop/Presentation/Watch/Paper/Social media/Figma Community), `t00m23m12` ("Desktop - 1" frame with W 1440 H 1024 badge visible both on canvas and in Layout).
- Implementation: choose the named preset; only remember categories (desktop, tablet, phone).
- Effect: removes a fake memorization barrier; standardizes artboards.
- Fails: custom device briefs (kiosk, odd hardware).
- Transfer: in any tool, start from target-surface presets, not pixel recall.

### L12A-9 Export with intent: know your format and your multiplier
- Problem [transcript 33:44–34:45, translated-from-hi]: sharing with clients raises "which format, what size?" — beginners export the default forever.
- Decision: Export + → "JPG, then PNG, then SVG, then PDF options appear; download in whichever format" (33:52–34:01). For size, "most people use 2x or 3x at maximum" — and he does the math aloud: "if the frame is 5 MB and you export at 3x, 5×3 = 15 MB" (34:27–34:43).
- Evidence: `t00m33m55` (Export section open; PNG/JPG/SVG/PDF dropdown on a 1x row; frame Fill shows the saved "Cyan" style — same scene).
- Implementation: PNG for UI/mockups, SVG for vectors, PDF for print/decks; multiplier = crispness × file weight tradeoff.
- Effect: right artifact for the client's use.
- Fails: exporting 3x always (heavy hand-offs); SVG of flattened photos.
- Transfer: pick export format by the medium that consumes it, not by habit.

### L12A-10 Package the course/work in the same tool: slides + named thumbnails for findability
- Problem: multi-file projects become an unidentifiable list of tabs; client walkthroughs need presentation form.
- Decision: right-click a frame → "Set as thumbnail" so the file shows the design in the project list ("so I can easily find it", 35:51–35:53); teach Play → presentation with Fit width (37:56–38:12); slide decks noted as a Figma file type for "showcasing to a client" (12:47–12:53).
- Evidence: `t00m36m05` (content enlarged — "I set the text size to 100" 36:35–36:38 — before setting as thumbnail; Fill shows "Cyan" style), `t00m13m00` ("+ Create new" menu listing Design file / FigJam board / Slide deck / Import; free-plan usage panel 0/3 each).
- Implementation: pick the most representative frame as the file thumbnail; use presentation mode with fit-width for client demos.
- Effect: navigable project space; professional hand-off ritual.
- Fails: thumbnail updates depend on internet sync (36:48–36:52).
- Transfer: every design file should be findable by its cover; decks live beside designs.

### L12A-11 UI principle — Simplicity: one main action, and a voice path for everyone
- Problem: overloaded screens exclude non-technical users.
- Decision [slide, viewed]: "Simplicity is a key in designing user interfaces by keeping things simple. You make it easy for users to understand and use your product" (41:46–41:56, spoken Hindi paraphrase translated-from-hi). Example: "Google's home page is very simple with just a search bar. This makes it easy for anyone to use, no matter how tech-savvy they are" — plus the mic icon as the input for blind/non-typing users (41:59–42:40).
- Evidence: `t00m42m20` (Google homepage screenshot: logo, one search field, two buttons, language links — nothing else).
- Implementation: one primary action per screen; secondary affordances (voice) hidden until needed.
- Effect: zero-training usability.
- Fails: products whose core is complex (the simplification becomes an abstraction — Hick's Law caveat below, 1:03:07).
- Transfer: ask "which one control does this screen exist for?" and protect it.

### L12A-12 UI principle — Consistency: same style, layout and sticky chrome everywhere
- Problem: each screen reinventing its own chrome forces users to relearn navigation.
- Decision [slide + talk, viewed]: "it means using the same style and layout throughout your app and website" (43:02–43:04 — read off the English slide); example Facebook: "no matter where you go on Facebook, the top bar and side menu stay the same. This makes it easy to use" (43:29–43:37). On mobile the bottom tabs are "stuck, so you can move to any tab" (43:39–43:51).
- Evidence: `t00m43m55` (Facebook desktop: static top bar + left rail beside the feed).
- Implementation: tokens/styles (ties back to L12A-5) + persistent chrome regions.
- Effect: users stop noticing navigation and start completing tasks ("feel comfortable and know how to navigate", 43:19–43:21 slide).
- Fails: contexts where chrome must react to state (checkout focus, focus-mode).
- Transfer: audit every screen for repeated modules — pick one place for each recurring control.

### L12A-13 UI principle — Visual hierarchy: size is the steering wheel
- Problem [slide, viewed]: everything same-size = user under-informed about where to look first.
- Decision: "imagine a website as a busy street. Visual hierarchy is like traffic signs and lane markings. It helps you understand where to go and what's important" (44:12–44:41, slide). "On websites like Amazon, product names and prices are big and bold, so you notice them first. Other details, like reviews, are smaller, so you look at them after" (44:48–45:00 slide). On-screen walkthrough: "main picture first, then the tiny name, tiny reviews — but you'll think 'how much is it?' and the price below is the biggest" (45:07–45:30, translated-from-hi).
- Evidence: `t00m44m50` (the two-point hierarchy slide).
- Implementation: decide the 2 things the user needs (product identity + price in his Amazon example); give them the largest sizes; demote everything else.
- Effect: task speed — "helps you find what you want quickly" (slide).
- Fails: when the "big" element is actually the ad/decoration, hierarchy misleads (he doesn't cover this — honest gap).
- Transfer: list every element on the page and rank by the user's decision order; size/tag accordingly.

### L12A-14 UI principle — Feedback & responsiveness: the interface must acknowledge every action
- Problem: silent systems make users anxious about whether their action landed.
- Decision [slide + talk, viewed]: WhatsApp ticks example — "when you send a message you see little ticks. This is called feedback. It lets you know your message was received and that your friend is reading it… this helps you feel connected and in control of the conversation" (45:47–46:25, slide text read aloud; ticks decoded: single = not delivered, double = delivered, blue = read, 45:57–46:06). Typing indicator and reactions included (46:17–46:47).
- Evidence: `t00m46m35` (Messenger graphic: sent message with ticks, reaction tray, long-press menu with Edit, message showing "Edited 9:24 AM" plus reply reaction).
- Implementation: state change on every user action (delivered/read/typ­ing/reacted), via ticks, names, and animations.
- Effect: perceived control — "feel connected and in control" (slide).
- Fails: over-feedback (>alert fatigue) not discussed.
- Transfer: every async or slow action needs a visible state machine.

### L12A-15 UI principle — Accessibility: design for people who can't see, hear, or move
- Problem [slide, viewed]: "imagine designing a website or app that everyone can use, even if they have difficulty seeing and moving" (46:51–47:00).
- Decision: Apple as the model — "features like VoiceOver that read text aloud for people who can't see well, and Switch Control that lets people use their devices with just a few buttons. This ensures everyone can enjoy using Apple products" (47:09–47:29 slide). He demos the real iOS path on screen: Settings → General → Accessibility → VoiceOver (47:51–48:13).
- Evidence: `t00m48m05` (4-step iPhone navigation graphic ending on the VoiceOver screen with speaking-rate slider).
- Implementation: screen-reader compatible labels, alternative input (voice/Alexa example, 47:32–47:49), generous contrast/sizes.
- Effect: usable by the full population, not only the median user.
- Fails: retrofitting accessibility late.
- Transfer: check every flow with "how does this work with the screen off?" (transcript-driven phrasing, 47:45 translated-from-hi).

### L12A-16 UI principle — Error prevention & recovery: validate early, explain clearly
- Problem [slide, viewed]: "Error prevention and recovery focus on designing interfaces that minimize user errors and provide clear guidance and solutions when errors occur. It involves using validation, informative error messages, and intuitive error handling mechanisms" (51:08–51:21, slide).
- Decision: web forms = "in web forms, validation techniques are used to prevent users from submitting incorrect or incomplete data. Clear error messages are displayed when users enter invalid information, guiding them to correct the errors and successfully complete the form" (51:52–52:08, slide). Live example: email without "@" → message under the field (52:23–52:30). The more you ease the user's job, "the more active the user will be with it." (52:46–52:50, translated-from-hi).
- Evidence: `t00m52m20` (the full principles slide; form example itself delivered as talk — see Unverified).
- Implementation: inline validation, error text under the offending field, guidance tone.
- Effect: fewer abandoned forms; user keeps moving.
- Fails: blaming error copy ("wrong email!" vs guidance).
- Transfer: any input: prevent, catch, explain — in that order.

### L12A-17 UI principle — Aesthetics & visual appeal: beautiful AND functional; motion + restraint sell delight
- Problem: "imagine a website that is not only functional but also beautiful" (52:53–52:58, slide).
- Decision: "this is what aesthetic design is — it's about making things look good and feel good" (52:58–53:08, slide). Apple website walkthrough: "clean, clear, simple and visually pleasing. The colors, fonts and images are all carefully chosen" (53:14–53:25); on screen "there's animation, there's creativity, and simple colors — nothing is overcrowded; just the main heading on top and a video playing below, which makes you feel something new and enjoyable is coming" (53:29–53:48, translated-from-hi).
- Evidence: `t00m53m30` (Apple AirPods page: minimal nav, light stage, magenta swirl animation, single Buy action).
- Implementation: one hero statement per viewport, generous whitespace, one moving element, restrained palette.
- Effect: users stay — aesthetics sets the first impression that UX then honors (bridge to L12A-21).
- Fails: beauty hiding broken flows (explicitly the next law's warning side).
- Transfer: marketing and product pages alike; restraint is the work.

### L12A-18 UI principle — Scalability & adaptability: same look and feel on every device
- Problem: teams ship phone and desktop as separate products.
- Decision: "it should look good and work well on all of them" — mobile, tablet, computer (53:54–53:59, slide). Spotify cited: "this app looks and works the same way… no matter what device you're using" (54:16–54:27, slide); on screen the same Discover Weekly UI on desktop/tablet/phone, with the note that on small screens an element "collapses into the three dots" (54:42–55:10).
- Evidence: `t00m54m45` (Spotify Discover Weekly rendered on monitor, tablet, Android phone, iPhone).
- Implementation: one design language + responsive shells; overflow ("three dots") for low-priority items on small screens.
- Effect: recognition across contexts; no relearning per device.
- Fails: forcing desktop interactions onto touch instead of adapting.
- Transfer: define components once, adapt their container.

### L12A-19 UX law — Aesthetic-Usability Effect: pretty is believed to be easier — and it hides problems
- Problem [slide, viewed]: users judge usability by looks, not by behavior.
- Decision [transcript 55:47–57:28, translated-from-hi]: slide headline "Users often think that a good-looking design is easier to use"; three-part definition off the slide: (1) "a beautiful design makes people feel good and makes them think the design works better than it might actually do", (2) "people are also more forgiving of small usability issues when something looks nice", (3) "a visually attractive design can sometimes hide usability problems, which means some issues might not show up in usability testing" (56:08–56:31). He warns pretty UI distracts: "90% of people wouldn't even notice the nav bar above, because the animation below was playing" (56:48–56:55, translated-from-hi). Android (many buttons) vs iPhone (no buttons) given as the problem/solution pair (56:57–57:10).
- Evidence: `t00m56m55` (aesthetic-usability slide).
- Implementation: invest in beauty deliberately, but test with the gloss off.
- Effect: tolerance margin for minor flaws; better first impressions.
- Fails: using it as cover for broken UX — the slide itself flags the testing risk.
- Transfer: marketing pages can lean harder on this law than product surfaces; test the latter ruthlessly.

### L12A-20 UX law — Doherty Threshold: respond inside 400 ms, and stage the wait
- Problem [slide, viewed]: dead air between action and feedback breaks attention.
- Decision: "productivity increases when a computer and its users interact quickly—ideally in under 400 milliseconds—so neither has to wait" (57:32–57:40 slide). Five rules off the slide: feedback within 400 ms; use perceived performance to make response feel faster; animation engages while loading; "progress bars help make wait times tolerable, regardless of their accuracy"; "adding a small delay to a process can make it seem more valuable and build trust, even if the process is actually very quick" (57:50–58:51).
- Evidence: `t00m58m20` (Doherty slide, five numbered rules).
- Implementation: optimistic UI, skeleton/loading animations, progress bars (even approximate), deliberate pacing where value perception matters.
- Effect: attention retained; waiting feels shorter; slow-but-staged feels premium.
- Fails: fake delays that feel manipulative when discovered.
- Transfer: any async action gets a staged response plan: instant ack → progress → result.

### L12A-21 UX law — Fitts's Law: big, spaced, reachable targets (CTAs are Fitts targets)
- Problem [slide, viewed]: small, cramped, or corner-far controls cost accuracy and time.
- Decision: "the time it takes to reach a target depends on how far away the target is and how big it is" (59:22–59:30 slide); rules: "touch targets should be large enough for users to accurately select them," "have enough space between them," "be placed in parts of the interface where they are easy to reach" (59:33–59:52 slide). Applied: "the CTA button — call to action — you made the bottom button big just so the user can click it easily and place the order" (1:00:25–1:00:41, translated-from-hi); left vs both vs right-handed keyboard use as the reach example (1:00:08–1:00:19).
- Evidence: `t00m59m25` (Fitts slide with three touch-target rules).
- Implementation: primary buttons oversized; spacing between adjacent actions; place core actions in thumb/eye reach.
- Effect: faster, error-free interaction; conversion on commerce CTAs.
- Fails: equally-big everything (hierarchy loss) — not discussed here, but implied by serial-position pairing.
- Transfer: mobile grips, bottom-right CTAs, keyboard-only flows.

### L12A-22 UX law — Serial Position Effect: users remember first and last — so load your message dialog that way
- Problem [slide + talk, viewed]: lists and dialogs bury the important item in the middle, where memory is weakest.
- Decision: "users have a propensity to best remember the first and last items in a series" (1:00:46–1:00:51 slide); "placing the least important item in the middle of a list can be helpful… placing the important action on the far left and right in menus can help people remember them better" (1:01:03–1:01:19). Build: compare two success-message dialogs — good one puts the title in capitals ("so the user knows: is this an error message or a success message", 1:01:43–1:01:47), least-important body text in dark gray (1:01:51–1:01:57), Cancel rendered as a plain stroke button, "View Details" as the prominent colored button — "that is the power" (1:02:04–1:02:14).
- Evidence: `t01m01m50` (before/after dialog pair; bad: flat title, equal-weight Cancel link & View Details link; good: "SESSION COMPLETED"-style bold title with underline + annotations "PEAK" on the title and "END" on the filled View Details button, Cancel as ghost button).
- Implementation: rank items by memory weight: primary → first/last slot; outline the cancelables; fill the primary.
- Effect: the one action you want performed is the one seen and remembered.
- Fails: menus with one item; grids without a series.
- Transfer: pricing rows, nav menus, dialogs, onboarding steps.

### L12A-23 UX law — Hick's Law: more choices, longer decisions — cut, chunk, recommend
- Problem [slide + talk, viewed]: option-rich screens stall users.
- Decision: "the time it takes to make a decision increases with the number and complexity of choices" (1:02:28–1:02:35 slide). Remedies off the slide: "minimize choices when response times are critical"; "break complex tasks into smaller steps in order to decrease cognitive load"; "avoid overwhelming users by highlighting recommended options"; "be careful not to simplify to the point of abstraction" (1:02:52–1:03:09). The history anchor: 1998 Google "too many options, crowded page" (result-count dropdown, subscribe box, Stanford links) vs 2020 Google "streamlined page — only a simple search option… logo on top, search below, because Google is a search engine — simple" (1:03:11–1:03:43, translated-from-hi).
- Evidence: `t01m03m15` (1998-vs-2020 Google before/after slide with both screenshots annotated).
- Implementation: one primary path; recommendation highlighting; multi-step wizards for complex tasks — without deleting needed options entirely.
- Effect: shorter decision time, less paralysis.
- Fails: over-simplification that hides capability (slide's own caveat).
- Transfer: menus, forms, pricing pages; default-first design.

### L12A-24 Meta-lesson delivered as pedagogy: theory before practice, on purpose
- Problem: learners inside the course complain "sir, you're saying so much theoretical stuff — we're bored" (55:21–55:27, translated-from-hi).
- Decision: instructor answers directly: "first of all you have to clear your basics… I'm telling you only those things which will help you a lot in the beginning… practicals we will also do — but first your basics have to be clear" (55:27–55:44).
- Reasoning: explicit — principles and laws are what make the later practical (the "example we'll build at the end", 37:35–37:38) land.
- Evidence: transcript 55:14–55:47; no slide at this moment (transition) — transcript-only with timestamp; structure of the rest of the range (10 principles + 5 laws before any build) is the enacted proof.
- Effect: the Figma tour (8:00–37:00) reads as vocabulary acquisition; laws arrive as "why".
- Fails: learners who need to make something before they can absorb theory.
- Transfer: any curriculum: interleave tool demos early, but gate the capstone build behind principle exposure.

### L12A-25 Figma-only craft habits embedded in the tour (micro-lessons, one line each)
- Rename layers immediately ("Class one" rename demo, 16:10–16:16 — `t00m22m20` shows a layer actually named `class1`).
- Lock (pin) layers to stop them moving; hide via the eye icon (16:18–16:53).
- Zoom = Ctrl + scroll; precise pans: Shift = left/right, Alt = up/down (20:08–20:48) — navigation taught before drawing.
- Search finds layers by name (Ctrl+G per his demo, 19:01–19:13) and assets by keyword ("type button… everywhere button is mentioned it will come", 19:25–19:28).
- Share = copy link to client (21:42–21:56); real-time collaborator avatars show who's doing what (21:00–21:08 — `t00m11m00`).
- Individual-side strokes (bottom-only border) via the stroke settings (31:19–31:47) — "minor things… but they properly affect the design" (31:08–31:14, translated-from-hi).
- Blend modes/opacity/image/gradient fills demonstrated live (material for later styling lessons).
- Developer mode toggle exists so "the developer… comes to know what you've actually designed" (23:51–24:11).

## Creator tendencies observed (feeds creator-profiles.md)

- Analogy-first teaching: house map, restaurant, traffic signals, WhatsApp ticks, blurry book — every abstract idea gets a street-level analogy before a definition.
- Definition repetition loop: says it, translates it, says it again — plus preview-before-topic ("first let me tell you what will be covered", 7:02–8:00).
- Famous-product induction: Google, Facebook, Amazon, WhatsApp/Messenger, Apple, Medium, YouTube, Spotify as example set; never niche portfolios.
- Bi-lingual scaffolding: Hindi/Urdu lecture over English slides; key rules read verbatim off the slide, then re-explained in Hindi.
- Self-referencing resources: repeatedly points to his own free Figma community files and channel as course collateral (10:56–12:08).
- Tool-equals-theory sequencing: Figma tour in feature order (frames → layers → assets → styles → effects → export → prototype) mirroring a future design workflow.
- Contextualizing for Pakistan/freelance audience: salaries, client sharing, mobile-first flows.

## Unverified / not analyzed (transcript-only in this range)

- Salary claim that UI and UX designers both earn roughly "one lakh plus" (7:24–7:29, translated-from-hi) — no frame, no source.
- Clarity principle visual: Medium screenshot described at length (big clear fonts, white space, italic/bold/regular mix, pictures below — 48:44–49:25) but no frame extracted in this part; viewed only via slide text at other times? — listed here as transcript-only (`t00m48m05` covers accessibility, not Medium).
- User-control principle visual: YouTube playback controls slide (49:30–51:06: pause/play/rewind/volume, 2x, quality, subtitles, loop) — transcript-only.
- Live form-validation demo (error under email field, do's/don'ts tokens 51:52–52:50) — the extracted frame shows the principles slide, not the form screen; transcript-only.
- "Layout grid" types (33:30–33:40) explicitly deferred by the instructor to later slides ("types of grids we will properly see in slides ahead") — outside this range.
- Component creation deep-dive, prototyping deep-dive, responsive design deep-dive all explicitly deferred ("when its class comes I'll tell you in detail", 24:36–24:41, 25:55–25:58, 35:35–35:38).
- Frames captured mid-action (`t00m22m20` after preset use, `t00m36m05` before thumbnail applied) document the step but not the completed state.
- 0:00–2:45 has no frame; that stretch is host intro over the same pink-damask set confirmed at 2:45 (positions/talking head only).

## Quotable diagnostics (translated-from-hi unless marked "slide")

- "UI: the one who makes the whole website beautiful… UX: what problems the user faces." (3:39 / 0:49 compressed)
- "Just as a house's blueprint isn't made directly — a map is made first — likewise we first create the wireframing." (4:34–4:51)
- "If you're starting, this free plan is enough to get started in UI/UX designing on this software." (9:42–9:50, about Figma Starter, 3 files/3 pages)
- "You don't need to remember what the desktop's size is… everything is predefined here." (23:23–23:31)
- "Don't come back again and again to copy-paste the color code — add it as a style, name it, use it everywhere." (28:11–28:44 compressed)
- "The main thing is drop shadow… from that your design gets a 3D look." (32:10–33:02)
- Slide: "UX shapes the journey / UI enriches the journey / Collaboration is imperative." (40:36–40:46)
- Slide: "Users often think that a good-looking design is easier to use." (56:55)
- "A visually attractive design can sometimes hide usability problems… they might not show up in usability testing." (slide, 56:26–56:31)
- "Progress bars help make wait times tolerable, regardless of their accuracy." (slide, 58:33–58:35)
- "Be careful not to simplify to the point of abstraction." (slide, 1:03:04–1:03:07)
- "First your basics have to be clear… practicals we will also do." (55:27–55:44)
