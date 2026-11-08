# Research Notes — Video 21

## Access note — frame evidence (read first)

The protocol's frame procedure could not be executed for this video. YouTube returned
"Sign in to confirm you're not a bot" on every access path attempted from this machine between
21:37 and 23:03 on 2026-10-24 (~10 attempts over ~85 minutes): yt-dlp with player clients
default/visionos, tv, android, ios, mweb, tv_embedded, web_embedded, web_safari, android_vr;
cookies extracted from Chrome, Chromium, Firefox, Brave (Edge/Vivaldi absent); forced IPv6; the
ZCode in-app browser (watch page loads, player shows the same bot-wall dialog); Invidious
instances (inv.nadeko.net 502, yewtu.be API 403, others unreachable); Piped APIs (piped upstream
itself reported "YouTube probably temporarily blocked anonymous watch access with this IP");
YouTube storyboard sprite sheets linked in the saved metadata (403/404 — session-bound signatures
expired). Only the static CDN thumbnail (`maxresdefault.jpg`) was fetchable and it has been
viewed. Consequence: **all visual claims below are transcript-only** unless flagged as the cover
thumbnail; slide text (reported by the transcript as on-screen examples) could not be verified.
No frames were invented. Slides referenced by the speaker are named under "Unverified" with
timestamps.

## Identity (verified via yt-dlp metadata + transcript; cover thumbnail viewed)

- URL: https://youtu.be/-jVC6oc6VP8
- Title: "Color Theory for UI Design | How to Choose Colors for Better User Interfaces"
- Creator: College Wallah (PW Skills education channel; 1.09M subscribers per watch page during
  browser attempt; presenter introduces himself at transcript 0:02 as "सौरभ" — Saurabh
  [translated-from-hi])
- Duration: 11:34 · Published: 2025-09-14 · Views: ~18.7k
- Classification: beginner lecture/tutorial (first video of the channel's UI design series; loud,
  slide-driven edtech format). Not a screen-work tutorial except one Figma segment.
- Access: Hindi auto-caption transcript `media/transcripts/video-21.hi-raw.txt` (325 lines, read
  completely; heavily Hinglish — English design terms transliterated into Devanagari) + metadata
  JSON + cover thumbnail `t00-thumb-maxres.jpg` (verified visually: presenter in black polo with
  PW logo, dark background, "COLOR THEORY / In UI Design" title, Figma and Adobe XD app icons, a
  3D color wheel with a blue selector knob and yellow cursor arrow). Video file: NOT downloaded
  (see access note).
- `translated-from-hi` marking: quotes below were spoken mostly in Hindi with heavy English
  code-mixing; translations are mine.

## Structure (reconstructed from transcript; metadata has NO chapters)

0:00 Intro & series framing → 0:48 What is color theory → 1:33 Color psychology (red/green/blue,
irreversible actions) → 3:55 The 60-30-10 rule → 5:11 Worked example: three screens + surface
counting → 6:52 Dominant vs primary/secondary/accent terminology → 7:22 Hex / RGB / HSL / HSB +
professional shade creation in Figma → 10:29 Contrast mini-critique (bad vs good UI) → 11:13
Resources (Color Hunt, coolors) + outro.

## Teaching format

