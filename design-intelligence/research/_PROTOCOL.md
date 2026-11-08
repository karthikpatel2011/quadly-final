# Analysis Protocol for delegated video analysts (videos 02–12)

You are a design research analyst. Your output is `research/video-NN.md` — deep, evidence-backed
design notes in the exact format of `research/video-01.md` (read it first as the template and
quality bar). Everything below is binding.

## Inputs

- Transcript: `design-intelligence/media/transcripts/video-NN.txt` (lines are `[M:SS] caption text`)
- Metadata: `design-intelligence/media/metadata/<VIDEOID>.json` (title, channel, chapters, duration)
- Working dir: `/home/zenith/Documents/quadly final/design-intelligence/`
- Full example of required quality: `research/video-01.md`

## Mandatory procedure

1. Read the transcript COMPLETELY, in chunks. Note every design decision discussed.
2. Read chapters from the metadata JSON (`jq -r '.chapters[] | "\(.start_time) \(.title)"' <file>`).
3. Get visual evidence:
   - Whole video ≤ ~20 min: `yt-dlp -f "bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720]" -o "media/segments/video-NN.%(ext)s" "https://youtu.be/<ID>"`
   - Longer video: same but add `--download-sections "*START-END" --force-keyframes-at-cuts` per chapter/segment (START/END as M:SS or H:MM:SS), one segment file at a time to limit disk.
   - Extract frames: `ffmpeg -loglevel error -ss "M:SS" -i <segment> -frames:v 1 -vf "scale=1280:-1" -q:v 3 "media/frames/video-NN/tXXmYYmZZ.jpg" -y`
   - Pick ~12–25 timestamps spread over the whole video, prioritizing moments where the creator
     changes layout, type, spacing, color, components, hierarchy, navigation, motion, or shows
     before/after. If a frame catches a transition, re-extract ±2s.
4. VIEW EVERY EXTRACTED FRAME with the Read tool before citing it. Never cite an unviewed frame.
5. Write `research/video-NN.md` in the video-01.md format: Identity → Structure → Teaching format →
   Lesson log (L NN-1, L NN-2 …) → Creator tendencies → Unverified/not analyzed → Quotable diagnostics.
6. Every lesson MUST have: problem, decision, reasoning (explicit quote or "not stated"), evidence
   (transcript timestamp + viewed frame filenames), implementation method, expected effect,
   when appropriate / when it fails, transfer to other projects.

## Integrity rules (violations invalidate your work)

- NEVER invent content, quotes, timestamps, frames, or tools. If content is missing say so.
- Prefix provenance: `transcript:` = creator said it · frame filenames = you verified visually ·
  `[interp]` = your own inference. Keep these separate.
- Ideas the creator only implies must stay inferences, not quotes.
- Note sponsor/ad segments as such; do not mine them for lessons.
- If the transcript mentions visuals you could not verify by frame, list them under
  "Unverified / transcript-only observations" with timestamps.
- Do not edit any file except your own video-NN.md. Do not touch processing-status.md,
  source-registry.md, or other videos' files.

## Special cases

- **Video 12 (Hindi full course):** the transcript `video-12.hi-raw.txt` is Hindi machine captions.
  Read it (you can read Hindi), translate every quoted line into English, and mark such quotes
  `translated-from-hi`. The video file must be analyzed via `--download-sections` in ≤ 20-min
  chunks. Sample frames at least every ~5 minutes of your assigned range plus all moments where
  the screen shows Figma/UI work. Write `research/video-12-part-X.md` (X = your part letter),
  covering ONLY your assigned time range, with a segment-by-segment lesson log.
- Interview/podcast videos (e.g. video-08): log insights as spoken advice (label speaker when the
  transcript distinguishes host vs guest), and only add frame evidence when visuals are actual
  design material rather than talking heads.

## Final message back

Summarize: videos processed, # lessons extracted, # frames viewed, biggest cross-cutting findings,
any access problems or coverage gaps. Be specific and honest.
