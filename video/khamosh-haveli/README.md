# KHAMOSH HAVELI — 60s horror teaser

An original Hinglish mystery/horror trailer, made entirely in code with Remotion
(no stock footage, no samples, no copyright issues).

**Story:** A Rajasthan haveli where time stopped in 1947. Journalist Rhea arrives
for a story, is not alone in the corridor, and finds her own photograph in a
75-year-old album.

## Files
| Path | What it is |
|---|---|
| `src/timeline.ts` | Scene timings + narration lines (single source of truth) |
| `src/scenes.tsx` | All 11 animated scenes (haveli, clock, corridor ghost, album, jump scare, title) |
| `src/fx.tsx` | Film look: grain, letterbox, teal/amber grade, fog, dust, subtitles |
| `scripts/make_soundtrack.py` | Synthesizes the score + all sound effects in sync |
| `scripts/make_voice.sh` | Adds Hindi narration voice (Piper, free) and re-mixes |

## Commands
```bash
npm install
python3 scripts/make_soundtrack.py        # needs numpy + scipy
npm run studio                            # live preview / tweak in the browser
npm run render                            # -> out/khamosh-haveli.mp4
bash scripts/make_voice.sh && npm run render   # with spoken narration
```