Lecture over slides with three checkpoints: (1) a psychology segment (color wheel + gradient
meanings), (2) a rule segment (60-30-10) applied to three of the presenter's own screen designs
with a percentage overlay per screen [transcript 5:46–6:00 says he "presented which color is
used how much percent" on the right side], (3) a live Figma segment creating shades via the HSL
panel. Tone: practical-first — "सारी चीजें प्रैक्टिकल सिनेरियो के साथ" → "everything with practical
scenarios, not too theoretical" (1:09–1:13) [translated-from-hi].

## Lesson log

### L21-1 Color psychology is a UX feedback contract, not decoration
- Problem: a designer without color-meaning knowledge picks wrong feedback colors.
- Decision [transcript 2:20–3:36]: brand color is a given ("वो ब्रांड देगा आपको" → "the brand will
  give you that") but system colors follow fixed psychology: success message → green; warning →
  yellow; irreversible/dangerous actions (delete account, cancel booking/payment, log out) → red.
- Reasoning (explicit, 3:34–3:36): "जहां पे भी इरिवर्सिबल एक्शन होता है वहां पे आप रेड कलर यूज़ करते हो"
  → "Wherever there's an irreversible action, you use red there." And (3:09–3:12): "कभी भी आप कोई
  चीज़ डिलीट करने जाओगे ना, आपसे वह एक्शन हमेशा रेड कलर के डिलीट बटन में ही आएगा" → "Whenever you
  delete something, that action will always come in a red delete button — notice this anywhere."
- Evidence: transcript at 1:44–2:01 (red = alert/danger "do not move", traffic-light convention;
  green = success; blue = neutral/security), 2:10–2:19 ("corporate logos are mostly blue because
  it provides a sense of security — the trust factor behind the color" [translated-from-hi]),
  3:24–3:31 (account deletion is usually a hidden/advanced flow, and "if it exists it will be
  clearly red, stating this is a danger action, it cannot be reversed").
- Frames: none (download blocked); cover thumbnail `t00-thumb-maxres.jpg` shows the color-wheel
  motif only.
- Expected effect: consistent semantics reduce user hesitancy on destructive paths; the color
  carries the risk message (3:46–3:50: these colors "will eventually affect your overall UX").
- When appropriate: all product UI feedback states. Fails: brands whose primary IS the semantic
  color (he assigns brand vs system colors separately, 2:27–2:36).
- Transfer: define a feedback palette (success/warning/danger/info) per design system before
  screen work; reserve danger red for irreversible actions only.
- Cross-link: same "red = destructive/graph signal, never CTA" rationale appears in video-24
  (Tim Gabe, 12:41–12:48) — independent corroboration across creators.

### L21-2 The 60-30-10 rule with the correct dominant/primary mapping (his central lesson)
- Problem [4:12–4:18]: "इससे ज्यादा इंपॉर्टेंट होता है कैसे उन कलर्स को यूज़ कर रहे हो" → "More important
  than which colors you choose is HOW you're using them"; a balanced split keeps the UI from
  hurting the eyes ("आंखों में चुभे नहीं", 4:52–4:56 [translated-from-hi]).
- Decision [4:24–4:56]: 60% = the majority/surface color (white or light gray in light mode;
  black in dark mode); 30% = secondary/complementary (text, icons — his example uses black);
  10% = accent/brand/primary used only for what must stand out (e.g., the primary button,
  6:40–6:46).
- Dark-mode inversion [5:36–5:45]: "वो जो मेजॉरिटी 60% है वो इनवर्ट हो जाएगा" → "The majority 60%
  inverts — if it was white it becomes black, and vice versa."
- Worked example [5:11–6:37]: three screens of his own, with the claim "एवरीथिंग इज़ क्लियरली
  रीडेबल" → "everything is clearly readable", hierarchy achieved through color, "no overuse of
  color" (5:19–5:30). Two counting rules named: (a) "उसको भी आपको काउंट करना है" → "you must also
  count the SURFACE color — gray, black, or white — in the 60%" (6:02–6:15); (b) black covers
  "टेक्स्ट का कलर… आइकॉन्स का कलर" → "text AND icons" = the 30% (6:17–6:33).
- Terminology warning (explicit 6:52–7:21): users of the rule mis-map "primary" to the biggest
  share. "प्राइमरी, सेकेंडरी, एक्सेंट एंड डोमिनेंट… में फर्क होता है" → "primary/secondary/accent and
  dominant/complementary/accent are not the same set": the accent is "उसको बहुत ही कम क्वांटिटी
  में उसको यूज़ करते हो बट इट स्टैंड्स आउट क्लियरली" → "used in very small quantity but it stands
  out clearly"; the DOMINANT color — the one used most of the time — is the 60%, "ना कि सेकेंडरी
  कलर वो होता है जो 60% ऑफ़ द टाइम यूज़ होता है" → "not the 'secondary', and certainly not the
  brand/primary" (7:11–7:21).
- Frames: none (download blocked). Slides referenced: the basic 60-30-10 slide (4:56–5:03); the
  three-screen example with percentage overlay (5:46–6:00); the primary-button example
  (6:38–6:50). All transcript-only.
- Expected effect: a balanced UI where the brand color retains its attention value and the
  surface recedes (his three screens read as "बहुत ही बेसिक एग्जांपल" → very basic, 5:00–5:03,
  upgraded to his own screens for practice value).
- Fails: intentionally loud brand campaigns; dark surfaces counted differently in true-AMOLED
  themes [interp].
- Transfer: audit by counting surface pixels, not by listing palette slots; keep brand ≤10% and
  spend the rest on neutrals and text.
- Cross-link: Tim Gabe teaches the identical 60-30-10 rule in video-24 (2:40–3:01) — cross-creator
  corroboration; Gabe's violation example ("reverse UI", everything red) matches Wallah's
  "आंखों में चुभे" stress state.

### L21-3 Shade generation as arithmetic: touch HSL's S/L, freeze the H
- Problem [7:47–7:54]: shades made by dragging Figma's color-picker slider — "बट दिस इज़ नॉट द
  प्रोफेशनल वे" → "but this is not the professional way."
- Decision [8:44–10:28]: use HSL. Freeze hue (changing it "ये कलर ही चेंज देगा" → "changes the
  color itself", 9:01–9:05); the shade comes from saturation and lightness: "लाइटनेस को 10 यूनिट
  अप 10 यूनिट डाउन करके उसका एक शेड बनाएंगे" → "move Lightness 10 units up or 10 units down to
  create each shade" (9:36–9:41); move lightness down → darker shade, up → lighter shade
  (9:27–9:34). Concrete sequence: base lightness 42 → 52 (lighter) → 62; 42 → 32 (darker) → 22;
  use 5-unit jumps instead when you want subtle, non-jumpy steps ("पांच-पांच भी बढ़ा सकते हो… हल्का
  सा सटल शेड रहे", 9:56–10:03 [translated-from-hi]).
- Named tool trick (explicit 9:42–9:50): in Figma's HSL field, hold Shift + press the up/down
  arrow key to step the lightness value by 10.
- Code-format segment [8:02–8:53]: hex = the six digits after the hashtag (8:04–8:10); RGB and
  CSS are the same values, CSS just wraps them with an "a" (opacity, always written 1) in
  brackets (8:21–8:29); HSL = Hue, Saturation, Lightness; HSB = Hue, Saturation, Brightness
  (8:44–8:49); "इसमें ज्यादा फर्क नहीं होता। बट… जब आप शेड्स क्रिएट करते हो तो आप HSL यूज़ करते हो" →
  "not much difference between them; but when you create shades, you use HSL" (8:49–8:54).
- Reasoning (explicit 10:24–10:27): "ऐसे ही आप कलर सिस्टम्स बनाते हो, कलर पैलेट्स बनाते हो… तो ये बेस
  है" → "This is how you build color systems and palettes — this is the base."
- Frames: none (download blocked). Slides/screens referenced: Figma color picker with hex shown
  (8:02–8:10), HSL dropdown demo (8:55+), shift-arrow increments visible as numbers 42/52/32/62/22
  (9:44–10:19), the resulting shade stack ("कलर पैलेट एक शेड क्रिएट हो रहा है" — the palette
  forming, 10:19–10:23). All transcript-only.
- Expected effect: reproducible tint/shade ramps (the same ramp logic video-24's mid-level uses
  with its 4-swatch pink scale), shared consistently across a design system.
- Fails: perceptual-uniform spaces (OKLCH) where equal L steps don't look equal [interp]; copying
  his ±10 blindly for very light brand hues.
- Transfer: generate palettes by numbers (L ±10 or ±5) instead of eyeballing; document the ramp
  as tokens.

### L21-4 Contrast critique test: many hues vs one hue + readable accent (mini-critique)
- Problem [10:29–10:44]: a UI cramming many colors — one green element called out:
  "ग्रीन कलर इसका भी कंट्रास्ट अच्छा नहीं है" → "the green one also has bad contrast" — plus a
  separate background block competing with the content.
- Decision [10:45–11:04]: the checklist implied by his "if you hide the [bad] UI you'd think it's
  okay" test — "मिनिलिस्टिक डिज़ाइन… नॉट कंफ्यूजिंग द यूज़र एंड आपको यूज़र को पता है कौन सा ब्रांड कलर
  है। प्राइमरी एक्शन कौन सा है" → "a minimalistic design that doesn't confuse the user, where the
  user knows which the brand color is and which the primary action is" (10:52–11:02).
- Reasoning (implied, not stated): contrast and restraint are what make hierarchy readable
  [interp] — he demonstrates rather than formulates a contrast rule.
- Frames: none (download blocked). Slides referenced: the bad multi-color UI and its minimal
  counterpart (10:32–11:02). Transcript-only.
- Expected effect: instant recognition of brand + primary action; fewer competing hues.
- Transfer: the two-question audit — "can the user name the brand color and the primary action
  in one glance?"

### L21-5 Resource funnel: pick from curated palette sites, then practice
- Decision [11:13–11:22]: "कुछ कलर वेबसाइट्स हैं जिनको मैं मेंशन कर दूंगा जहां से आप कलर पैलेट्स उठा
  सकते हो। फॉर एग्जांपल कलर हंट एंड वन इज़ coolers.com" → "some color websites… from where you can
  pick palettes, for example Color Hunt and coolers.com" [translated-from-hi; the transcript
  spells "coolers.com" — the well-known palette tool is coolors.co]. Links "in the description
  below", plus his existing UX videos for digestion of the bigger picture.
- Frames: none (download blocked).
- Transfer: source brand palettes from curated libraries, then systematize them with L21-3.

## Creator tendencies observed (feeds creator-profiles.md)

- Edtech lecture format: promises a practical-only syllabus up front ("बहुत ज्यादा थ्योरेटिकल हम
  नहीं समझेंगे… सारी चीजें प्रैक्टिकल सिनेरियो के साथ" → "we won't go too theoretical…" 1:05–1:13
  [translated-from-hi]), then delivers rule → own-worked-example → tool demo.
- Uses his own designs as the example set (anonymized product screens; "यह स्क्रीन ऑफिस डिज़ बाय
  मी ओनली" → "this screen is designed by me only", 5:13–5:15 [translated-from-hi]).
- Hindi + English code-switching; all design vocabulary in English (surface color, primary,
  accent, dominant, hex, HSL) — slides presumably English [unverified].
- Channel is PW Skills (edu-marketing): description carries course coupon codes/telegram links
  (platform plug, not in-video teaching); outgoing video recommends his earlier UX series.
- Rules stated as disambiguation ("don't confuse primary with dominant") — he teaches by clearing
  predictable beginner confusions.

## Unverified / not analyzed

- EVERYTHING visual except the cover thumbnail `t00-thumb-maxres.jpg` (v21 access failure
  documented at top). Specifically transcript-only: the psychology color-wheel slide (2:01–2:10),
  gradient-meaning bars (2:22–2:26, likely green/yellow/red status gradients), the basic
  60-30-10 slide (4:56–5:03), the three-screen percentage-overlay example (5:46–6:50), the
  primary-button slide (6:40–6:50), the Figma picker/HSL demo with the number shifts 42→52→62 and
  42→32→22 (7:56–10:23), the shade-stack result (10:19–10:23), and the bad-vs-minimal contrast
  pair (10:32–11:02).
- Whether slides were in English (assumed [interp]; speaker's English vocabulary + bilingual
  delivery strongly suggest it) — task asked to verify from content; could not.
- "How to maintain good color contrast" was promised in the intro (0:29–0:32 [translated-from-hi])
  but is delivered only as the short L21-4 example; no contrast-ratio guidance, no
  accessibility/contrast layer. Claimed-vs-delivered gap, honestly noted.
- Color harmonies (complementary/triadic/analogous wheels) are NOT taught in this video despite
  the topic family name "color theory"; the only harmony-adjacent rule is 60-30-10 proportion
  (verified from full transcript read).
- Sponsor segments: none detected in the video; the channel/course promotion lives in the
  video description (PW Skills coupons) and end-card pointers. Not mined.
- The claimed "एग्जांपल बताऊंगा" (he promises to show semantic-color examples later in the video,
  2:44–2:47) — the promised examples of alert/success messages never clearly materialize beyond
  the end critique; possible script edit [interp], transcript-only note.

## Quotable diagnostics (all translated-from-hi unless noted English)

- "रेड का मतलब बाय डिफॉल्ट पता है कि इट्स अ साइन ऑफ अलर्ट डेंजर" — "Red by default means alert/danger."
- "कॉर्पोरेट में मोस्टली ब्लू कलर के लोगो देखोगे क्योंकि वो कलर के पीछे का ट्रस्ट फैक्टर है" — "Corporate
  logos are mostly blue because blue is the trust factor behind the color."
- "जहां पे भी इरिवर्सिबल एक्शन होता है वहां पे आप रेड कलर यूज़ करते हो" — "Wherever there's an
  irreversible action, you use red there." (3:34)
- "इससे ज्यादा इंपॉर्टेंट होता है कैसे उन कलर्स को यूज़ कर रहे हो" — "More important than which colors
  you choose is how you use them." (4:15)
- "लोग इस वाइट को भूल जाते हैं… नहीं इट्स कॉल्ड सरफेस कलर" — "People forget the white — no, it's
  called the surface color. Gray, black, or white — you must count it too." (6:02–6:15)
- "एक्सेंट… बहुत ही कम क्वांटिटी में यूज़ करते हो बट इट स्टैंड्स आउट क्लियरली" — "Accent is used in very
  small quantity but it stands out clearly." (7:04–7:09)
- "लाइटनेस को 10 यूनिट अप 10 यूनिट डाउन करके उसका एक शेड बनाएंगे" — "Move lightness 10 units up or
  10 down to create a shade." (9:36)
- "ऐसे ही आप कलर सिस्टम्स बनाते हो, कलर पैलेट्स बनाते हो" — "This is how you build color systems
  and palettes." (10:25)
