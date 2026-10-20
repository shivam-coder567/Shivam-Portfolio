# Shivam Mishra | Full-Stack Developer

Responsive React and Vite portfolio with a rotating Three.js Earth globe, projects, skills, and internship contact information.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Create a production build with `npm run build`.

## Personalize before publishing

- Replace the email, GitHub and LinkedIn placeholders in `src/data/portfolio.js`.
- Add your resume as `public/resume.pdf`.
- Add Code and Live demo URLs in `src/data/projects.js` when those links are available. Empty values hide the buttons.
- Add project screenshots at `src/assets/projects/mindsync.png`, `dsa-memory-companion.png`, and `ai-expiry-tracker.png`. Cards show a gradient placeholder until a screenshot is present.

The About section includes a small terminal. Try `help`, `about`, `skills`, `projects`, `contact`, `resume`, `github`, and `clear`; use Up/Down for command history and Tab to complete a command.

The Earth texture is served locally from `public/textures/earth_atmos_2048.jpg`. The globe uses React Three Fiber and Drei, pauses outside the viewport or when the tab is hidden, and honors reduced-motion preferences.

## Structure

```text
src/components/       Page sections and the React Three Fiber globe
src/data/projects.js  Project descriptions, tags, image names and links
src/assets/projects/  Optional project screenshots
public/textures/      Locally bundled Earth surface texture
```
