import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const host = document.querySelector('#canvas-host');
const loading = document.querySelector('#loading');
const readout = document.querySelector('#size-readout');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#1b352c');
scene.fog = new THREE.Fog('#1b352c', 720, 1500);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 2200);
camera.position.set(760, 610, 820);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
host.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(256, 16, 256);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.minDistance = 125;
controls.maxDistance = 1250;
controls.maxPolarAngle = Math.PI * 0.49;
controls.enablePan = true;
scene.add(new THREE.HemisphereLight('#dcefdc', '#22362d', 2.1));
const sun = new THREE.DirectionalLight('#fff0d4', 2.35);
sun.position.set(-420, 760, 300);
scene.add(sun);
const fill = new THREE.DirectionalLight('#c4e7db', 0.85);
fill.position.set(460, 280, -480);
scene.add(fill);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(512, 512), new THREE.MeshStandardMaterial({ color: '#244235', roughness: 1, metalness: 0 }));
ground.rotation.x = -Math.PI / 2;
ground.position.set(255.5, -64.55, 255.5);
scene.add(ground);
const grid = new THREE.GridHelper(512, 32, '#799b84', '#668170');
grid.position.set(255.5, -64.48, 255.5);
grid.material.transparent = true;
grid.material.opacity = 0.17;
scene.add(grid);
const campus = new THREE.Group();
scene.add(campus);

const namedColors = {
  grass_block:'#789d52', dirt:'#806044', stone:'#777b78', bedrock:'#363b39', oak_leaves:'#4f7d43', oak_log:'#795638', oak_planks:'#ae8c5d', short_grass:'#90b866', tall_grass:'#91bb65',
  stone_bricks:'#777c79', cracked_stone_bricks:'#696d69', chiseled_stone_bricks:'#888a83', polished_andesite:'#9a9b93', sandstone:'#d8c18d', smooth_sandstone:'#e5d2a5', smooth_stone:'#a6aaa5', cobblestone:'#777b75', stone_brick_wall:'#767a75', stone_brick_slab:'#85877f', stone_brick_stairs:'#7d8079',
  light_gray_concrete:'#b4b5ac', white_concrete:'#e5e1d4', gray_concrete:'#666d6a', brown_concrete:'#8b6546', green_terracotta:'#6f8060', light_blue_terracotta:'#9bb2ad', cyan_terracotta:'#5c8583', gray_terracotta:'#797a72', terracotta:'#a96546', brown_terracotta:'#98664c',
  white_stained_glass:'#d9e5dc', brown_stained_glass:'#8a7560', gray_stained_glass:'#747e78', light_gray_stained_glass:'#bec7bf', glass:'#d7e9e2', tinted_glass:'#39433f', iron_block:'#d2d6cf', glowstone:'#e6c878', quartz_block:'#eee9dd', smooth_quartz:'#f3eee2', quartz_bricks:'#e8e1d3', polished_blackstone_bricks:'#454849', blackstone:'#343839', polished_blackstone:'#474a4b',
  oak_fence:'#90704d', oak_stairs:'#a48760', white_carpet:'#eeeadd', red_bed:'#a64e45', poppy:'#c74e42', dandelion:'#ebc64e', blue_orchid:'#769fba', azure_bluet:'#e7ddd0', bricks:'#a45d48', gravel:'#8c8980', deepslate_bricks:'#525552', polished_deepslate:'#5b5d59', cobbled_deepslate:'#62645f', granite:'#9c6957', andesite:'#8a8c87', polished_granite:'#aa7966', polished_diorite_stairs:'#c3c3b7', smooth_sandstone_stairs:'#dfcca0', mud_brick_stairs:'#896b5d', quartz_stairs:'#e9e3d7'
};
function colorFor(name) {
  const short = name.replace('minecraft:', '');
  if (namedColors[short]) return namedColors[short];
  const palette = {white:'#e8e5db',orange:'#cf8050',magenta:'#aa729e',light_blue:'#9bb6c5',yellow:'#e2c65f',lime:'#9fb65e',pink:'#d49ca8',gray:'#767a77',light_gray:'#b9bab1',cyan:'#608c89',purple:'#8b6d9a',blue:'#627fa6',brown:'#8c674a',green:'#718c58',red:'#ae5449',black:'#454846'};
  for (const [key, value] of Object.entries(palette)) if (short.startsWith(key + '_')) return value;
  let hash = 0; for (const char of short) hash = ((hash * 31) + char.charCodeAt(0)) | 0;
  return `hsl(${Math.abs(hash) % 360} 22% 58%)`;
}
const mats = [];
const bounds = new THREE.Box3();

