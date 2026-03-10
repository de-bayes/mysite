// 3D Skills & Interests Scatter Plot — Redesigned
(function () {
  const container = document.getElementById('viz-container');
  const canvas = document.getElementById('scatter-canvas');
  const tooltip = document.getElementById('scatter-tooltip');
  if (!container || !canvas) return;

  // ===== DATA: Ryan's skills & interests =====
  const skills = [
    { name: 'Python', proficiency: 8, passion: 9, years: 4, importance: 1.3 },
    { name: 'JavaScript', proficiency: 7, passion: 7, years: 3, importance: 1.1 },
    { name: 'Bayesian Analysis', proficiency: 7, passion: 9.5, years: 3, importance: 1.4 },
    { name: 'Election Forecasting', proficiency: 8.5, passion: 10, years: 4, importance: 1.5 },
    { name: 'Prediction Markets', proficiency: 9, passion: 9, years: 3, importance: 1.3 },
    { name: 'Data Science', proficiency: 7.5, passion: 8.5, years: 3, importance: 1.2 },
    { name: 'Monte Carlo Simulation', proficiency: 6.5, passion: 8, years: 2, importance: 1.0 },
    { name: 'Photography', proficiency: 7, passion: 8, years: 3, importance: 1.1 },
    { name: 'Constitutional Law', proficiency: 6, passion: 9, years: 5, importance: 1.2 },
    { name: 'Campaign Finance', proficiency: 7, passion: 7.5, years: 2, importance: 1.0 },
    { name: 'Journalism', proficiency: 6.5, passion: 7, years: 2, importance: 0.9 },
    { name: 'Swimming', proficiency: 6, passion: 7, years: 8, importance: 1.0 },
    { name: 'Podcasting', proficiency: 6, passion: 7, years: 4, importance: 0.9 },
    { name: 'Adobe Lightroom', proficiency: 7, passion: 6, years: 3, importance: 0.7 },
    { name: 'Git', proficiency: 7, passion: 5, years: 3, importance: 0.7 },
    { name: 'Kelly Criterion', proficiency: 7, passion: 8.5, years: 2, importance: 1.0 },
    { name: 'Quantitative Forecasting', proficiency: 8, passion: 9.5, years: 3, importance: 1.3 },
    { name: 'Voting Theory', proficiency: 6.5, passion: 8, years: 4, importance: 1.0 },
    { name: 'Cloud Computing', proficiency: 5, passion: 6, years: 2, importance: 0.7 },
    { name: 'Game Theory', proficiency: 6, passion: 8, years: 3, importance: 0.9 },
    { name: 'Hockey', proficiency: 4, passion: 5, years: 3, importance: 0.7 },
    { name: 'Science', proficiency: 4, passion: 5, years: 4, importance: 0.7 },
  ];

  // ===== Normalize data to fit a tight cube (0–8 range) =====
  const dataCenter = { x: 5, y: 5, z: 4 };

  // ===== SCENE SETUP =====
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  // Use a tighter field of view and pull the camera closer
  const width = container.clientWidth;
  const height = container.clientHeight || 500;
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
  camera.position.set(16, 12, 16);
  camera.lookAt(dataCenter.x, dataCenter.y, dataCenter.z);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff, 1);

  // Scissor test: clip rendering to the canvas bounds exactly
  renderer.setScissorTest(true);

  // ===== ORBIT CONTROLS =====
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.target.set(dataCenter.x, dataCenter.y, dataCenter.z);
  controls.maxDistance = 26;
  controls.minDistance = 8;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.minPolarAngle = Math.PI * 0.1;
  controls.update();

  // ===== AXES =====
  const axisColor = 0xd0d0d0;

  function createLine(start, end, color) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ]);
    const mat = new THREE.LineBasicMaterial({ color: color || axisColor });
    return new THREE.Line(geo, mat);
  }

  // Main axes
  scene.add(createLine([0, 0, 0], [11, 0, 0]));
  scene.add(createLine([0, 0, 0], [0, 11, 0]));
  scene.add(createLine([0, 0, 0], [0, 0, 9]));

  // Tick marks
  for (let i = 2; i <= 10; i += 2) {
    scene.add(createLine([i, -0.12, 0], [i, 0.12, 0]));
    scene.add(createLine([-0.12, i, 0], [0.12, i, 0]));
  }
  for (let i = 2; i <= 8; i += 2) {
    scene.add(createLine([0, -0.12, i], [0, 0.12, i]));
  }

  // Subtle grid on the XY back plane (z=0) only
  const gridColor = 0xf0f0f0;
  for (let i = 2; i <= 10; i += 2) {
    scene.add(createLine([i, 0, 0], [i, 11, 0], gridColor));
    scene.add(createLine([0, i, 0], [11, i, 0], gridColor));
  }

  // ===== AXIS LABELS =====
  function makeLabel(text, position) {
    const cvs = document.createElement('canvas');
    cvs.width = 512;
    cvs.height = 128;
    const ctx = cvs.getContext('2d');
    ctx.font = '48px "Times New Roman", Georgia, serif';
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(...position);
    sprite.scale.set(2.8, 0.7, 1);
    return sprite;
  }

  scene.add(makeLabel('Proficiency', [5.5, -0.8, 0]));
  scene.add(makeLabel('Passion', [-1.0, 5.5, 0]));
  scene.add(makeLabel('Years', [0, -0.8, 4.5]));

  // ===== DATA POINTS =====
  const spheres = [];
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  const baseGeo = new THREE.SphereGeometry(1, 32, 32);

  skills.forEach((skill, i) => {
    const x = skill.proficiency;
    const y = skill.passion;
    const z = skill.years;
    const size = 0.15 * skill.importance;

    // Color: map passion to a blue gradient
    const t = skill.passion / 10;
    const color = new THREE.Color().setHSL(
      0.6,
      0.45 + t * 0.35,
      0.82 - t * 0.3
    );

    const mat = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0,
      roughness: 0.4,
      metalness: 0.05,
    });

    const mesh = new THREE.Mesh(baseGeo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(0, 0, 0);
    mesh.userData = { skill, index: i, targetScale: size, baseY: y };
    sphereGroup.add(mesh);
    spheres.push(mesh);
  });

  // ===== REGRESSION PLANE =====
  const n = skills.length;
  let sx = 0, sy = 0, sz = 0, sxx = 0, szz = 0, sxz = 0, sxy = 0, szy = 0;
  skills.forEach(s => {
    sx += s.proficiency; sy += s.passion; sz += s.years;
    sxx += s.proficiency * s.proficiency;
    szz += s.years * s.years;
    sxz += s.proficiency * s.years;
    sxy += s.proficiency * s.passion;
    szy += s.years * s.passion;
  });
  const mx = sx / n, my = sy / n, mz = sz / n;
  const Sxx = sxx - n * mx * mx;
  const Szz = szz - n * mz * mz;
  const Sxz = sxz - n * mx * mz;
  const Sxy = sxy - n * mx * my;
  const Szy = szy - n * mz * my;
  const det = Sxx * Szz - Sxz * Sxz;
  const b1 = det !== 0 ? (Szz * Sxy - Sxz * Szy) / det : 0;
  const b2 = det !== 0 ? (Sxx * Szy - Sxz * Sxy) / det : 0;
  const a_coeff = my - b1 * mx - b2 * mz;

  const planeGeo = new THREE.PlaneGeometry(1, 1, 10, 10);
  const planeVerts = planeGeo.attributes.position;

  for (let i = 0; i < planeVerts.count; i++) {
    let px = planeVerts.getX(i);
    let pz = planeVerts.getY(i);
    const xVal = 1 + px * 9;
    const zVal = 0.5 + pz * 8;
    const yVal = a_coeff + b1 * xVal + b2 * zVal;
    planeVerts.setXYZ(i, xVal, yVal, zVal);
  }
  planeGeo.computeVertexNormals();

  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x2244cc,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  scene.add(planeMesh);

  // ===== LIGHTING =====
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
  dirLight.position.set(10, 15, 10);
  scene.add(dirLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  // ===== RAYCASTING (hover) =====
  const raycaster = new THREE.Raycaster();
  const mouseVec = new THREE.Vector2(-999, -999);
  let hoveredMesh = null;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  canvas.addEventListener('mouseleave', () => {
    mouseVec.set(-999, -999);
    if (tooltip) tooltip.classList.remove('visible');
  });

  function updateTooltip() {
    raycaster.setFromCamera(mouseVec, camera);
    // Use a slightly larger bounding sphere for easier picking
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      if (mesh !== hoveredMesh) {
        if (hoveredMesh) resetHover(hoveredMesh);
        hoveredMesh = mesh;
        mesh.scale.setScalar(mesh.userData.targetScale * 1.5);
      }
      if (tooltip) {
        const skill = mesh.userData.skill;
        tooltip.innerHTML = '<strong>' + skill.name + '</strong><br>Proficiency: ' + skill.proficiency + ' &middot; Passion: ' + skill.passion + ' &middot; ' + skill.years + 'yr';
        const pos = mesh.position.clone().project(camera);
        const rect = canvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const tx = (pos.x + 1) / 2 * rect.width + rect.left - containerRect.left + 14;
        const ty = (-pos.y + 1) / 2 * rect.height + rect.top - containerRect.top - 10;
        // Clamp tooltip within container
        tooltip.style.left = Math.min(Math.max(tx, 0), containerRect.width - 180) + 'px';
        tooltip.style.top = Math.min(Math.max(ty, 0), containerRect.height - 40) + 'px';
        tooltip.classList.add('visible');
      }
    } else {
      if (hoveredMesh) {
        resetHover(hoveredMesh);
        hoveredMesh = null;
      }
      if (tooltip) tooltip.classList.remove('visible');
    }
  }

  function resetHover(mesh) {
    mesh.scale.setScalar(mesh.userData.targetScale);
  }

  // ===== ENTRANCE ANIMATION =====
  const startTime = performance.now();
  const entranceDuration = 1800;
  const planeFadeDelay = 1200;
  const planeFadeDuration = 800;
  let animationComplete = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  const cameraStart = new THREE.Vector3(20, 14, 20);
  const cameraEnd = new THREE.Vector3(16, 12, 16);

  // ===== ANIMATION LOOP =====
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const elapsed = now - startTime;

    // Entrance
    if (!animationComplete) {
      const camT = Math.min(elapsed / 2200, 1);
      camera.position.lerpVectors(cameraStart, cameraEnd, easeOutCubic(camT));

      spheres.forEach((mesh, i) => {
        const delay = i * 50;
        const t = Math.max(0, Math.min((elapsed - delay) / 500, 1));
        const ease = easeOutCubic(t);
        const s = mesh.userData.targetScale * ease;
        mesh.scale.set(s, s, s);
        mesh.material.opacity = ease * 0.88;
      });

      const planeT = Math.max(0, Math.min((elapsed - planeFadeDelay) / planeFadeDuration, 1));
      planeMat.opacity = easeOutCubic(planeT) * 0.1;

      if (elapsed > entranceDuration + planeFadeDelay + planeFadeDuration) {
        animationComplete = true;
      }
    }

    // Gentle floating
    const floatTime = now * 0.0008;
    spheres.forEach((mesh, i) => {
      const offset = Math.sin(floatTime + i * 0.6) * 0.03;
      mesh.position.y = mesh.userData.baseY + offset;
    });

    updateTooltip();
    controls.update();

    // Render with scissor to prevent any bleed outside canvas bounds
    const rect = canvas.getBoundingClientRect();
    renderer.setScissor(0, 0, rect.width * renderer.getPixelRatio(), rect.height * renderer.getPixelRatio());
    renderer.setViewport(0, 0, rect.width, rect.height);
    renderer.render(scene, camera);
  }

  animate();

  // ===== RESIZE =====
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, 100);
  });
})();
