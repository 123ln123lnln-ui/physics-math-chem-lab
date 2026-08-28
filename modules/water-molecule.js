/* water-molecule.js — 水分子 3D 结构（高中）
 * three.js 球棍模型；键角 104.5°、键长比例来自结构化学约定值。
 */
(function () {
  App.register({
    id: 'water-molecule',
    title: '水分子 3D 结构',
    subject: 'chemistry',
    stage: '高中',
    desc: '旋转观察 H₂O 的 V 形结构：键角 104.5°，氧原子半径大于氢。',
    render: function (root) {
      const page = document.createElement('div'); page.className = 'module-page';
      const left = document.createElement('div');
      const right = document.createElement('div');
      page.appendChild(left); page.appendChild(right);
      root.appendChild(page);

      const viz = document.createElement('div'); viz.className = 'viz-card';
      viz.innerHTML = '<h3>球棍模型（自动旋转）</h3>';
      const holder = document.createElement('div');
      holder.style.height = '380px';
      viz.appendChild(holder);
      left.appendChild(viz);

      const panel = document.createElement('div'); panel.className = 'panel';
      panel.innerHTML = '<h3>结构数据</h3>';
      right.appendChild(panel);

      if (typeof THREE === 'undefined') {
        holder.innerHTML = '<p class="note">three.js 未加载（网络问题），请刷新页面。</p>';
        return;
      }

      const w = holder.clientWidth || 600, h = 380;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 1.2, 6);
      camera.lookAt(0, 0, 0);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      holder.appendChild(renderer.domElement);

      const amb = new THREE.AmbientLight(0xffffff, 0.7);
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(5, 8, 6);
      scene.add(amb); scene.add(dir);

      const mol = new THREE.Group();
      scene.add(mol);

      // 键角 104.5°：两个 H 相对 O 对称分布
      const angle = 104.5 * Math.PI / 180;
      const bondLen = 1.6; // 视觉比例
      const h1 = new THREE.Vector3(Math.sin(angle / 2) * bondLen, Math.cos(angle / 2) * bondLen, 0);
      const h2 = new THREE.Vector3(-Math.sin(angle / 2) * bondLen, Math.cos(angle / 2) * bondLen, 0);
      const oPos = new THREE.Vector3(0, -0.45, 0);

      function sphere(pos, r, color) {
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32),
          new THREE.MeshPhongMaterial({ color: color }));
        s.position.copy(pos);
        mol.add(s);
      }
      function bond(a, b) {
        const dist = a.distanceTo(b);
        const geo = new THREE.CylinderGeometry(0.08, 0.08, dist, 12);
        const mesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0x94a3b8 }));
        mesh.position.copy(a).lerp(b, 0.5);
        mesh.lookAt(b);
        mesh.rotateX(Math.PI / 2);
        mol.add(mesh);
      }
      sphere(oPos, 0.62, 0xdc2626);              // O（红，CPK 惯例）
      sphere(oPos.clone().add(h1), 0.38, 0xe2e8f0); // H（浅）
      sphere(oPos.clone().add(h2), 0.38, 0xe2e8f0);
      bond(oPos, oPos.clone().add(h1));
      bond(oPos, oPos.clone().add(h2));

      // 键角弧线与标注
      const arcPts = [];
      for (let i = 0; i <= 20; i++) {
        const th = -angle / 2 + angle * i / 20;
        arcPts.push(new THREE.Vector3(Math.sin(th) * 0.9, -0.45 + Math.cos(th) * 0.9, 0));
      }
      const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
      mol.add(new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: 0xf59e0b })));

      let auto = true;
      (function animate() {
        window.requestAnimationFrame(animate);
        if (auto) mol.rotation.y += 0.01;
        renderer.render(scene, camera);
      })();

      UI.readout(panel, [
        ['分子式', 'H₂O'],
        ['空间构型', 'V 形（角形）'],
        ['键角', '104.5°'],
        ['中心原子杂化', 'sp³（2 对孤电子对）'],
        ['分子极性', '极性分子'],
        ['相对分子质量', UI.fmt(SCI.chemx.molarMass({ H: 2, O: 1 }), 2)]
      ]);
      const hint = document.createElement('div'); hint.className = 'note';
      hint.textContent = '键角小于 109°28′ 是因为孤电子对排斥力更大（VSEPR）。相对分子质量由引擎按 IUPAC 原子量计算。';
      panel.appendChild(hint);

      const toggle = document.createElement('button');
      toggle.className = 'btn secondary'; toggle.textContent = '暂停旋转';
      toggle.style.marginTop = '10px';
      toggle.addEventListener('click', function () { auto = !auto; toggle.textContent = auto ? '暂停旋转' : '继续旋转'; });
      panel.appendChild(toggle);
    }
  });
})();
