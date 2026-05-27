import * as THREE from 'three';

export function createScene(slideCount) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f0);

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, isMobile ? 16 : 14);

  const renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.style.position = 'fixed';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  renderer.domElement.style.width = '100vw';
  renderer.domElement.style.height = '100vh';
  renderer.domElement.style.zIndex = '-1';
  renderer.domElement.style.pointerEvents = 'none';
  document.body.prepend(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffeedd, 0.6);
  scene.add(ambient);

  const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
  dir1.position.set(5, 10, 5);
  scene.add(dir1);

  const dir2 = new THREE.DirectionalLight(0xffddbb, 0.3);
  dir2.position.set(-5, 3, 5);
  scene.add(dir2);

  const accentColors = [0xfcac14, 0x4a6cf7, 0xff6b8a, 0xfcac14, 0x4a6cf7, 0xff6b8a];
  const detail = isMobile ? 0 : 0;
  const geos = [
    () => new THREE.IcosahedronGeometry(0.5, detail),
    () => new THREE.OctahedronGeometry(0.45, detail),
    () => new THREE.TorusKnotGeometry(0.35, 0.1, isMobile ? 24 : 48, isMobile ? 4 : 6),
    () => new THREE.TorusGeometry(0.35, 0.12, isMobile ? 8 : 12, isMobile ? 24 : 48),
    () => new THREE.DodecahedronGeometry(0.4, detail),
    () => new THREE.TetrahedronGeometry(0.45, detail),
  ];

  const smallGeos = [
    () => new THREE.IcosahedronGeometry(0.15, detail),
    () => new THREE.OctahedronGeometry(0.12, detail),
    () => new THREE.TetrahedronGeometry(0.12, detail),
  ];

  const unit = 11;
  const shapes = [];
  const allMeshes = [];

  function addShape(geo, mat, x, y, z, rotSpeed) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    if (rotSpeed) mesh.userData.rotSpeed = rotSpeed;
    scene.add(mesh);
    allMeshes.push(mesh);
    return mesh;
  }

  for (let i = 0; i < slideCount; i++) {
    const color = accentColors[i % accentColors.length];
    const cx = i * unit + unit * 0.5;

    /* ── Main shape ── */
    const geo = geos[i % geos.length]();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const mesh = addShape(geo, mat,
      cx + (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 8 - 2,
      { x: (Math.random() - 0.5) * 0.005, y: (Math.random() - 0.5) * 0.005 },
    );
    mesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);

    const edges = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12,
    });
    mesh.add(new THREE.LineSegments(edges, edgeMat));

    /* ── Companion shape ── */
    const sGeo = smallGeos[i % smallGeos.length]();
    const sMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      metalness: 0.3,
      transparent: true,
      opacity: 0.5,
    });
    const sMesh = addShape(sGeo, sMat,
      cx + (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 6 - 1,
      { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008 },
    );
    sMesh.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);

    shapes.push({
      mesh,
      origX: cx,
      origY: mesh.position.y,
      origZ: mesh.position.z,
      rot: mesh.userData.rotSpeed,
      floatSpeed: 0.15 + Math.random() * 0.2,
      floatAmp: 0.1 + Math.random() * 0.15,
      slideIndex: i,
      edgeMat,
      mat,
      companion: sMesh,
      cOrigY: sMesh.position.y,
      cFloatSpeed: 0.2 + Math.random() * 0.25,
      cFloatAmp: 0.08 + Math.random() * 0.12,
      cMat: sMat,
      cRot: sMesh.userData.rotSpeed,
    });
  }

  /* ── Large background rings ── */
  const bgRingGeo = new THREE.TorusGeometry(3.5, 0.04, isMobile ? 6 : 8, isMobile ? 32 : 64);
  const ringCount = isMobile ? 4 : 8;
  for (let i = 0; i < ringCount; i++) {
    const color = accentColors[i % accentColors.length];
    const bgMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.04,
      wireframe: false,
    });
    const ring = new THREE.Mesh(bgRingGeo, bgMat);
    const t = i / 8;
    ring.position.set(
      t * slideCount * unit,
      (Math.random() - 0.5) * 8,
      -5 - Math.random() * 6,
    );
    const s = 1 + Math.random() * 2;
    ring.scale.set(s, s, s);
    ring.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    ring.userData.rotSpeed = {
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
    };
    scene.add(ring);
    allMeshes.push(ring);
    shapes.push({ ring, bgMat, t, origX: ring.position.x });
  }

  let scrollProgress = 0;
  function setScroll(n) { scrollProgress = n; }

  let mouseX = 0, mouseY = 0;
  if (!isMobile) {
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const totalUnits = slideCount * unit;
  let running = false;

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    const targetX = unit * 0.5 + scrollProgress * (totalUnits - unit);
    camera.position.x += (targetX - camera.position.x) * 0.035;

    const parallaxX = mouseX * 0.3;
    const parallaxY = mouseY * 0.2;

    shapes.forEach((s) => {
      if (s.ring) {
        s.ring.rotation.x += s.ring.userData.rotSpeed.x;
        s.ring.rotation.y += s.ring.userData.rotSpeed.y;
        const float = Math.sin(time * 0.3 + s.t * 4) * 0.3;
        s.ring.position.y = float;
        return;
      }

      s.mesh.rotation.x += s.rot.x;
      s.mesh.rotation.y += s.rot.y;

      const floatY = Math.sin(time * s.floatSpeed + s.slideIndex) * s.floatAmp;
      s.mesh.position.y = s.origY + floatY;

      const dist = Math.abs(s.origX - camera.position.x);
      const near = Math.max(0, 1 - dist / (unit * 0.8));

      s.mat.opacity = 0.2 + near * 0.65;
      s.edgeMat.opacity = 0.1 + near * 0.55;
      s.mesh.scale.setScalar(1 + near * 0.3);

      if (s.companion) {
        s.companion.rotation.x += s.cRot.x;
        s.companion.rotation.y += s.cRot.y;
        const cf = Math.sin(time * s.cFloatSpeed + s.slideIndex + 1) * s.cFloatAmp;
        s.companion.position.y = s.cOrigY + cf;
        s.cMat.opacity = 0.3 + near * 0.5;
        const cs = 1 + near * 0.2;
        s.companion.scale.setScalar(cs);
      }
    });

    camera.position.y += ((parallaxY) * 0.08 - camera.position.y) * 0.02;

    renderer.render(scene, camera);
  }

  function start() { running = true; animate(); }

  return { start, setScroll };
}
