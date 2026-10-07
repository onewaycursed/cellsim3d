import type { Scenario } from '../types/scenario';
import type { ElementId } from '../data/elementInfo';
import { ELEMENT_INFO } from '../data/elementInfo';

export interface UIPanelCallbacks {
  onScenarioSelect: (scenario: Scenario) => void;
}

export class UIPanel {
  private scenarios: Scenario[];
  private callbacks: UIPanelCallbacks;
  private organelleCard!: HTMLDivElement;
  private panel!: HTMLDivElement;
  private overlay!: HTMLDivElement;

  constructor(scenarios: Scenario[], callbacks: UIPanelCallbacks) {
    this.scenarios = scenarios;
    this.callbacks = callbacks;
    this.render();
    this.setupMobileMenu();
  }

  public setActive(id: string): void {
    document.querySelectorAll<HTMLButtonElement>('.scenario-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === id);
    });
    const scenario = this.scenarios.find(s => s.id === id);
    if (scenario) this.updateInfoCard(scenario);
  }

  public showElement(id: ElementId | null): void {
    if (!id) {
      this.organelleCard.classList.remove('visible');
      return;
    }
    const info = ELEMENT_INFO[id];
    this.organelleCard.innerHTML = `
      <button class="close-btn" aria-label="Закрыть">×</button>
      <h3>${info.title}</h3>
      <div class="organelle-short">${info.short}</div>
      <p>${info.description}</p>
      <ul>${info.facts.map(f => `<li>${f}</li>`).join('')}</ul>
    `;
    this.organelleCard.classList.add('visible');

    const closeBtn = this.organelleCard.querySelector('.close-btn');
    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.organelleCard.classList.remove('visible');
    });
  }

  private render(): void {
    const panel = document.createElement('div');
    panel.id = 'ui-panel';

    const title = document.createElement('div');
    title.className = 'ui-title';
    title.innerHTML =
      '<h1>CellSim 3D</h1><div class="subtitle">Интерактивная модель клетки</div>';
    panel.appendChild(title);

    const physiology = this.scenarios.filter(s => s.category === 'physiology');
    const pathology = this.scenarios.filter(s => s.category === 'pathology');

    if (physiology.length) panel.appendChild(this.createSection('Физиология', physiology));
    if (pathology.length) panel.appendChild(this.createSection('Патологии', pathology));

    document.body.appendChild(panel);
    this.panel = panel;

    const info = document.createElement('div');
    info.id = 'ui-info';
    info.innerHTML = '<h3 id="ui-info-title"></h3><p id="ui-info-text"></p>';
    document.body.appendChild(info);

    const organelle = document.createElement('div');
    organelle.id = 'ui-organelle';
    document.body.appendChild(organelle);
    this.organelleCard = organelle;

    const legend = document.createElement('div');
    legend.id = 'ui-legend';
    legend.innerHTML = `
      <div class="legend-item"><span class="dot" style="background:#ffe066"></span>АТФ</div>
      <div class="legend-item"><span class="dot" style="background:#ff3355"></span>ROS</div>
      <div class="legend-item"><span class="dot" style="background:#44ddff"></span>Ca²⁺</div>
      <div class="legend-item"><span class="dot" style="background:#66ff88"></span>Белки</div>
      <div class="legend-item"><span class="dot" style="background:#cc66ff"></span>Вирионы</div>
    `;
    document.body.appendChild(legend);

    const hint = document.createElement('div');
    hint.id = 'ui-hint';
    hint.textContent = 'ЛКМ — вращение · Колесо — зум · Клик по органелле — описание';
    document.body.appendChild(hint);

    const overlay = document.getElementById('overlay') as HTMLDivElement;
    this.overlay = overlay;
  }

  private setupMobileMenu(): void {
    const burger = document.getElementById('burger');
    if (!burger) return;

    burger.addEventListener('click', () => {
      const isOpen = this.panel.classList.contains('open');
      if (isOpen) {
        this.panel.classList.remove('open');
        this.overlay.classList.remove('visible');
      } else {
        this.panel.classList.add('open');
        this.overlay.classList.add('visible');
      }
    });

    this.overlay.addEventListener('click', () => {
      this.panel.classList.remove('open');
      this.overlay.classList.remove('visible');
    });
  }

  private createSection(label: string, scenarios: Scenario[]): HTMLElement {
    const section = document.createElement('div');
    section.className = 'ui-section';

    const header = document.createElement('div');
    header.className = 'ui-section-label';
    header.textContent = label;
    section.appendChild(header);

    scenarios.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'scenario-btn';
      btn.dataset.id = s.id;
      btn.textContent = s.title;
      btn.addEventListener('click', () => {
        this.setActive(s.id);
        this.callbacks.onScenarioSelect(s);
        // На мобильных закрываем меню после выбора сценария
        if (window.innerWidth <= 720) {
          this.panel.classList.remove('open');
          this.overlay.classList.remove('visible');
        }
      });
      section.appendChild(btn);
    });

    return section;
  }

  private updateInfoCard(scenario: Scenario): void {
    const t = document.getElementById('ui-info-title');
    const b = document.getElementById('ui-info-text');
    if (t) t.textContent = scenario.title;
    if (b) b.textContent = scenario.description;
  }
}