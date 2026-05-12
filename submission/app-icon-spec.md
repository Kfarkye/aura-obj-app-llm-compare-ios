# App Icon Spec

The icon must be recognizable at 60px, use standard geometric forms, and avoid any literal depictions of robots, brains, or chat bubbles. No text or letters.

**Color Palette:**
- Background: Warm cream / off-white (`#F5F2EC`).
- Foreground: Off-black (`#1A1A1A`) and Accent Green (`#2B5F3F`).

## The Parallel Lines Concept
Three vertical lines of equal weight (width), but slightly different heights (medium, tall, short), standing parallel to each other. 
The middle (tall) line is highlighted in the Accent Green (`#2B5F3F`), while the outer two lines are Off-black (`#1A1A1A`).

*Meaning:* Three models evaluated in parallel, one chosen as the winner. Clean, abstract, and instantly reads as "data" or "comparison."

## SVG Representation

```xml
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="#F5F2EC"/>
  
  <!-- Left Line (Medium, Off-black) -->
  <rect x="256" y="312" width="100" height="400" rx="50" fill="#1A1A1A"/>
  
  <!-- Center Line (Tall, Accent Green) -->
  <rect x="462" y="212" width="100" height="600" rx="50" fill="#2B5F3F"/>
  
  <!-- Right Line (Short, Off-black) -->
  <rect x="668" y="412" width="100" height="200" rx="50" fill="#1A1A1A"/>
</svg>
```

**Export Requirements:**
Ensure this vector concept is exported at the following precise sizes:
- 1024x1024 (Marketing image / App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone Spotlight)
- 80x80 (iPad Spotlight)
- 76x76 (iPad Legacy)
- 60x60 (Settings Legacy)
- 58x58 (Settings)
- 40x40 (Spotlight Legacy)
