# 🎬 Demo Recording Guide

Complete guide for recording professional component demos at 1080x1350px (Instagram/TikTok portrait) at 4x resolution.

## 📋 Prerequisites

### 1. Install Screen Studio
```bash
brew install --cask screen-studio
```

**Alternative**: If Screen Studio isn't available, use OBS Studio:
```bash
brew install --cask obs
```

### 2. Start Development Server
```bash
cd frontend
npm run dev
```

## 🎯 Demo Routes Available

Visit `http://localhost:3000/demo` to see all available demos:

| Route | Component | Duration | Description |
|-------|-----------|----------|-------------|
| `/demo/map` | Interactive Map | 10s | Map with markers, clustering, navigation |
| `/demo/add` | Creation Form | 10s | Full form with photo upload, location picker |
| `/demo/detail/hermogenes` | Detail Page | 8s | Rich story content with images |
| `/demo/research` | Research Mode | 12s | GIS analysis, charts, spatial filters |

## 🎥 Recording Setup (Screen Studio)

### Step 1: Configure Screen Studio

1. **Open Screen Studio**
2. **Set Recording Area**:
   - Click "Custom Area"
   - Set dimensions: **1080 x 1350 pixels**
   - Position over the white demo container (ignore black background)

3. **Quality Settings**:
   - Resolution: **4K (4320 x 5400)** ← This gives you 4x
   - Frame Rate: **60 FPS**
   - Quality: **High**

4. **Effects** (Optional but recommended):
   - ✅ Smooth Cursor
   - ✅ Cursor Highlight
   - ✅ Zoom on Click
   - ✅ Auto-zoom to Actions

### Step 2: Recording Workflow

For each component:

1. **Navigate to demo route** (e.g., `http://localhost:3000/demo/map`)
2. **Wait 2 seconds** for everything to load
3. **Start Screen Studio recording**
4. **Perform interactions** (see scripts below)
5. **Stop recording** after 5-10 seconds
6. **Export** as MP4 (1080x1350, downscaled from 4K)

## 📝 Recording Scripts

### 1. Map Demo (`/demo/map`)
**Duration**: 10 seconds

```
0:00 - Page loads, map visible
0:01 - Hover over cluster (shows count)
0:02 - Click cluster (zooms in)
0:04 - Hover over individual marker
0:05 - Click marker (opens popup)
0:07 - Pan map slightly
0:09 - Zoom out
0:10 - End
```

**Interactions**:
- Smooth mouse movements
- Pause on important elements
- Show clustering → individual markers → popup flow

---

### 2. Add Form Demo (`/demo/add`)
**Duration**: 10 seconds

```
0:00 - Form visible at top
0:01 - Scroll down slowly
0:02 - Click "Nombre" field
0:03 - Type "Animita de..." (show autocomplete)
0:05 - Click location picker
0:06 - Map appears, click location
0:08 - Scroll to photo upload
0:09 - Hover over upload button
0:10 - End
```

**Interactions**:
- Show form validation
- Demonstrate autocomplete
- Highlight location picker
- Preview photo upload area

---

### 3. Detail Page Demo (`/demo/detail/hermogenes`)
**Duration**: 8 seconds

```
0:00 - Page loads with hero image
0:01 - Scroll down to story
0:02 - Pause on story text (show rich content)
0:04 - Scroll to insights section
0:05 - Hover over death cause badge
0:06 - Scroll to feedback buttons
0:07 - Click helpful button (shows animation)
0:08 - End
```

**Interactions**:
- Smooth scrolling
- Pause on key content
- Show interactive elements
- Demonstrate feedback system

---

### 4. Research Mode Demo (`/demo/research`)
**Duration**: 12 seconds

```
0:00 - Map loads
0:01 - Click "Research Mode" toggle in header
0:02 - Sidebar appears with charts
0:03 - Hover over bar chart
0:04 - Click bar (filters map)
0:06 - Map updates with filtered markers
0:07 - Click histogram
0:08 - Heatmap appears
0:10 - Pan map to show density
0:12 - End
```

