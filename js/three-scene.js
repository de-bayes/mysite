// 3D Skills & Interests Scatter Plot
(function () {
  const container = document.getElementById('viz-container');
  const canvas = document.getElementById('scatter-canvas');
  const tooltip = document.getElementById('scatter-tooltip');
  if (!container || !canvas) return;

  // ===== DATA: Ryan's skills & interests =====
  // { name, proficiency (0-10), passion (0-10), years (0-8), importance (0.5-1.5) }
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

  // ===== SCENE SETUP =====
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const width = container.clientWidth;
  const height = container.clientHeight || 500;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(14, 10, 14);
  camera.lookAt(5, 5, 4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ===== ORBIT CONTROLS =====
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.target.set(5, 5, 4);
  controls.maxDistance = 30;
  controls.minDistance = 6;
  controls.update();

  // ===== AXES =====
  const axisColor = 0xcccccc;
  const axisLength = 11;

  function createAxis(start, end) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end)
    ]);
    const mat = new THREE.LineBasicMaterial({ color: axisColor });
    return new THREE.Line(geo, mat);
  }

  scene.add(createAxis([0, 0, 0], [axisLength, 0, 0])); // Proficiency
  scene.add(createAxis([0, 0, 0], [0, axisLength, 0])); // Passion
  scene.add(createAxis([0, 0, 0], [0, 0, 9]));           // Years

  // Axis tick marks
  for (let i = 0; i <= 10; i += 2) {
    scene.add(createAxis([i, -0.15, 0], [i, 0.15, 0]));
    scene.add(createAxis([-0.15, i, 0], [0.15, i, 0]));
  }
  for (let i = 0; i <= 8; i += 2) {
    scene.add(createAxis([0, -0.15, i], [0, 0.15, i]));
  }

  // Grid lines on each plane (very subtle)
  const gridMat = new THREE.LineBasicMaterial({ color: 0xf2f2f2 });
  for (let i = 0; i <= 10; i += 2) {
    // XY plane (z=0)
    const g1 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, 0, 0), new THREE.Vector3(i, axisLength, 0)
    ]);
    scene.add(new THREE.Line(g1, gridMat));
    const g2 = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, i, 0), new THREE.Vector3(axisLength, i, 0)
    ]);
    scene.add(new THREE.Line(g2, gridMat));
  }

  // ===== AXIS LABELS (Sprite text) =====
  function makeLabel(text, position, fontSize) {
    const cvs = document.createElement('canvas');
    const sz = fontSize || 256;
    cvs.width = sz * 4;
    cvs.height = sz;
    const ctx = cvs.getContext('2d');
    ctx.font = `${sz * 0.4}px "Times New Roman", Georgia, serif`;
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, cvs.width / 2, cvs.height / 2);

    const tex = new THREE.CanvasTexture(cvs);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(...position);
    sprite.scale.set(3, 0.75, 1);
    return sprite;
  }

  scene.add(makeLabel('Proficiency', [5.5, -1, 0]));
  scene.add(makeLabel('Passion', [-1.2, 5.5, 0]));
  scene.add(makeLabel('Years', [0, -1, 4.5]));

  // ===== DATA POINTS =====
  const spheres = [];
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  const baseGeo = new THREE.SphereGeometry(1, 24, 24);

  skills.forEach((skill, i) => {
    const x = skill.proficiency;
    const y = skill.passion;
    const z = skill.years;
    const size = 0.12 * skill.importance;

    // Color: white to blue based on passion
    const t = skill.passion / 10;
    const color = new THREE.Color().setHSL(0.6, 0.5 + t * 0.4, 0.85 - t * 0.35);

    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0,
      emissive: color.clone().multiplyScalar(0.3),
    });

    const mesh = new THREE.Mesh(baseGeo, mat);
    mesh.position.set(x, y, z);
    mesh.scale.set(0, 0, 0);
    mesh.userData = { skill, index: i, targetScale: size, baseY: y };
    sphereGroup.add(mesh);
    spheres.push(mesh);
  });

  // ===== GLOW HALOS =====
  const glowGeo = new THREE.SphereGeometry(1, 16, 16);
  spheres.forEach(mesh => {
    const glowMat = new THREE.MeshBasicMaterial({
      color: mesh.material.color,
      transparent: true,
      opacity: 0,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.scale.set(0, 0, 0);
    mesh.userData.glow = glow;
    mesh.userData.glowTargetScale = mesh.userData.targetScale * 2;
    glow.position.copy(mesh.position);
    sphereGroup.add(glow);
  });

  // ===== REGRESSION PLANE =====
  // Compute 3D linear regression: y = a + b1*x + b2*z
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
  const a = my - b1 * mx - b2 * mz;

  // Create plane as a mesh
  const planeGeo = new THREE.PlaneGeometry(1, 1, 10, 10);
  const planeVerts = planeGeo.attributes.position;

  // Map plane to regression surface over the data range
  for (let i = 0; i < planeVerts.count; i++) {
    let px = planeVerts.getX(i); // -0.5 to 0.5
    let pz = planeVerts.getY(i); // -0.5 to 0.5
    const xVal = 1 + px * 9; // map to 1-10
    const zVal = 0.5 + pz * 8; // map to 0.5-8.5
    const yVal = a + b1 * xVal + b2 * zVal;
    planeVerts.setXYZ(i, xVal, yVal, zVal);
  }
  planeGeo.computeVertexNormals();

  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x2244cc,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    wireframe: false,
    depthWrite: false,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  scene.add(planeMesh);

  // ===== PARTICLE DUST =====
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = [];

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = Math.random() * 14 - 2;
    particlePositions[i * 3 + 1] = Math.random() * 14 - 2;
    particlePositions[i * 3 + 2] = Math.random() * 10 - 1;
    particleVelocities.push({
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002,
    });
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xdddddd,
    size: 0.04,
    transparent: true,
    opacity: 0.25,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ===== LIGHTING =====
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.5);
  directional.position.set(10, 15, 10);
  scene.add(directional);

  // ===== RAYCASTING (hover) =====
  const raycaster = new THREE.Raycaster();
  raycaster.params.Mesh = { threshold: 0.5 };
  const mouse = new THREE.Vector2(-999, -999);
  let hoveredMesh = null;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -999;
    mouse.y = -999;
    if (tooltip) tooltip.classList.remove('visible');
  });

  function updateTooltip() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      if (mesh !== hoveredMesh) {
        if (hoveredMesh) resetHover(hoveredMesh);
        hoveredMesh = mesh;
        mesh.scale.setScalar(mesh.userData.targetScale * 1.6);
        if (mesh.userData.glow) {
          mesh.userData.glow.scale.setScalar(mesh.userData.glowTargetScale * 1.4);
        }
      }
      if (tooltip) {
        const skill = mesh.userData.skill;
        tooltip.innerHTML = `<strong>${skill.name}</strong><br>Proficiency: ${skill.proficiency} &middot; Passion: ${skill.passion} &middot; ${skill.years}yr`;
        const pos = mesh.position.clone().project(camera);
        const rect = canvas.getBoundingClientRect();
        tooltip.style.left = ((pos.x + 1) / 2 * rect.width + rect.left - container.getBoundingClientRect().left + 12) + 'px';
        tooltip.style.top = ((-pos.y + 1) / 2 * rect.height + rect.top - container.getBoundingClientRect().top - 10) + 'px';
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
    if (mesh.userData.glow) {
      mesh.userData.glow.scale.setScalar(mesh.userData.glowTargetScale);
    }
  }

  // ===== ENTRANCE ANIMATION =====
  const startTime = performance.now();
  const entranceDuration = 2000;
  const planeFadeDelay = 1500;
  const planeFadeDuration = 1000;
  let animationComplete = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Camera dolly
  const cameraStart = new THREE.Vector3(20, 14, 20);
  const cameraEnd = new THREE.Vector3(14, 10, 14);

  // ===== ANIMATION LOOP =====
  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const elapsed = now - startTime;

    // Entrance animations
    if (!animationComplete) {
      // Camera dolly
      const camT = Math.min(elapsed / 2500, 1);
      const camEase = easeOutCubic(camT);
      camera.position.lerpVectors(cameraStart, cameraEnd, camEase);

      // Spheres pop in staggered
      spheres.forEach((mesh, i) => {
        const delay = i * 60;
        const t = Math.max(0, Math.min((elapsed - delay) / 600, 1));
        const ease = easeOutCubic(t);
        const s = mesh.userData.targetScale * ease;
        mesh.scale.set(s, s, s);
        mesh.material.opacity = ease * 0.9;

        // Glow
        if (mesh.userData.glow) {
          const gs = mesh.userData.glowTargetScale * ease;
          mesh.userData.glow.scale.set(gs, gs, gs);
          mesh.userData.glow.material.opacity = ease * 0.15;
        }
      });

      // Regression plane fade in
      const planeT = Math.max(0, Math.min((elapsed - planeFadeDelay) / planeFadeDuration, 1));
      planeMat.opacity = easeOutCubic(planeT) * 0.12;

      if (elapsed > entranceDuration + planeFadeDelay + planeFadeDuration) {
        animationComplete = true;
      }
    }

    // Gentle floating animation for points
    const floatTime = now * 0.001;
    spheres.forEach((mesh, i) => {
      const offset = Math.sin(floatTime + i * 0.7) * 0.04;
      mesh.position.y = mesh.userData.baseY + offset;
      if (mesh.userData.glow) {
        mesh.userData.glow.position.y = mesh.position.y;
      }
    });

    // Particle drift
    const pos = particles.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      pos.array[i * 3] += particleVelocities[i].x;
      pos.array[i * 3 + 1] += particleVelocities[i].y;
      pos.array[i * 3 + 2] += particleVelocities[i].z;
      // Wrap around
      if (pos.array[i * 3] > 14) pos.array[i * 3] = -2;
      if (pos.array[i * 3] < -2) pos.array[i * 3] = 14;
      if (pos.array[i * 3 + 1] > 14) pos.array[i * 3 + 1] = -2;
      if (pos.array[i * 3 + 1] < -2) pos.array[i * 3 + 1] = 14;
      if (pos.array[i * 3 + 2] > 10) pos.array[i * 3 + 2] = -1;
      if (pos.array[i * 3 + 2] < -1) pos.array[i * 3 + 2] = 10;
    }
    pos.needsUpdate = true;

    // Tooltip/hover
    updateTooltip();

    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // ===== RESIZE =====
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
})();
