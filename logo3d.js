import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const emblem = document.querySelector('.welcome-emblem');
const canvas = emblem?.querySelector('.welcome-logo-3d');
const startButton = document.querySelector('[data-start]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (emblem && canvas) {
  const state = { exited: false, disposed: false, stop: null };
  startButton?.addEventListener('click', () => {
    state.exited = true;
    state.stop?.();
  }, { once: true, capture: true });

  init().catch(err => {
    console.info('Logo 3D: modo estático activo o WebGL no disponible en este entorno:', err?.message || err);
  });

  async function init() {
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power'
      });
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to 2D emblem:', e);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(15, 1, 0.1, 100);

    const draco = new DRACOLoader().setDecoderPath(new URL('./vendor/draco/', import.meta.url).href);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    const gltf = await loader.loadAsync(new URL('./assets/logo-3d.glb', import.meta.url).href);
    if (state.exited || state.disposed) {
      draco.dispose();
      renderer.dispose();
      return;
    }

    const root = gltf.scene;
    // La cara del sello viene inclinada ~3° en el GLB original.
    root.rotation.x = -0.054;
    const matcap = makeMatcap();
    root.traverse(object => {
      if (!object.isMesh) return;
      object.material.dispose();
      object.material = new THREE.MeshMatcapMaterial({ matcap });
    });
    scene.add(root);

    const box = new THREE.Box3().setFromObject(root);
    const target = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() / 2;
    const distance = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.74;

    let running = !reducedMotion.matches;
    let raf = 0;
    let startedAt = performance.now();
    let pointerX = 0;
    let pointerY = 0;
    let currentPointerX = 0;
    let currentPointerY = 0;

    const onPointerMove = e => {
      const rect = emblem.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      pointerX = THREE.MathUtils.clamp((e.clientX - cx) / (rect.width * 1.6), -1, 1);
      pointerY = THREE.MathUtils.clamp((e.clientY - cy) / (rect.height * 1.6), -1, 1);
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const pose = (yaw, pitch, floatY) => {
      const direction = new THREE.Vector3(Math.sin(yaw), Math.sin(pitch), Math.cos(yaw)).normalize();
      camera.position.copy(target).addScaledVector(direction, distance);
      camera.position.y += floatY;
      camera.lookAt(target);
      camera.updateProjectionMatrix();
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      return true;
    };

    const renderStatic = () => {
      if (!resize()) return;
      pose(0, THREE.MathUtils.degToRad(1.2), 0);
      renderer.render(scene, camera);
    };

    const easeOutCubic = value => 1 - Math.pow(1 - value, 3);

    const tick = now => {
      if (!running) return;
      const elapsed = (now - startedAt) / 1000;
      const intro = 1 - easeOutCubic(Math.min(1, elapsed / 1.15));
      const phase = Math.max(0, elapsed - 1.15);
      
      // Interactive pointer easing
      currentPointerX += (pointerX - currentPointerX) * 0.08;
      currentPointerY += (pointerY - currentPointerY) * 0.08;

      const yaw = Math.sin(phase * Math.PI * 2 / 8.5) * THREE.MathUtils.degToRad(9) - 0.62 * intro + currentPointerX * THREE.MathUtils.degToRad(14);
      const pitch = THREE.MathUtils.degToRad(1.2) + Math.sin(phase * Math.PI * 2 / 7 + 1.1) * 0.008 - currentPointerY * THREE.MathUtils.degToRad(10);
      const floatY = Math.sin(phase * Math.PI * 2 / 6 + 0.4) * 0.035;
      pose(yaw, pitch, floatY);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(() => {
      if (state.disposed || running) return;
      renderStatic();
    });
    resizeObserver.observe(canvas);

    renderStatic();
    requestAnimationFrame(() => emblem.classList.add('has-3d'));

    if (running) {
      startedAt = performance.now();
      raf = requestAnimationFrame(tick);
    }

    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    document.addEventListener('visibilitychange', () => {
      if (state.exited || state.disposed) return;
      if (document.hidden) {
        pause();
      } else if (!reducedMotion.matches) {
        running = true;
        startedAt = performance.now() - 1150;
        raf = requestAnimationFrame(tick);
      }
    });

    state.stop = () => {
      pause();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      resizeObserver.disconnect();
      window.setTimeout(() => {
        if (state.disposed) return;
        scene.traverse(object => {
          if (!object.isMesh) return;
          object.geometry.dispose();
          object.material.dispose();
        });
        matcap.dispose();
        draco.dispose();
        renderer.dispose();
        state.disposed = true;
      }, 500);
    };
  }
}

function makeMatcap() {
  const size = 256;
  const surface = document.createElement('canvas');
  surface.width = surface.height = size;
  const context = surface.getContext('2d');
  const center = size / 2;

  const base = context.createRadialGradient(center * 0.94, center * 0.9, 0, center, center * 1.05, center * 1.12);
  base.addColorStop(0, '#4B2D19');
  base.addColorStop(0.55, '#4B2D19');
  base.addColorStop(0.82, '#57341D');
  base.addColorStop(1, '#3A2110');
  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  context.globalCompositeOperation = 'screen';
  const highlight = context.createRadialGradient(center * 0.62, center * 0.5, 0, center * 0.62, center * 0.5, center * 0.55);
  highlight.addColorStop(0, 'rgba(255,240,220,.20)');
  highlight.addColorStop(0.55, 'rgba(255,240,220,.06)');
  highlight.addColorStop(1, 'rgba(255,240,220,0)');
  context.fillStyle = highlight;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
