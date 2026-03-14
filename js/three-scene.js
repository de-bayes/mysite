// 3D Skills & Interests Scatter Plot — Constellation visualization
(function () {
  const container = document.getElementById('viz-container');
  const canvas = document.getElementById('scatter-canvas');
  const tooltip = document.getElementById('scatter-tooltip');
  if (!container || !canvas) return;

  // ===== DATA =====
  const skills = [
    { name: 'Political Forecasting & Election Modeling', proficiency: 10, passion: 10, years: 2, importance: 10 },
    { name: 'Prediction Market Trading', proficiency: 9.5, passion: 9.5, years: 2.5, importance: 8.7 },
    { name: 'Bayesian Reasoning', proficiency: 7, passion: 9, years: 2, importance: 8 },
    { name: 'Constitutional & Administrative Law', proficiency: 6, passion: 8, years: 2, importance: 7.3 },
    { name: 'Python & Data Pipelines', proficiency: 6, passion: 7, years: 2, importance: 7.3 },
    { name: 'Decision Desk & Race Calling', proficiency: 6, passion: 9, years: 1, importance: 7.3 },
    { name: 'Campaign Finance Analysis', proficiency: 7, passion: 7, years: 2, importance: 6.7 },
    { name: 'Voting Theory & Social Choice', proficiency: 6, passion: 8, years: 2, importance: 6.7 },
    { name: 'Political Journalism & Writing', proficiency: 7, passion: 7, years: 3, importance: 6.7 },
    { name: 'Sports Photography', proficiency: 7, passion: 8, years: 2, importance: 6.7 },
    { name: 'Game Theory', proficiency: 5, passion: 8, years: 2, importance: 6 },
    { name: 'Geopolitics', proficiency: 6, passion: 6.75, years: 3, importance: 6 },
    { name: 'Podcasting', proficiency: 6, passion: 8, years: 2, importance: 6 },
    { name: 'Kelly Criterion & Position Sizing', proficiency: 6, passion: 7, years: 1, importance: 6 },
    { name: 'Political Strategy & Opposition Research', proficiency: 6, passion: 7, years: 2, importance: 6 },
    { name: 'Swimming', proficiency: 7, passion: 6, years: 9, importance: 6 },
    { name: 'Precinct-Level Geospatial Analysis', proficiency: 5, passion: 7, years: 1, importance: 6 },
    { name: 'JavaScript & Web Development', proficiency: 5, passion: 6, years: 2, importance: 5.3 },
    { name: 'Adobe Lightroom', proficiency: 7, passion: 7, years: 2, importance: 5.3 },
  ];

  // ===== SCENE =====
  const dataCenter = { x: 6.5, y: 7, z: 3 };

  const scene = new THREE.Scene();
  scene.background = null;

  const width = container.clientWidth;
  const height = container.clientHeight || 500;
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 200);
  camera.position.set(22, 15, 22);
  camera.lookAt(dataCenter.x, dataCenter.y, dataCenter.z);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x09090b, 0);

  // ===== CONTROLS =====
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.6;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  controls.target.set(dataCenter.x, dataCenter.y, dataCenter.z);
  controls.maxDistance = 35;
  controls.minDistance = 12;
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.minPolarAngle = Math.PI * 0.1;
  controls.update();

  // Stop auto-rotate when user interacts
  let userInteracted = false;
  controls.addEventListener('start', () => {
    userInteracted = true;
    controls.autoRotate = false;
  });

  // Resume auto-rotate after 5s of inactivity
  let idleTimer;
  canvas.addEventListener('pointerup', () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.2;
    }, 5000);
  });

  // ===== THEME =====
  const axisColor = 0x3a3a3c;
  const gridColor = 0x2a2a2c;
  const labelColor = '#4a4a4c';

  // ===== AXES =====
  function createLine(start, end, color) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
    ]);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
  }

  // Main axes
  [createLine([0, 0, 0], [11, 0, 0], axisColor),
   createLine([0, 0, 0], [0, 11, 0], axisColor),
   createLine([0, 0, 0], [0, 0, 10], axisColor)].forEach(l => scene.add(l));

  // Tick marks
  for (let i = 2; i <= 10; i += 2) {
    scene.add(createLine([i, -0.12, 0], [i, 0.12, 0], axisColor));
    scene.add(createLine([-0.12, i, 0], [0.12, i, 0], axisColor));
  }
  for (let i = 2; i <= 8; i += 2) {
    scene.add(createLine([0, -0.12, i], [0, 0.12, i], axisColor));
  }

  // Grid planes
  for (let i = 2; i <= 10; i += 2) {
    scene.add(createLine([i, 0, 0], [i, 11, 0], gridColor));
    scene.add(createLine([0, i, 0], [11, i, 0], gridColor));
    scene.add(createLine([i, 0, 0], [i, 0, 10], gridColor));
    scene.add(createLine([0, i, 0], [0, i, 10], gridColor));
  }
  for (let i = 2; i <= 8; i += 2) {
    scene.add(createLine([0, 0, i], [11, 0, i], gridColor));
    scene.add(createLine([0, 0, i], [0, 11, i], gridColor));
  }

  // ===== LABELS =====
  function makeLabel(text, position) {
    const cvs = document.createElement('canvas');
    cvs.width = 512; cvs.height = 128;
    const ctx = cvs.getContext('2d');
    ctx.font = '44px Inter, -apple-system, sans-serif';
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);
    const tex = new THREE.CanvasTexture(cvs);
    tex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sprite.position.set(...position);
    sprite.scale.set(2.5, 0.65, 1);
    return sprite;
  }

  [makeLabel('Proficiency', [5.5, -0.9, 0]),
   makeLabel('Passion', [-1.2, 5.5, 0]),
   makeLabel('Years', [0, -0.9, 5])].forEach(l => scene.add(l));

  // ===== LIGHTING =====
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(10, 15, 10);
  scene.add(dirLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
  fillLight.position.set(-5, -3, -5);
  scene.add(fillLight);

  // ===== DATA POINTS =====
  const spheres = [];
  const sphereGroup = new THREE.Group();
  scene.add(sphereGroup);

  const baseGeo = new THREE.SphereGeometry(1, 32, 32);

  skills.forEach((skill, i) => {
    const t = skill.importance / 10;
    const hue = 0.6 + t * 0.1;
    const color = new THREE.Color().setHSL(hue, 0.5 + t * 0.35, 0.5 + t * 0.2);
    const size = 0.08 + 0.14 * t;

    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0,
      roughness: 0.3,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(baseGeo, mat);
    mesh.position.set(skill.proficiency, skill.passion, skill.years);
    mesh.scale.set(0, 0, 0);
    mesh.userData = { skill, index: i, targetScale: size, baseY: skill.passion };
    sphereGroup.add(mesh);
    spheres.push(mesh);
  });

  // ===== CONSTELLATION CONNECTIONS =====
  const connectionGroup = new THREE.Group();
  scene.add(connectionGroup);

  const connectionThreshold = 4.5;
  const connectionLines = [];

  for (let i = 0; i < skills.length; i++) {
    for (let j = i + 1; j < skills.length; j++) {
      const p1 = new THREE.Vector3(skills[i].proficiency, skills[i].passion, skills[i].years);
      const p2 = new THREE.Vector3(skills[j].proficiency, skills[j].passion, skills[j].years);
      const dist = p1.distanceTo(p2);
      if (dist < connectionThreshold) {
        const targetOpacity = (1 - dist / connectionThreshold) * 0.12;
        const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const mat = new THREE.LineBasicMaterial({
          color: 0x6366f1,
          transparent: true,
          opacity: 0,
        });
        const line = new THREE.Line(geo, mat);
        line.userData._targetOpacity = targetOpacity;
        connectionGroup.add(line);
        connectionLines.push(line);
      }
    }
  }

  // ===== QUADRATIC REGRESSION =====
  function solveQuadratic(data, xKey, yKey) {
    const n = data.length;
    let s0 = 0, s1 = 0, s2 = 0, s3 = 0, s4 = 0;
    let sy = 0, sxy = 0, sx2y = 0;
    for (let i = 0; i < n; i++) {
      const xi = data[i][xKey], yi = data[i][yKey];
      const x2 = xi * xi, x3 = x2 * xi, x4 = x3 * xi;
      s0++; s1 += xi; s2 += x2; s3 += x3; s4 += x4;
      sy += yi; sxy += xi * yi; sx2y += x2 * yi;
    }
    const A = [[s4, s3, s2, sx2y], [s3, s2, s1, sxy], [s2, s1, s0, sy]];
    for (let col = 0; col < 3; col++) {
      let maxRow = col;
      for (let row = col + 1; row < 3; row++)
        if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row;
      [A[col], A[maxRow]] = [A[maxRow], A[col]];
      const pivot = A[col][col];
      if (Math.abs(pivot) < 1e-12) continue;
      for (let row = col + 1; row < 3; row++) {
        const f = A[row][col] / pivot;
        for (let j = col; j < 4; j++) A[row][j] -= f * A[col][j];
      }
    }
    const r = [0, 0, 0];
    for (let row = 2; row >= 0; row--) {
      let sum = A[row][3];
      for (let j = row + 1; j < 3; j++) sum -= A[row][j] * r[j];
      r[row] = Math.abs(A[row][row]) > 1e-12 ? sum / A[row][row] : 0;
    }
    return r;
  }

  const dataArr = skills.map(s => ({ x: s.proficiency, y: s.passion, z: s.years }));
  const [ay, by, cy] = solveQuadratic(dataArr, 'x', 'y');
  const [az, bz, cz] = solveQuadratic(dataArr, 'x', 'z');

  // Residuals for confidence envelope
  let ssResY = 0, ssResZ = 0;
  dataArr.forEach(d => {
    ssResY += (d.y - (ay * d.x * d.x + by * d.x + cy)) ** 2;
    ssResZ += (d.z - (az * d.x * d.x + bz * d.x + cz)) ** 2;
  });
  const sigmaAvg = (Math.sqrt(ssResY / Math.max(dataArr.length - 3, 1)) +
                    Math.sqrt(ssResZ / Math.max(dataArr.length - 3, 1))) / 2;

  // Regression curve
  const curveSegments = 60;
  const xMin = 4.5, xMax = 9.5;
  const regressionGroup = new THREE.Group();
  scene.add(regressionGroup);

  const curvePoints = [];
  for (let i = 0; i <= curveSegments; i++) {
    const t = i / curveSegments;
    const xv = xMin + t * (xMax - xMin);
    curvePoints.push(new THREE.Vector3(xv, ay * xv * xv + by * xv + cy, az * xv * xv + bz * xv + cz));
  }

  // Gradient-colored curve segments
  for (let i = 0; i < curveSegments; i++) {
    const t = i / curveSegments;
    const color = new THREE.Color().setHSL(0.6 + t * 0.12, 0.6, 0.55);
    const geo = new THREE.BufferGeometry().setFromPoints([curvePoints[i], curvePoints[i + 1]]);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, linewidth: 2 });
    const line = new THREE.Line(geo, mat);
    line.userData._curveSegment = true;
    regressionGroup.add(line);
  }

  // Confidence envelope tube
  const tubePath = new THREE.CatmullRomCurve3(curvePoints);
  const tubeLengthSegs = 60, tubeRadialSegs = 20;
  const frames = tubePath.computeFrenetFrames(tubeLengthSegs, false);
  const tubeVerts = [], tubeIndices = [];

  function envelopeRadius(t) {
    const u = (t - 0.5) * 2;
    return Math.min(0.06 * sigmaAvg + 0.8 * sigmaAvg * u * u * u * u, 0.35);
  }

  for (let i = 0; i <= tubeLengthSegs; i++) {
    const t = i / tubeLengthSegs;
    const pos = tubePath.getPointAt(t);
    const N = frames.normals[i], B = frames.binormals[i];
    const r = envelopeRadius(t);
    for (let j = 0; j <= tubeRadialSegs; j++) {
      const angle = (j / tubeRadialSegs) * Math.PI * 2;
      const s = Math.sin(angle), c = Math.cos(angle);
      tubeVerts.push(pos.x + r * (c * N.x + s * B.x), pos.y + r * (c * N.y + s * B.y), pos.z + r * (c * N.z + s * B.z));
    }
  }
  for (let i = 0; i < tubeLengthSegs; i++) {
    for (let j = 0; j < tubeRadialSegs; j++) {
      const a = i * (tubeRadialSegs + 1) + j, b = a + tubeRadialSegs + 1;
      tubeIndices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const tubeGeo = new THREE.BufferGeometry();
  tubeGeo.setAttribute('position', new THREE.Float32BufferAttribute(tubeVerts, 3));
  tubeGeo.setIndex(tubeIndices);
  tubeGeo.computeVertexNormals();
  const tubeMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  regressionGroup.add(new THREE.Mesh(tubeGeo, tubeMat));

  // Wireframe rings
  const ringMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0 });
  for (let ri = 0; ri < 16; ri++) {
    const t = (ri + 0.5) / 16;
    const pos = tubePath.getPointAt(t);
    const idx = Math.min(Math.round(t * tubeLengthSegs), frames.normals.length - 1);
    const N = frames.normals[idx], B = frames.binormals[idx];
    const r = envelopeRadius(t);
    const pts = [];
    for (let j = 0; j <= tubeRadialSegs; j++) {
      const angle = (j / tubeRadialSegs) * Math.PI * 2;
      pts.push(new THREE.Vector3(
        pos.x + r * (Math.cos(angle) * N.x + Math.sin(angle) * B.x),
        pos.y + r * (Math.cos(angle) * N.y + Math.sin(angle) * B.y),
        pos.z + r * (Math.cos(angle) * N.z + Math.sin(angle) * B.z)
      ));
    }
    regressionGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  }

  // Gradient arrow
  const arrowT = 0.65;
  const arrowX = xMin + arrowT * (xMax - xMin);
  const arrowOrigin = new THREE.Vector3(arrowX, ay * arrowX * arrowX + by * arrowX + cy, az * arrowX * arrowX + bz * arrowX + cz);
  const arrowDir = new THREE.Vector3(1.0, 2 * ay * arrowX + by, 2 * az * arrowX + bz).normalize();
  const arrowGroup = new THREE.Group();
  const arrowMat = new THREE.MeshStandardMaterial({ color: 0x22dd66, transparent: true, opacity: 0, roughness: 0.4, metalness: 0.1 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8), arrowMat);
  shaft.position.set(0, 0.75, 0);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 12), arrowMat);
  cone.position.set(0, 1.75, 0);
  arrowGroup.add(shaft, cone);
  arrowGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), arrowDir);
  arrowGroup.position.copy(arrowOrigin);
  regressionGroup.add(arrowGroup);

  // ===== RAYCASTING =====
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
    const intersects = raycaster.intersectObjects(spheres);
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      if (mesh !== hoveredMesh) {
        if (hoveredMesh) hoveredMesh.scale.setScalar(hoveredMesh.userData.targetScale);
        hoveredMesh = mesh;
        mesh.scale.setScalar(mesh.userData.targetScale * 1.5);
      }
      if (tooltip) {
        const s = mesh.userData.skill;
        tooltip.innerHTML = '<strong>' + s.name + '</strong><br>' +
          'Proficiency: ' + s.proficiency + ' &middot; Passion: ' + s.passion + ' &middot; ' + s.years + 'yr';
        const pos = mesh.position.clone().project(camera);
        const rect = canvas.getBoundingClientRect();
        const cr = container.getBoundingClientRect();
        tooltip.style.left = Math.min(Math.max((pos.x + 1) / 2 * rect.width + rect.left - cr.left + 14, 0), cr.width - 180) + 'px';
        tooltip.style.top = Math.min(Math.max((-pos.y + 1) / 2 * rect.height + rect.top - cr.top - 10, 0), cr.height - 40) + 'px';
        tooltip.classList.add('visible');
      }
    } else {
      if (hoveredMesh) { hoveredMesh.scale.setScalar(hoveredMesh.userData.targetScale); hoveredMesh = null; }
      if (tooltip) tooltip.classList.remove('visible');
    }
  }

  // ===== ANIMATION =====
  const startTime = performance.now();
  const entranceDuration = 1800;
  const regDelay = 1200, regDuration = 800;
  let animDone = false;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  const camStart = new THREE.Vector3(28, 20, 28);
  const camEnd = new THREE.Vector3(20, 13, 20);

  function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const elapsed = now - startTime;

    if (!animDone) {
      // Camera ease-in
      const camT = easeOut(Math.min(elapsed / 2500, 1));
      camera.position.lerpVectors(camStart, camEnd, camT);

      // Staggered point entrance
      spheres.forEach((mesh, i) => {
        const t = easeOut(Math.max(0, Math.min((elapsed - i * 50) / 500, 1)));
        mesh.scale.setScalar(mesh.userData.targetScale * t);
        mesh.material.opacity = t * 0.82;
      });

      // Regression + connections fade in
      const regT = easeOut(Math.max(0, Math.min((elapsed - regDelay) / regDuration, 1)));
      regressionGroup.children.forEach(child => {
        if (child.userData._curveSegment) child.material.opacity = regT * 0.85;
      });
      tubeMat.opacity = regT * 0.05;
      ringMat.opacity = regT * 0.07;
      arrowMat.opacity = regT * 0.8;

      // Constellation lines fade in
      connectionLines.forEach(line => {
        line.material.opacity = regT * line.userData._targetOpacity;
      });

      if (elapsed > entranceDuration + regDelay + regDuration) animDone = true;
    }

    // Floating + pulsing
    const ft = now * 0.0008;
    spheres.forEach((mesh, i) => {
      mesh.position.y = mesh.userData.baseY + Math.sin(ft + i * 0.6) * 0.03;
      // Subtle pulse for high-importance points
      if (animDone && mesh.userData.skill.importance >= 8) {
        const pulse = 1 + Math.sin(ft * 1.5 + i * 0.4) * 0.04;
        if (!hoveredMesh || hoveredMesh !== mesh) {
          mesh.scale.setScalar(mesh.userData.targetScale * pulse);
        }
      }
    });

    updateTooltip();
    controls.update();
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
