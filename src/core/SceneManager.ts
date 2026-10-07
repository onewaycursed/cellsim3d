import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BACKGROUND_COLOR } from '../config/palette';

export interface SceneManagerOptions {
  container: HTMLElement;
}

export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly renderer: THREE.WebGLRenderer;
  public readonly controls: OrbitControls;

  private composer: EffectComposer;
  private clock = new THREE.Clock();
  private updateCallbacks: Array<(dt: number, elapsed: number) => void> = [];

  constructor({ container }: SceneManagerOptions) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(BACKGROUND_COLOR);
    this.scene.fog = new THREE.FogExp2(BACKGROUND_COLOR, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 4, 20);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    container.appendChild(this.renderer.domElement);

    // Постобработка с bloom
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

   const bloom = new UnrealBloomPass(
  new THREE.Vector2(container.clientWidth, container.clientHeight),
  0.45,  // strength — было 0.8
  0.5,   // radius — было 0.6
  0.85   // threshold — было 0.7
);
    this.composer.addPass(bloom);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 40;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.4;

    this.setupLights();
    this.setupResize(container);
    this.startLoop();
  }

  public onUpdate(cb: (dt: number, elapsed: number) => void): void {
    this.updateCallbacks.push(cb);
  }

  private setupLights(): void {
    this.scene.add(new THREE.AmbientLight(0x334466, 1.2));

    const keyLight = new THREE.DirectionalLight(0xaaccff, 2.2);
    keyLight.position.set(8, 12, 10);
    this.scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x3366ff, 200, 60);
    rimLight.position.set(-12, 6, -10);
    this.scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xff4488, 100, 50);
    fillLight.position.set(10, -8, 6);
    this.scene.add(fillLight);

    const innerLight = new THREE.PointLight(0x66aaff, 60, 20);
    innerLight.position.set(0, 0, 0);
    this.scene.add(innerLight);
  }

  private setupResize(container: HTMLElement): void {
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
      this.composer.setSize(w, h);
    });
  }

  private startLoop(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const elapsed = this.clock.elapsedTime;

      for (const cb of this.updateCallbacks) cb(dt, elapsed);

      this.controls.update();
      this.composer.render();
    };
    loop();
  }
}