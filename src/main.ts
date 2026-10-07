import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { StateController } from './core/StateController';
import { InteractionManager } from './core/InteractionManager';
import { SelectionHighlight } from './core/SelectionHighlight';
import { Membrane } from './organelles/Membrane';
import { Nucleus } from './organelles/Nucleus';
import { Mitochondria } from './organelles/Mitochondria';
import { EndoplasmicReticulum } from './organelles/EndoplasmicReticulum';
import { Golgi } from './organelles/Golgi';
import { Lysosomes } from './organelles/Lysosomes';
import { SCENARIOS } from './scenarios';
import { UIPanel } from './ui/UIPanel';
import { validateLayout } from './utils/validateLayout';

function bootstrap(): void {
  const container = document.getElementById('app');
  if (!container) throw new Error('Container #app not found');

  const sceneManager = new SceneManager({ container });
  const stateController = new StateController(sceneManager.scene);

  const membrane = new Membrane();
  const nucleus = new Nucleus();
  const mitochondria = new Mitochondria();
  const er = new EndoplasmicReticulum();
  const golgi = new Golgi();
  const lysosomes = new Lysosomes();

  sceneManager.scene.add(membrane.group);
  sceneManager.scene.add(nucleus.group);
  sceneManager.scene.add(mitochondria.group);
  sceneManager.scene.add(er.group);
  sceneManager.scene.add(golgi.group);
  sceneManager.scene.add(lysosomes.group);

  // Регистрация органелл в контроллере состояний
  stateController.register('membrane', {
    group: membrane.group,
    materials: [membrane.mesh.material as THREE.Material]
  });
  stateController.register('nucleus', {
    group: nucleus.group,
    materials: [
      nucleus.mesh.material as THREE.Material,
      nucleus.nucleolus.material as THREE.Material
    ]
  });
  stateController.register('mitochondria', {
    group: mitochondria.group,
    materials: mitochondria.materials
  });
  stateController.register('er', {
    group: er.group,
    materials: [(er.group.children[0] as THREE.Mesh).material as THREE.Material]
  });
  stateController.register('golgi', {
    group: golgi.group,
    materials: [(golgi.group.children[0] as THREE.Mesh).material as THREE.Material]
  });
  stateController.register('lysosomes', {
    group: lysosomes.group,
    materials: [
      (lysosomes.group.children[0] as THREE.Mesh).material as THREE.Material
    ]
  });

  // UI
  const ui = new UIPanel(SCENARIOS, {
    onScenarioSelect: scenario => stateController.apply(scenario)
  });

  // Интерактивность: подсветка + карточка элемента
  const highlight = new SelectionHighlight();

  const interaction = new InteractionManager(
    sceneManager.camera,
    sceneManager.renderer.domElement,
    {
      onHoverChange: entry => {
        highlight.setActive(entry?.highlightRoot ?? null);
      },
      onSelect: entry => {
        ui.showElement(entry?.infoKey ?? null);
      }
    }
  );

  // Автоматически собираем все pickables из дерева сцены
  let pickableCount = 0;
  sceneManager.scene.traverse(obj => {
    const pickInfo = obj.userData.pickInfo;
    if (pickInfo) {
      interaction.register({
        hitObject: obj,
        highlightRoot: pickInfo.highlightUnit,
        infoKey: pickInfo.elementId
      });
      highlight.register(pickInfo.highlightUnit);
      pickableCount++;
    }
  });

  console.log(`[CellSim 3D] Registered ${pickableCount} pickable elements`);

  if (pickableCount === 0) {
    console.warn(
      '[CellSim 3D] Нет pickable-элементов! ' +
      'Проверьте, что userData.pickInfo установлен в органеллах.'
    );
  }

  // Стартуем с нормального состояния
  const normalScenario = SCENARIOS.find(s => s.id === 'normal')!;
  ui.setActive('normal');
  stateController.apply(normalScenario);

  sceneManager.onUpdate((dt, elapsed) => {
    membrane.update(dt, elapsed);
    nucleus.update(dt, elapsed);
    mitochondria.update(dt, elapsed);
    er.update(dt, elapsed);
    golgi.update(dt, elapsed);
    lysosomes.update(dt, elapsed);
    stateController.update(dt, elapsed);
    highlight.update(dt, elapsed);
  });

  console.log('[CellSim 3D] MVP ready with element interaction');
  setupFPSMeter();
}

function setupFPSMeter(): void {
  const el = document.createElement('div');
  el.id = 'fps-meter';
  document.body.appendChild(el);

  let frames = 0;
  let lastTime = performance.now();

  function tick(): void {
    frames++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frames * 1000) / (now - lastTime));
      el.textContent = `FPS: ${fps}`;
      el.style.color =
        fps >= 55 ? '#88ff88' : fps >= 40 ? '#ffcc44' : '#ff6666';
      frames = 0;
      lastTime = now;
    }
    requestAnimationFrame(tick);
  }
  tick();
}

bootstrap();
validateLayout();