**Interactions**:
- Show toggle activation
- Demonstrate filtering
- Highlight chart interactions
- Show spatial analysis

## 🎨 Screen Studio Tips

### Cursor Effects
- **Smooth Cursor**: Makes mouse movement fluid
- **Cursor Highlight**: Adds subtle glow on click
- **Auto-zoom**: Zooms into clicked areas (great for small buttons)

### Export Settings
```
Format: MP4
Resolution: 1080 x 1350 (downscaled from 4K)
Frame Rate: 60 FPS
Codec: H.264
Quality: High (CRF 18-20)
```

### Post-Processing
Screen Studio automatically adds:
- Smooth cursor trails
- Click animations
- Zoom effects on interactions
- Professional polish

## 🎬 Alternative: OBS Studio Setup

If using OBS instead:

### Canvas Settings
```
Base Canvas: 4320 x 5400 (4x resolution)
Output: 1080 x 1350 (scaled down)
FPS: 60
```

### Recording Settings
```
Encoder: x264
Rate Control: CRF
CRF: 18
Preset: Medium
Profile: High
```

### Workflow
1. Add "Browser Source" in OBS
2. URL: `http://localhost:3000/demo/map`
3. Width: 1080, Height: 1350
4. Custom CSS to hide scrollbars:
   ```css
   body { overflow: hidden !important; }
   ```
5. Start recording
6. Interact with browser source
7. Stop and export

## 📤 Export Checklist

After recording each demo:

- [ ] Video is exactly 1080 x 1350 pixels
- [ ] Duration is 5-12 seconds
- [ ] 60 FPS maintained
- [ ] No black borders (crop if needed)
- [ ] Audio removed (unless you add voiceover)
- [ ] File size < 50MB (for Instagram)

## 🎯 Recommended Export Formats

### Instagram Reels
```
Resolution: 1080 x 1350
Aspect Ratio: 4:5
Frame Rate: 30 FPS (can reduce from 60)
Max Duration: 90s
Max Size: 4GB
```

### TikTok
```
Resolution: 1080 x 1350 (or 1080 x 1920)
Aspect Ratio: 4:5 (or 9:16)
Frame Rate: 30 FPS
Max Duration: 10 minutes
Max Size: 287.6 MB
```

### Twitter/X
```
Resolution: 1080 x 1350
Aspect Ratio: 4:5
Frame Rate: 30-60 FPS
Max Duration: 2:20
Max Size: 512 MB
```

## 🚀 Quick Start

```bash
# 1. Start dev server
npm run dev

# 2. Open demo index
open http://localhost:3000/demo

# 3. Open Screen Studio
# 4. Set recording area to 1080x1350
# 5. Navigate to desired demo route
# 6. Record!
```

## 💡 Pro Tips

1. **Hide the REC indicator**: Edit `app/demo/layout.tsx` and remove the red recording dot before final recordings

2. **Add text overlays**: Use Screen Studio's text tool to add captions like:
   - "Explora animitas en todo Chile"
   - "Agrega nuevas historias"
   - "Análisis espacial avanzado"

3. **Music**: Add background music in Screen Studio or post-production

4. **Batch recording**: Record all demos in one session for consistency

5. **Test first**: Do a test recording to verify dimensions and quality

## 🐛 Troubleshooting

### Map not loading
- Ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env`
- Check browser console for errors

### Wrong dimensions
- Use browser DevTools to verify container is exactly 1080x1350
- Check Screen Studio recording area matches

### Low quality
- Ensure 4K recording is enabled in Screen Studio
- Check export settings use High quality preset

### Performance issues
- Close other applications
- Reduce browser zoom to 100%
- Disable browser extensions

---

**Ready to record professional demos! 🎥**

For questions or issues, check the main documentation or open an issue.
