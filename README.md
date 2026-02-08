# OpticBench

Interactive web application for machine vision engineers to plan optimal camera sensor, lens, and working distance combinations.

**Live Demo:** [https://kaib89.github.io/OpticBench/](https://kaib89.github.io/OpticBench/)

## Features

- **44 pre-installed industrial sensors** (Sony IMX, FLIR, Basler, etc.) with full specs
- **7 default lenses** plus a generic lens for custom focal lengths
- **Real-time optical calculations** using thin lens equation (FOV, magnification, depth of field, resolution)
- **Interactive canvas visualization** with ray tracing, zoom, and pan
- **Horizontal & vertical layout** toggle for the optical path diagram
- **H / V / D axis toggle** to view horizontal, vertical, or diagonal field of view
- **Custom database** – add, edit, duplicate, and delete sensors, lenses, and targets
- **Persistent storage** via IndexedDB (user data survives page reloads)
- **Validation warnings** for image circle coverage, minimum working distance, and more

## Getting Started

```bash
git clone https://github.com/kaib89/OpticBench.git
cd OpticBench
npm install
npm run dev
```

Open [http://localhost:5173/OpticBench/](http://localhost:5173/OpticBench/) in your browser.

## Tech Stack

- React 18 + TypeScript (strict mode)
- Vite
- Tailwind CSS v4
- Zustand (state management)
- HTML5 Canvas (ray tracing visualization)
- IndexedDB via `idb` (persistent user data)

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