async function loadMesh() {
  const manifestResponse = await fetch('./data/manifest.json');
  if (!manifestResponse.ok) throw new Error('找不到校園模型索引檔。');
  const manifest = await manifestResponse.json();
  const response = await fetch('./data/campus-mesh.bin.gz');
  if (!response.ok) throw new Error('模型資料下載失敗，請確認 data 資料夾有一併上傳。');
  let raw;
  if ('DecompressionStream' in window) {
    const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
    raw = await new Response(stream).arrayBuffer();
  } else {
    throw new Error('這個瀏覽器不支援解壓縮模型資料，請改用新版 Chrome、Edge 或 Safari。');
  }
  const values = new Uint16Array(raw);
  for (const item of manifest.blockMaterials) {
    const from = item.faceStart;
    const to = from + item.vertexCount * 3;
    const vertexCount = item.vertexCount;
    if (!vertexCount) continue;
    const positions = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      positions[i * 3] = values[from + i * 3];
      positions[i * 3 + 1] = values[from + i * 3 + 1] - 64;
      positions[i * 3 + 2] = values[from + i * 3 + 2];
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ color: colorFor(item.name), roughness: 0.93, metalness: 0.01, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = true;
    campus.add(mesh);
    mats.push(material);
    geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox);
  }
  readout.textContent = `${manifest.blockCount.toLocaleString('zh-TW')} 個方塊 · ${manifest.worldBounds.x[1] + 1} × ${manifest.worldBounds.z[1] + 1}`;
  loading.classList.add('hidden');
  // Center the preview on the actual voxel bounds while preserving the original world coordinate layout.
  const center = bounds.getCenter(new THREE.Vector3());
  controls.target.set(center.x, Math.max(-20, center.y * 0.45), center.z);
  camera.position.set(center.x + 500, center.y + 430, center.z + 560);
  controls.update();
}
function resize() {
  const width = host.clientWidth, height = host.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();
let savedView;
function setMode(mode) {
  document.querySelector('#view-orbit').classList.toggle('active', mode === 'orbit');
  document.querySelector('#view-top').classList.toggle('active', mode === 'top');
  document.querySelector('#view-orbit').setAttribute('aria-pressed', String(mode === 'orbit'));
  document.querySelector('#view-top').setAttribute('aria-pressed', String(mode === 'top'));
  const center = bounds.isEmpty() ? new THREE.Vector3(256, 15, 256) : bounds.getCenter(new THREE.Vector3());
  if (mode === 'top') {
    savedView = { position: camera.position.clone(), target: controls.target.clone() };
    controls.target.set(center.x, center.y * 0.42, center.z);
    camera.position.set(center.x + 2, center.y + 900, center.z + 1);
  } else if (savedView) {
    camera.position.copy(savedView.position);
    controls.target.copy(savedView.target);
    savedView = null;
  }
  controls.update();
}
document.querySelector('#view-orbit').addEventListener('click', () => setMode('orbit'));
document.querySelector('#view-top').addEventListener('click', () => setMode('top'));
document.querySelector('#reset-view').addEventListener('click', () => { savedView = null; setMode('orbit'); });
renderer.domElement.addEventListener('pointerdown', () => host.parentElement.classList.add('dragging'));
window.addEventListener('pointerup', () => host.parentElement.classList.remove('dragging'));
function animate() { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); }
animate();
loadMesh().catch(error => {
  loading.classList.add('hidden');
  const panel = document.createElement('div'); panel.className = 'error-message'; panel.textContent = `模型載入遇到問題：${error.message} 請用網站伺服器開啟此頁面，並確認 data 資料夾已上傳。`;
  host.parentElement.appendChild(panel); console.error(error);
});

