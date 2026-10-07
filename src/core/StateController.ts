import * as THREE from 'three';
import type { OrganelleId, Scenario, OrganelleEffect } from '../types/scenario';
import { ParticleFX } from '../fx/ParticleFX';
import { Transition, TransitionManager } from './Transition';
import { MOLECULE_COLORS } from '../config/palette';

interface OrganelleHandle {
  group: THREE.Group;
  materials: THREE.Material[];
}

const PARTICLE_COLOR: Record<string, number> = {
  atp:     MOLECULE_COLORS.ATP,
  ros:     MOLECULE_COLORS.ROS,
  calcium: MOLECULE_COLORS.CALCIUM,
  protein: MOLECULE_COLORS.PROTEIN,
  virion:  MOLECULE_COLORS.VIRION
};

const TRANSITION_DURATION = 0.8;

export class StateController {
  private organelles = new Map<OrganelleId, OrganelleHandle>();
  private activeFX: ParticleFX[] = [];
  private fxGroup = new THREE.Group();
  private scene: THREE.Scene;
  private currentScenario: Scenario | null = null;
  private transitions = new TransitionManager();
  private defaults = new Map<string, number>();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.scene.add(this.fxGroup);
  }

  public register(id: OrganelleId, handle: OrganelleHandle): void {
    this.organelles.set(id, handle);
    // Запоминаем исходные значения свойств материалов
    handle.materials.forEach((mat, idx) => {
      const m = mat as any;
      if ('opacity' in m) this.defaults.set(`${id}:${idx}:opacity`, m.opacity);
      if ('emissiveIntensity' in m) this.defaults.set(`${id}:${idx}:emissiveIntensity`, m.emissiveIntensity);
      if ('color' in m) this.defaults.set(`${id}:${idx}:color`, m.color.getHex());
      if ('emissive' in m) this.defaults.set(`${id}:${idx}:emissive`, m.emissive.getHex());
    });
  }

  public apply(scenario: Scenario): void {
    // Удаляем частицы
    this.activeFX.forEach(fx => {
      this.fxGroup.remove(fx.points);
      fx.dispose();
    });
    this.activeFX = [];

    this.currentScenario = scenario;

    // Сбрасываем все органеллы к дефолту, потом применяем эффекты
    this.resetToDefaults();
    scenario.organelleEffects.forEach(e => this.applyEffectSmooth(e));

    // Частицы
    scenario.particleEmitters.forEach(e => {
      this.spawnParticles(e.particleType, e.count);
    });

    console.log(`[StateController] Applied: ${scenario.title}`);
  }

  public update(dt: number, elapsed: number): void {
    this.transitions.update(dt);
    this.activeFX.forEach(fx => fx.update(dt, elapsed));
  }

  public getCurrent(): Scenario | null {
    return this.currentScenario;
  }

  private resetToDefaults(): void {
    this.organelles.forEach((handle, id) => {
      handle.materials.forEach((mat, idx) => {
        const m = mat as any;
        const oKey = `${id}:${idx}:opacity`;
        const eKey = `${id}:${idx}:emissiveIntensity`;
        const cKey = `${id}:${idx}:color`;
        const emKey = `${id}:${idx}:emissive`;

        if ('opacity' in m && this.defaults.has(oKey)) {
          this.animate(oKey, m, 'opacity', this.defaults.get(oKey)!, TRANSITION_DURATION);
        }
        if ('emissiveIntensity' in m && this.defaults.has(eKey)) {
          this.animate(eKey, m, 'emissiveIntensity', this.defaults.get(eKey)!, TRANSITION_DURATION);
        }
        if ('color' in m && this.defaults.has(cKey)) {
          this.animateColor(m.color, this.defaults.get(cKey)!, TRANSITION_DURATION);
        }
        if ('emissive' in m && this.defaults.has(emKey)) {
          this.animateColor(m.emissive, this.defaults.get(emKey)!, TRANSITION_DURATION);
        }
      });
    });
  }

  private applyEffectSmooth(effect: OrganelleEffect): void {
    const organelle = this.organelles.get(effect.target);
    if (!organelle) return;

    organelle.materials.forEach(mat => {
      const m = mat as any;

      if (effect.property === 'opacity' && 'opacity' in m) {
        this.animate('tmp', m, 'opacity', effect.to as number, TRANSITION_DURATION);
      }
      if (effect.property === 'emissiveIntensity' && 'emissiveIntensity' in m) {
        this.animate('tmp', m, 'emissiveIntensity', effect.to as number, TRANSITION_DURATION);
      }
      if (effect.property === 'color' && 'color' in m) {
        this.animateColor(m.color, effect.to as number, TRANSITION_DURATION);
      }
      if (effect.property === 'emissive' && 'emissive' in m) {
        this.animateColor(m.emissive, effect.to as number, TRANSITION_DURATION);
      }
    });
  }

  private animate(
    _key: string,
    target: any,
    prop: string,
    to: number,
    duration: number
  ): void {
    const from = target[prop];
    if (typeof from !== 'number') return;
    this.transitions.add(new Transition(from, to, duration, v => {
      target[prop] = v;
    }));
  }

  private animateColor(color: THREE.Color, toHex: number, duration: number): void {
    const fromR = color.r, fromG = color.g, fromB = color.b;
    const toColor = new THREE.Color(toHex);
    const toR = toColor.r, toG = toColor.g, toB = toColor.b;

    this.transitions.add(new Transition(0, 1, duration, t => {
      color.setRGB(
        fromR + (toR - fromR) * t,
        fromG + (toG - fromG) * t,
        fromB + (toB - fromB) * t
      );
    }));
  }

  private spawnParticles(type: string, count: number): void {
    const color = PARTICLE_COLOR[type] ?? 0xffffff;
    const fx = new ParticleFX({ count, color, size: 0.18 });

    if (type === 'ros') {
      for (let i = 0; i < count; i++) {
        fx.data.push({
          r: 2 + Math.random() * 3.5,
          theta: Math.random() * Math.PI * 2,
          phi: Math.acos(2 * Math.random() - 1),
          speed: 0.2 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2
        });
      }
      fx.setUpdate((dt, elapsed) => {
        for (let i = 0; i < count; i++) {
          const d = fx.data[i];
          d.theta += dt * d.speed;
          d.phi += Math.sin(elapsed + d.phase) * dt * 0.3;
          const rr = d.r + Math.sin(elapsed * 2 + d.phase) * 0.25;
          fx.setPosition(
            i,
            rr * Math.sin(d.phi) * Math.cos(d.theta),
            rr * Math.cos(d.phi),
            rr * Math.sin(d.phi) * Math.sin(d.theta)
          );
        }
      });
    } else if (type === 'atp') {
      for (let i = 0; i < count; i++) {
        fx.data.push({
          theta: Math.random() * Math.PI * 2,
          phi: Math.acos(2 * Math.random() - 1),
          r: 1 + Math.random() * 4,
          speed: 0.5 + Math.random() * 0.6
        });
      }
      fx.setUpdate((_dt, elapsed) => {
        for (let i = 0; i < count; i++) {
          const d = fx.data[i];
          const pulse = Math.sin(elapsed * d.speed + d.theta) * 0.5;
          const rr = d.r + pulse;
          fx.setPosition(
            i,
            rr * Math.sin(d.phi) * Math.cos(d.theta),
            rr * Math.cos(d.phi),
            rr * Math.sin(d.phi) * Math.sin(d.theta)
          );
        }
      });
    } else if (type === 'calcium') {
      for (let i = 0; i < count; i++) {
        fx.data.push({
          theta: Math.random() * Math.PI * 2,
          phi: Math.acos(2 * Math.random() - 1),
          r: 0.5 + Math.random() * 0.5,
          maxR: 4 + Math.random() * 2,
          speed: 0.6 + Math.random() * 0.8
        });
      }
      fx.setUpdate((dt, _elapsed) => {
        for (let i = 0; i < count; i++) {
          const d = fx.data[i];
          d.r = Math.min(d.maxR, d.r + dt * d.speed);
          if (d.r >= d.maxR - 0.05) d.r = 0.5 + Math.random() * 0.5;
          fx.setPosition(
            i,
            d.r * Math.sin(d.phi) * Math.cos(d.theta),
            d.r * Math.cos(d.phi),
            d.r * Math.sin(d.phi) * Math.sin(d.theta)
          );
        }
      });
    } else if (type === 'protein') {
      const from = { x: -1.2, y: 0.6, z: 0.2 };
      for (let i = 0; i < count; i++) {
        fx.data.push({
          t: Math.random(),
          speed: 0.3 + Math.random() * 0.3,
          target: {
            x: -3 + Math.random() * 2,
            y: -2 + Math.random() * 4,
            z: 2.5 + Math.random() * 2
          }
        });
      }
      fx.setUpdate((dt, _elapsed) => {
        for (let i = 0; i < count; i++) {
          const d = fx.data[i];
          d.t += dt * d.speed;
          if (d.t > 1) {
            d.t = 0;
            d.target = {
              x: -3 + Math.random() * 2,
              y: -2 + Math.random() * 4,
              z: 2.5 + Math.random() * 2
            };
          }
          const t = d.t;
          fx.setPosition(
            i,
            from.x + (d.target.x - from.x) * t,
            from.y + (d.target.y - from.y) * t + Math.sin(t * Math.PI * 4) * 0.3,
            from.z + (d.target.z - from.z) * t
          );
        }
      });
    } else if (type === 'virion') {
      for (let i = 0; i < count; i++) {
        fx.data.push({
          theta: Math.random() * Math.PI * 2,
          phi: Math.acos(2 * Math.random() - 1),
          r: 10 + Math.random() * 3,
          targetR: 2 + Math.random() * 3,
          speed: 0.4 + Math.random() * 0.5,
          delay: Math.random() * 2
        });
      }
      fx.setUpdate((dt, elapsed) => {
        for (let i = 0; i < count; i++) {
          const d = fx.data[i];
          const tt = elapsed - d.delay;
          if (tt > 0 && d.r > d.targetR) {
            d.r -= dt * d.speed;
          }
          fx.setPosition(
            i,
            d.r * Math.sin(d.phi) * Math.cos(d.theta),
            d.r * Math.cos(d.phi),
            d.r * Math.sin(d.phi) * Math.sin(d.theta)
          );
        }
      });
    }

    this.fxGroup.add(fx.points);
    this.activeFX.push(fx);
  }
}