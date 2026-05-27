# Lusajo D. Kusekwa — Portfolio

Personal portfolio website built with vanilla JavaScript, Three.js, and Vite.

**kusekwa.space**

## Tech

- Vite (build tool)
- Three.js (3D background)
- Plain CSS with custom properties
- Docker + Nginx (deployment)

## Development

```bash
npm install
npm run dev
```

## Deployment

Every push to `main` triggers a GitHub Actions workflow that builds and pushes a Docker image to `ghcr.io/thatkidriroo/my-portfolio:latest`. The live site runs from that image on a homelab server behind Cloudflare Tunnel.

## Project structure

```
├── index.html          # All HTML content (17 slides)
├── src/
│   ├── main.js         # Scroll interaction, drag-to-scroll, snap
│   ├── scene.js        # Three.js 3D scene
│   └── style.css       # All styles
├── public/
│   └── og-image.jpg    # Social preview image
├── Dockerfile
├── compose.yml
└── .github/workflows/  # CI/CD
```
