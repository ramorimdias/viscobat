/*
 * Client‑side logic for the viscosity application.
 *
 * This script handles language switching, tab navigation,
 * form submissions, dynamic table row management, basic
 * chart rendering and interactions with the Flask backend.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* --- Translation dictionary --- */
  const translations = {
    app_title: { FR: 'Viscobat v2.0', EN: 'Viscobat v2.0' },
    app_name: { FR: 'Viscobat v2.0', EN: 'Viscobat v2.0' },
    tab_vi: { FR: '1. VI (ASTM D2270)', EN: '1. VI (ASTM D2270)' },
    tab_vi_tooltip: {
      FR: 'Calcule l’indice de viscosité à partir de deux KV selon l’ASTM D2270.',
      EN: 'Compute viscosity index from two KVs per ASTM D2270.'
    },
    tab_temp: { FR: '2. Extrapolation T', EN: '2. T extrapolation' },
    tab_temp_tooltip: {
      FR: 'Prédit les propriétés en fonction de la température.',
      EN: 'Predict properties versus temperature.'
    },
    tab_mixture: { FR: '3. Mélange → Viscosité', EN: '3. Blend → Viscosity' },
    tab_mixture_tooltip: {
      FR: 'Saisir les KV composants et leurs fractions connues ; calcule le KV du mélange.',
      EN: 'Enter component KVs and known fractions; get mixture KV.'
    },
    tab_two_bases: {
      FR: '4. Viscosité cible → Mélange',
      EN: '4. Target Viscosity → Blend'
    },
    tab_two_bases_tooltip: {
      FR: 'Entrer un KV cible (+ % fixés en option) ; résout les fractions inconnues.',
      EN: 'Give target KV (+ optional fixed %); solve unknown fractions.'
    },
    tab_solver: { FR: '5. Mélanges Complexes', EN: '5. Complex Blends' },
    tab_solver_tooltip: {
      FR: 'Résout des mélanges complexes avec contraintes, valeur/plage cibles, objectifs de maximisation ou minimisation des fractions, etc.',
      EN: 'Solve complex blends with constraints, target value, target range, maximise, minimise fractions, etc.'
    },
    vi_heading: { FR: '1. VI (ASTM D2270)', EN: '1. VI (ASTM D2270)' },
    temp_heading: { FR: '2. Extrapolation T', EN: '2. T extrapolation' },
    subtab_kv: { FR: 'KV (cSt)', EN: 'KV (cSt)' },
    subtab_density: { FR: 'Densité (kg/m³)', EN: 'Density (kg/m³)' },
    subtab_cp: { FR: 'Cp (kJ/kgK)', EN: 'Cp (kJ/kgK)' },
    subtab_thermal: { FR: 'Conductivité thermique (W/mK)', EN: 'Thermal conductivity (W/mK)' },
    kv_heading: { FR: 'KV (cSt)', EN: 'KV (cSt)' },
    density_heading: { FR: 'Densité (kg/m³)', EN: 'Density (kg/m³)' },
    cp_heading: { FR: 'Cp (kJ/kgK)', EN: 'Cp (kJ/kgK)' },
    thermal_heading: { FR: 'Conductivité thermique (W/mK)', EN: 'Thermal conductivity (W/mK)' },
    mixture_heading: { FR: '3. Mélange → Viscosité', EN: '3. Blend → Viscosity' },
    two_bases_heading: {
      FR: '4. Viscosité cible → Mélange',
      EN: '4. Target Viscosity → Blend'
    },
    solver_heading: { FR: '5. Mélanges Complexes', EN: '5. Complex Blends' },
    label_v1: { FR: 'Viscosité  1 (mm²/s)', EN: 'Viscosity 1 (mm²/s)' },
    label_v2: { FR: 'Viscosité  2 (mm²/s)', EN: 'Viscosity 2 (mm²/s)' },
    label_t1: { FR: 'Température 1 (°C)', EN: 'Temperature 1 (°C)' },
    label_t2: { FR: 'Température 2 (°C)', EN: 'Temperature 2 (°C)' },
    label_target_temp: { FR: 'Température voulue (°C)', EN: 'Target temperature (°C)' },
    btn_calculate: { FR: 'Calculer', EN: 'Calculate' },
    btn_solve: { FR: 'Résoudre', EN: 'Solve' },
    btn_add_component: { FR: 'Ajouter un constituant', EN: 'Add component' },
    btn_add_known: { FR: 'Ajouter un constituant connu', EN: 'Add known component' },
    btn_refresh: { FR: 'Reset', EN: 'Reset' },
    table_temp: { FR: 'Température (°C)', EN: 'Temperature (°C)' },
    table_visc: { FR: 'Viscosité cinématique (mm²/s)', EN: 'Kinematic Viscosity (mm²/s)' },
    table_id: { FR: 'ID', EN: 'ID' },
    axis_temp: { FR: 'Température (°C)', EN: 'Temperature (°C)' },
    axis_visc: { FR: 'Viscosité cinématique (mm²/s)', EN: 'Kinematic Viscosity (mm²/s)' },
    table_percent: { FR: '% massique', EN: '% mass' },
    label_target_mix: { FR: 'Viscosité cinématique du mélange cible (mm²/s)', EN: 'Target mixture kinematic viscosity (mm²/s)' },
    label_baseA: { FR: 'Viscosité cinématique du constituant A (mm²/s)', EN: 'Kinematic viscosity of component A (mm²/s)' },
    label_baseB: { FR: 'Viscosité cinématique du constituant B (mm²/s)', EN: 'Kinematic viscosity of component B (mm²/s)' },
    solver_type: { FR: 'Contrainte', EN: 'Constraint' },
    solver_value: { FR: '% massique', EN: '% mass' },
    solver_mix: { FR: 'Contrainte sur la viscosité cinématique du mélange', EN: 'Mixture kinematic viscosity constraint' },
    solver_mix_type: { FR: 'Type', EN: 'Type' },
    solver_free: { FR: 'Libre', EN: 'Free' },
    solver_range: { FR: 'Intervalle', EN: 'Range' },
    solver_min: { FR: 'Minimiser', EN: 'Minimise' },
    solver_max: { FR: 'Maximiser', EN: 'Maximise' },
    solver_set: { FR: 'Fixer une valeur', EN: 'Set value' },
    solver_mix_value: { FR: 'Viscosité cinématique (mm²/s)', EN: 'Kinematic Viscosity (mm²/s)' },
    solver_min_value: { FR: 'Min', EN: 'Min' },
    solver_max_value: { FR: 'Max', EN: 'Max' },
    btn_solve: { FR: 'Résoudre', EN: 'Solve' },
    solver_free: { FR: 'Libre', EN: 'Free' },
    solver_range: { FR: 'Intervalle', EN: 'Range' },
    solver_min: { FR: 'Minimiser', EN: 'Minimise' },
    solver_max: { FR: 'Maximiser', EN: 'Maximise' },
    solver_set: { FR: 'Fixer une valeur', EN: 'Set value' },
    solver_diag_unique: {
      FR: 'Solution unique trouvée avec ces contraintes.',
      EN: 'The constraints lead to a unique solution.'
    },
    solver_diag_multiple: {
      FR: 'Plusieurs solutions satisfont ces contraintes. Ajoutez un objectif ou des bornes pour obtenir une réponse unique.',
      EN: 'Multiple solutions satisfy these constraints. Add an objective or bounds to obtain a unique answer.'
    },
    solver_summary_title: { FR: 'Résumé des contraintes', EN: 'Constraints summary' },
    solver_summary_mixture: { FR: 'Mélange', EN: 'Mixture' },
    solver_result_title: { FR: 'Résultats', EN: 'Results' },
    solver_possible_range: { FR: 'Plage faisable', EN: 'Feasible range' },
    modal_title: { FR: 'Viscobat v2.0', EN: 'Viscobat v2.0' },
    modal_last_update_label: { FR: 'Dernière mise à jour :', EN: 'Last update:' },
    modal_last_update_value: { FR: '15 septembre 2025', EN: '15 September 2025' },
    modal_version_label: { FR: 'Version :', EN: 'Version:' },
    modal_version_value: { FR: '1.3', EN: '1.3' },
    modal_author_label: { FR: 'Créé par :', EN: 'Created by:' },
    modal_author_value: { FR: 'Rodrigo AMORIM DIAS', EN: 'Rodrigo AMORIM DIAS' },
    modal_description: {
      FR: 'La corrélation logarithmique de Walter est le cœur de cet outil, permettant d’établir avec précision le lien entre viscosité et température pour accompagner vos formulations.',
      EN: 'The Walter log correlation is the heart of this tool, enabling a precise link between viscosity and temperature to support your formulations.'
    },
    modal_close_label: { FR: 'Fermer', EN: 'Close' },
    walther_equation_label: { FR: 'Ajustement log-log (Walther) :', EN: 'Log–log fit (Walther):' },
    density_label: { FR: 'Densité (kg/m³)', EN: 'Density (kg/m³)' },
    cp_label: { FR: 'Cp (kJ/kgK)', EN: 'Cp (kJ/kgK)' },
    thermal_label: { FR: 'Conductivité thermique (W/mK)', EN: 'Thermal conductivity (W/mK)' },
    btn_add_point: { FR: 'Ajouter un point', EN: 'Add point' },
    linear_equation_label: { FR: 'Régression linéaire :', EN: 'Linear regression:' },
    beta_label: { FR: 'Coefficient de dilatation thermique β :', EN: 'Thermal expansion coefficient β:' }
  };

  // --- Persistence helpers using localStorage ---
  function setStored(name, value) {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function getStored(name) {
    try {
      return localStorage.getItem(name) || '';
    } catch (e) {
      return '';
    }
  }

  function removeStored(name) {
    try {
      localStorage.removeItem(name);
    } catch (e) {
      /* ignore */
    }
  }

  function setStoredJson(name, value) {
    try {
      setStored(name, JSON.stringify(value));
    } catch (e) {
      /* ignore */
    }
  }

  function getStoredJson(name, fallback = null) {
    try {
      const raw = getStored(name);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function clearPrefixedStorage(prefix) {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      /* ignore */
    }
  }

  function registerPersistent(el) {


    if (!el || !el.id) return;

    const saved = getStored('vb_' + el.id);
    if (saved) {
      if (el.type === 'checkbox') {
        el.checked = saved === 'true';
      } else {
        el.value = saved;
      }
    } else {
      const initial = el.type === 'checkbox' ? el.checked : el.value;
      setStored('vb_' + el.id, initial);
    }

    if (!el.dataset.persistRegistered) {
      ['input', 'change'].forEach(evt =>
        el.addEventListener(evt, () => {
          const val = el.type === 'checkbox' ? el.checked : el.value;
          setStored('vb_' + el.id, val);
        })
      );
      el.dataset.persistRegistered = 'true';
    }


  }

  let currentLang = getStored('vb_language') || 'FR';
  setStored('vb_language', currentLang);
  const languageSelect = document.getElementById('languageSelect');
  languageSelect.value = currentLang;

  /**
   * Apply translations to all elements with a data-i18n attribute.
   */
  function translatePage() {
    document.documentElement.lang = currentLang.toLowerCase();
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const trans = translations[key];
      if (trans && trans[currentLang]) {
        if (el.dataset.i18nAttr) {
          el.setAttribute(el.dataset.i18nAttr, trans[currentLang]);
        } else if (el.tagName.toLowerCase() === 'title') {
          document.title = trans[currentLang];
        } else {
          el.textContent = trans[currentLang];
        }
      }

      Object.entries(el.dataset).forEach(([dataKey, value]) => {
        if (!dataKey.startsWith('i18n') || dataKey === 'i18n' || dataKey === 'i18nAttr') {
          return;
        }

        const attrKey = dataKey.slice(4);
        if (!attrKey) return;

        const attrName = attrKey
          .charAt(0)
          .toLowerCase() + attrKey.slice(1).replace(/[A-Z]/g, char => '-' + char.toLowerCase());

        const attrTrans = translations[value];
        if (attrTrans && attrTrans[currentLang]) {
          el.setAttribute(attrName, attrTrans[currentLang]);
        }
      });
    });
  }

  languageSelect.addEventListener('change', () => {
    currentLang = languageSelect.value;
    setStored('vb_language', currentLang);
    translatePage();
    redrawActiveSubtab();
    renderWaltherEquation();
    ['density', 'cp', 'thermal'].forEach(renderRegressionEquation);
  });

  translatePage();

  // Restore saved form values and persist changes
  document.querySelectorAll('input, select').forEach(registerPersistent);

  document.getElementById('reset-btn').addEventListener('click', () => {
    const savedLang = getStored('vb_language') || currentLang;
    clearPrefixedStorage('vb_');
    setStored('vb_language', savedLang);
    window.location.reload();
  });

  /* --- Tab navigation --- */
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      // activate clicked tab
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      // show corresponding content
      const tab = button.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(sec => {
        sec.classList.remove('active');
      });
      document.getElementById('tab-' + tab).classList.add('active');
      // redraw chart if necessary
      if (tab === 'temp') {
        redrawActiveSubtab();
      }
    });
  });

  /* --- Viscosity Index form --- */
  const viForm = document.getElementById('viForm');
  const viResultDiv = document.getElementById('vi-result');
  viForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v1 = parseFloat(document.getElementById('vi-v1').value);
    const t1 = parseFloat(document.getElementById('vi-t1').value);
    const v2 = parseFloat(document.getElementById('vi-v2').value);
    const t2 = parseFloat(document.getElementById('vi-t2').value);
    fetch('/api/vi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ v1, t1, v2, t2 })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          viResultDiv.textContent = body.error || 'Erreur';
        } else {
          const v40 = body.v40;
          const v100 = body.v100;
          const vi = body.vi;
          viResultDiv.innerHTML = '';
          const p1 = document.createElement('p');
          p1.innerHTML = `<strong>${translations['vi_result_v40'] ? translations['vi_result_v40'][currentLang] : 'Kinematic Viscosity at 40°C:'} </strong> ${v40.toFixed(2)} mm²/s`;
          const p2 = document.createElement('p');
          p2.innerHTML = `<strong>${translations['vi_result_v100'] ? translations['vi_result_v100'][currentLang] : 'Kinematic Viscosity at 100°C:'} </strong> ${v100.toFixed(2)} mm²/s`;
          const p3 = document.createElement('p');
          p3.innerHTML = `<strong>${translations['vi_result_vi'] ? translations['vi_result_vi'][currentLang] : 'VI'} </strong> ${vi}`;
          viResultDiv.appendChild(p1);
          viResultDiv.appendChild(p2);
          viResultDiv.appendChild(p3);
        }
      })
      .catch(err => {
        viResultDiv.textContent = err.toString();
      });
  });

  // Provide translation keys for VI results
  translations['vi_result_v40'] = { FR: 'Viscosité cinématique à 40 °C :', EN: 'Kinematic Viscosity at 40°C:' };
  translations['vi_result_v100'] = { FR: 'Viscosité cinématique à 100 °C :', EN: 'Kinematic Viscosity at 100°C:' };
  translations['vi_result_vi'] = { FR: 'Indice de viscosité :', EN: 'Viscosity index:' };

  /* --- Temperature extrapolation with subtabs --- */
  const tempForm = document.getElementById('tempForm');
  const tempTableBody = document.querySelector('#temp-table tbody');
  const tempResult = document.getElementById('temp-target-result');
  const tempCanvas = document.getElementById('temp-chart');
  const waltherEquation = document.getElementById('walther-equation');
  const subTabButtons = document.querySelectorAll('.sub-tab-button');
  const subTabSections = document.querySelectorAll('.sub-tab-content');
  const regressionChartData = { density: [], cp: [], thermal: [] };
  const regressionExperimentalPoints = { density: [], cp: [], thermal: [] };
  const regressionFits = { density: null, cp: null, thermal: null };
  let currentChartData = [];
  let waltherParams = null;
  let waltherExperimentalPoints = [];

  const regressionConfigs = {
    density: {
      form: document.getElementById('densityForm'),
      inputBody: document.getElementById('density-input-body'),
      outputBody: document.querySelector('#density-table tbody'),
      canvas: document.getElementById('density-chart'),
      equationEl: document.getElementById('density-equation'),
      betaEl: document.getElementById('density-beta'),
      labelKey: 'density_label',
      equationName: 'ρ'
    },
    cp: {
      form: document.getElementById('cpForm'),
      inputBody: document.getElementById('cp-input-body'),
      outputBody: document.querySelector('#cp-table tbody'),
      canvas: document.getElementById('cp-chart'),
      equationEl: document.getElementById('cp-equation'),
      labelKey: 'cp_label',
      equationName: 'Cp'
    },
    thermal: {
      form: document.getElementById('thermalForm'),
      inputBody: document.getElementById('thermal-input-body'),
      outputBody: document.querySelector('#thermal-table tbody'),
      canvas: document.getElementById('thermal-chart'),
      equationEl: document.getElementById('thermal-equation'),
      labelKey: 'thermal_label',
      equationName: 'k'
    }
  };

  subTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.subtab;
      subTabButtons.forEach(b => b.classList.remove('active'));
      subTabSections.forEach(sec => sec.classList.remove('active'));
      btn.classList.add('active');
      const activeSection = document.getElementById(`subtab-${key}`);
      if (activeSection) activeSection.classList.add('active');
      redrawActiveSubtab();
    });
  });

  function redrawActiveSubtab() {
    const active = document.querySelector('.sub-tab-button.active');
    if (!active) return;
    const key = active.dataset.subtab;
    if (key === 'kv') {
      drawLineChart(tempCanvas, currentChartData, {
        xLabel: translations['axis_temp'][currentLang] || 'Temperature (°C)',
        yLabel: translations['axis_visc'][currentLang] || 'Kinematic Viscosity (mm²/s)',
        experimentalPoints: waltherExperimentalPoints
      });
    } else if (regressionChartData[key]) {
      const cfg = regressionConfigs[key];
      drawLineChart(cfg.canvas, regressionChartData[key], {
        xLabel: translations['axis_temp'][currentLang] || 'Temperature (°C)',
        yLabel: translations[cfg.labelKey][currentLang] || '',
        experimentalPoints: regressionExperimentalPoints[key]
      });
    }
  }

  function persistRegressionInputs(key) {
    const cfg = regressionConfigs[key];
    if (!cfg || !cfg.inputBody) return;
    const points = [];
    cfg.inputBody.querySelectorAll('.regression-input-row').forEach(row => {
      const tVal = parseFloat(row.querySelector('.reg-temp-input').value);
      const vVal = parseFloat(row.querySelector('.reg-value-input').value);
      if (!isNaN(tVal) && !isNaN(vVal)) {
        points.push({ temperature: tVal, value: vVal });
      }
    });
    setStoredJson(`vb_reg_${key}_inputs`, points);
  }

  function addRegressionRow(tbody, key, values = {}) {
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.classList.add('regression-input-row');
    const tdTemp = document.createElement('td');
    const tempInput = document.createElement('input');
    tempInput.type = 'number';
    tempInput.step = 'any';
    tempInput.className = 'reg-temp-input';
    if (values.temperature !== undefined) tempInput.value = values.temperature;
    tdTemp.appendChild(tempInput);
    const tdVal = document.createElement('td');
    const valInput = document.createElement('input');
    valInput.type = 'number';
    valInput.step = 'any';
    valInput.className = 'reg-value-input';
    if (values.value !== undefined) valInput.value = values.value;
    tdVal.appendChild(valInput);
    const tdRemove = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.className = 'icon-btn';
    removeBtn.addEventListener('click', () => {
      tbody.removeChild(tr);
      if (key) persistRegressionInputs(key);
    });
    tdRemove.appendChild(removeBtn);
    tr.appendChild(tdTemp);
    tr.appendChild(tdVal);
    tr.appendChild(tdRemove);
    tbody.appendChild(tr);
    if (key) {
      ['input', 'change'].forEach(evt => {
        tempInput.addEventListener(evt, () => persistRegressionInputs(key));
        valInput.addEventListener(evt, () => persistRegressionInputs(key));
      });
    }
  }

  function persistRegressionResults(key, table, experimental = []) {
    setStoredJson(`vb_reg_${key}_results`, {
      table,
      fit: regressionFits[key],
      experimental
    });
  }

  function restoreRegressionInputs(key) {
    const cfg = regressionConfigs[key];
    if (!cfg || !cfg.inputBody) return;
    const saved = getStoredJson(`vb_reg_${key}_inputs`, []);
    cfg.inputBody.innerHTML = '';
    if (saved.length > 0) {
      saved.forEach(entry => addRegressionRow(cfg.inputBody, key, entry));
    } else {
      addRegressionRow(cfg.inputBody, key);
      addRegressionRow(cfg.inputBody, key);
    }
  }

  function restoreRegressionResults(key) {
    const cfg = regressionConfigs[key];
    if (!cfg || !cfg.outputBody) return;
    const saved = getStoredJson(`vb_reg_${key}_results`, null);
    cfg.outputBody.innerHTML = '';
    regressionChartData[key] = [];
    regressionFits[key] = null;
    if (saved && Array.isArray(saved.table)) {
      saved.table.forEach(row => {
        const tr = document.createElement('tr');
        const tdT = document.createElement('td');
        tdT.textContent = row.temperature;
        const tdV = document.createElement('td');
        tdV.textContent = Number(row.value).toFixed(4);
        tr.appendChild(tdT);
        tr.appendChild(tdV);
        cfg.outputBody.appendChild(tr);
        regressionChartData[key].push({ x: row.temperature, y: row.value });
      });
      regressionFits[key] = saved.fit || null;
      regressionExperimentalPoints[key] = Array.isArray(saved.experimental)
        ? saved.experimental.map(pt => ({ x: pt.x, y: pt.y }))
        : [];
    }
    renderRegressionEquation(key);
  }

  ['density', 'cp', 'thermal'].forEach(key => {
    restoreRegressionInputs(key);
    restoreRegressionResults(key);
  });

  document.querySelectorAll('.regression-add-row').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const tbody = document.getElementById(targetId);
      const match = Object.entries(regressionConfigs).find(([, cfg]) => cfg.inputBody && cfg.inputBody.id === targetId);
      const key = match ? match[0] : undefined;
      addRegressionRow(tbody, key);
      if (key) persistRegressionInputs(key);
    });
  });

  function persistWaltherState(data, targetTemp, experimental = []) {
    setStoredJson('vb_walther_state', {
      params: { slope: data.slope, intercept: data.intercept },
      table: data.table,
      targetViscosity: data.targetViscosity,
      targetTemp,
      experimental
    });
  }

  function restoreWaltherState() {
    const saved = getStoredJson('vb_walther_state', null);
    if (!saved) return;
    tempTableBody.innerHTML = '';
    currentChartData = [];
    waltherParams = saved.params;
    waltherExperimentalPoints = Array.isArray(saved.experimental)
      ? saved.experimental.map(pt => ({ x: pt.x, y: pt.y }))
      : [];
    if (Array.isArray(saved.table)) {
      saved.table.forEach(row => {
        const tr = document.createElement('tr');
        const tdT = document.createElement('td');
        tdT.textContent = row.temperature;
        const tdV = document.createElement('td');
        tdV.textContent = Number(row.viscosity).toFixed(2);
        tr.appendChild(tdT);
        tr.appendChild(tdV);
        tempTableBody.appendChild(tr);
        currentChartData.push({ x: row.temperature, y: row.viscosity });
      });
    }
    if (saved.targetViscosity !== undefined) {
      tempResult.innerHTML = `<strong>${translations['temp_result_at'] ? translations['temp_result_at'][currentLang] : 'Kinematic viscosity at target:'}</strong> ${Number(saved.targetViscosity).toFixed(2)} mm²/s`;
    }
    renderWaltherEquation();
    redrawActiveSubtab();
  }

  tempForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v1 = parseFloat(document.getElementById('temp-v1').value);
    const t1 = parseFloat(document.getElementById('temp-t1').value);
    const v2 = parseFloat(document.getElementById('temp-v2').value);
    const t2 = parseFloat(document.getElementById('temp-t2').value);
    const target = parseFloat(document.getElementById('temp-target').value);
    const experimentalPoints = [
      { x: t1, y: v1 },
      { x: t2, y: v2 }
    ].filter(pt => !Number.isNaN(pt.x) && !Number.isNaN(pt.y));
    waltherExperimentalPoints = experimentalPoints;
    fetch('/api/viscosity_temperature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ v1, t1, v2, t2, target })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          tempResult.textContent = body.error || 'Erreur';
        } else {
          if (body.targetViscosity !== undefined) {
            tempResult.innerHTML = `<strong>${translations['temp_result_at'] ? translations['temp_result_at'][currentLang] : 'Kinematic viscosity at target:'}</strong> ${body.targetViscosity.toFixed(2)} mm²/s`;
          }
          tempTableBody.innerHTML = '';
          currentChartData = [];
          waltherParams = { slope: body.slope, intercept: body.intercept };
          body.table.forEach(row => {
            const tr = document.createElement('tr');
            const tdT = document.createElement('td');
            tdT.textContent = row.temperature;
            const tdV = document.createElement('td');
            tdV.textContent = row.viscosity.toFixed(2);
            tr.appendChild(tdT);
            tr.appendChild(tdV);
            tempTableBody.appendChild(tr);
            currentChartData.push({ x: row.temperature, y: row.viscosity });
          });
          persistWaltherState(body, target, waltherExperimentalPoints);
          renderWaltherEquation();
          redrawActiveSubtab();
        }
      })
      .catch(err => {
        tempResult.textContent = err.toString();
      });
  });

  translations['temp_result_at'] = { FR: 'Viscosité cinématique à la température voulue :', EN: 'Kinematic viscosity at target temperature:' };

  restoreWaltherState();

  function renderWaltherEquation(params = waltherParams) {
    if (!waltherEquation) return;
    if (!params) {
      waltherEquation.textContent = '';
      return;
    }
    const label = translations['walther_equation_label'][currentLang] || 'Log–log fit (Walther):';
    const slope = params.slope;
    const intercept = params.intercept;
    const equation = `KV(T) = 10^(10^(${intercept.toFixed(4)} − ${slope.toFixed(4)} · log₁₀(T + 273.15))) − 0.7`;
    waltherEquation.innerHTML = `<strong>${label}</strong> ${equation}`;
  }

  Object.entries(regressionConfigs).forEach(([key, cfg]) => {
    if (!cfg.form) return;
    cfg.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const points = [];
      cfg.inputBody.querySelectorAll('.regression-input-row').forEach(row => {
        const tVal = parseFloat(row.querySelector('.reg-temp-input').value);
        const vVal = parseFloat(row.querySelector('.reg-value-input').value);
        if (!isNaN(tVal) && !isNaN(vVal)) {
          points.push({ temperature: tVal, value: vVal });
        }
      });
      if (points.length < 2) {
        cfg.equationEl.textContent = `${translations['linear_equation_label'][currentLang]} ${currentLang === 'FR' ? 'Ajoutez au moins deux points.' : 'Add at least two points.'}`;
        return;
      }
      regressionExperimentalPoints[key] = points.map(pt => ({ x: pt.temperature, y: pt.value }));
      fetch('/api/property_regression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property: key, points })
      })
        .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
        .then(({ status, body }) => {
          if (status !== 200) {
            cfg.equationEl.textContent = body.error || 'Erreur';
            return;
          }
          cfg.outputBody.innerHTML = '';
          regressionChartData[key] = [];
          body.table.forEach(row => {
            const tr = document.createElement('tr');
            const tdT = document.createElement('td');
            tdT.textContent = row.temperature;
            const tdV = document.createElement('td');
            tdV.textContent = row.value.toFixed(4);
            tr.appendChild(tdT);
            tr.appendChild(tdV);
            cfg.outputBody.appendChild(tr);
            regressionChartData[key].push({ x: row.temperature, y: row.value });
          });
          regressionFits[key] = { slope: body.slope, intercept: body.intercept, beta: body.beta };
          persistRegressionResults(key, body.table, regressionExperimentalPoints[key]);
          renderRegressionEquation(key);
          redrawActiveSubtab();
        })
        .catch(err => {
          cfg.equationEl.textContent = err.toString();
        });
    });
  });

  function renderRegressionEquation(key) {
    const cfg = regressionConfigs[key];
    if (!cfg || !cfg.equationEl) return;
    const fit = regressionFits[key];
    if (!fit) {
      cfg.equationEl.textContent = '';
      if (cfg.betaEl) cfg.betaEl.textContent = '';
      return;
    }
    const label = translations['linear_equation_label'][currentLang] || 'Linear regression:';
    const propName = cfg.equationName || (translations[cfg.labelKey]?.[currentLang] || key.toUpperCase());
    const formatted = `${propName}(T) = ${fit.intercept.toFixed(4)} ${fit.slope >= 0 ? '+' : '−'} ${Math.abs(fit.slope).toFixed(4)}·T`;
    cfg.equationEl.innerHTML = `<strong>${label}</strong> ${formatted}`;
    if (cfg.betaEl) {
      if (fit.beta !== null && fit.beta !== undefined) {
        const betaLabel = translations['beta_label'][currentLang] || 'β:';
        cfg.betaEl.innerHTML = `${betaLabel} ${Number(fit.beta).toExponential(4)} 1/°C`;
      } else {
        cfg.betaEl.textContent = '';
      }
    }
  }

  /**
   * Draw a simple line chart on a canvas using the provided data.
   */
  function drawLineChart(canvas, data, { xLabel = 'Temperature (°C)', yLabel = 'Value', experimentalPoints = [] } = {}) {
    if (!canvas) return;
    const canvasStyle = window.getComputedStyle(canvas);
    const isHidden = canvasStyle.display === 'none' || !document.getElementById('tab-temp').classList.contains('active');
    if (isHidden) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const safeData = Array.isArray(data) ? data : [];
    const combinedPoints = [...safeData, ...(experimentalPoints || [])].filter(pt =>
      pt && Number.isFinite(pt.x) && Number.isFinite(pt.y)
    );
    if (combinedPoints.length === 0) return;
    let xMin = combinedPoints[0].x;
    let xMax = combinedPoints[0].x;
    let yMin = combinedPoints[0].y;
    let yMax = combinedPoints[0].y;
    combinedPoints.forEach(pt => {
      if (pt.x < xMin) xMin = pt.x;
      if (pt.x > xMax) xMax = pt.x;
      if (pt.y < yMin) yMin = pt.y;
      if (pt.y > yMax) yMax = pt.y;
    });
    const yRange = yMax - yMin;
    const xRange = xMax - xMin;
    if (yRange === 0) {
      yMax += 1;
    } else {
      yMax += yRange * 0.1;
      yMin -= yRange * 0.05;
    }
    if (xRange === 0) {
      xMin -= 1;
      xMax += 1;
    } else {
      xMin -= xRange * 0.05;
      xMax += xRange * 0.05;
    }
    const marginLeft = 90;
    const marginBottom = 60;
    const marginTop = 20;
    const marginRight = 20;
    const plotWidth = width - marginLeft - marginRight;
    const plotHeight = height - marginTop - marginBottom;
    const xToCanvas = (x) => marginLeft + ((x - xMin) / (xMax - xMin || 1)) * plotWidth;
    const yToCanvas = (y) => marginTop + plotHeight - ((y - yMin) / (yMax - yMin || 1)) * plotHeight;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop + plotHeight);
    ctx.lineTo(marginLeft + plotWidth, marginTop + plotHeight);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, marginTop + plotHeight);
    ctx.stroke();
    ctx.font = '12px Arial';
    ctx.fillStyle = '#444';
    combinedPoints.forEach(pt => {
      const xC = xToCanvas(pt.x);
      ctx.beginPath();
      ctx.moveTo(xC, marginTop + plotHeight);
      ctx.lineTo(xC, marginTop + plotHeight + 5);
      ctx.stroke();
      ctx.fillText(String(pt.x), xC - 10, marginTop + plotHeight + 18);
    });
    const yTicks = getNiceTicks(yMin, yMax, 5);
    yTicks.forEach(tick => {
      const yC = yToCanvas(tick);
      ctx.beginPath();
      ctx.moveTo(marginLeft - 5, yC);
      ctx.lineTo(marginLeft, yC);
      ctx.stroke();
      ctx.fillText(tick.toFixed(2), marginLeft - 50, yC + 4);
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(marginLeft, yC);
      ctx.lineTo(marginLeft + plotWidth, yC);
      ctx.stroke();
      ctx.strokeStyle = '#444';
    });
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, marginLeft + plotWidth / 2, marginTop + plotHeight + 40);
    ctx.save();
    ctx.translate(marginLeft - 75, marginTop + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();
    ctx.strokeStyle = '#c62828';
    ctx.lineWidth = 2;
    ctx.beginPath();
    safeData.forEach((pt, idx) => {
      const xC = xToCanvas(pt.x);
      const yC = yToCanvas(pt.y);
      if (idx === 0) {
        ctx.moveTo(xC, yC);
      } else {
        ctx.lineTo(xC, yC);
      }
    });
    ctx.stroke();

    if (experimentalPoints && experimentalPoints.length > 0) {
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 2;
      experimentalPoints.forEach(pt => {
        const xC = xToCanvas(pt.x);
        const yC = yToCanvas(pt.y);
        const size = 6;
        ctx.beginPath();
        ctx.moveTo(xC - size, yC - size);
        ctx.lineTo(xC + size, yC + size);
        ctx.moveTo(xC - size, yC + size);
        ctx.lineTo(xC + size, yC - size);
        ctx.stroke();
      });
    }
  }

  /**
   * Compute “nice” tick values for an axis.
   * Returns an array of numbers spanning [min, max].
   */
  function getNiceTicks(min, max, numTicks) {
    const range = niceNumber(max - min, false);
    const tickSpacing = niceNumber(range / (numTicks - 1), true);
    const niceMin = Math.floor(min / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(max / tickSpacing) * tickSpacing;
    const ticks = [];
    for (let x = niceMin; x <= niceMax + 0.5 * tickSpacing; x += tickSpacing) {
      ticks.push(x);
    }
    return ticks;
  }

  function niceNumber(range, round) {
    // exponent of range
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction;
    if (round) {
      if (fraction < 1.5) niceFraction = 1;
      else if (fraction < 3) niceFraction = 2;
      else if (fraction < 7) niceFraction = 5;
      else niceFraction = 10;
    } else {
      if (fraction <= 1) niceFraction = 1;
      else if (fraction <= 2) niceFraction = 2;
      else if (fraction <= 5) niceFraction = 5;
      else niceFraction = 10;
    }
    return niceFraction * Math.pow(10, exponent);
  }

  /* --- Mixture tab --- */
  const mixtureTableBody = document.querySelector('#mixture-table tbody');
  const addComponentBtn = document.getElementById('add-component-btn');
  const mixtureForm = document.getElementById('mixtureForm');
  const mixtureResultDiv = document.getElementById('mixture-result');
  const mixRowCountKey = 'vb_mix_row_count';

  function addMixtureRow(percent = '', viscosity = '') {
    const rowIndex = mixtureTableBody.children.length + 1;
    const tr = document.createElement('tr');
    // index cell
    const tdIndex = document.createElement('td');
    tdIndex.textContent = rowIndex;
    tr.appendChild(tdIndex);
    // percent cell
    const tdPercent = document.createElement('td');
    const inputPercent = document.createElement('input');
    inputPercent.type = 'number';
    inputPercent.step = 'any';
    inputPercent.value = percent;
    inputPercent.min = '0';
    inputPercent.id = `mix-percent-${rowIndex}`;
    tdPercent.appendChild(inputPercent);
    tr.appendChild(tdPercent);
    // viscosity cell
    const tdVisc = document.createElement('td');
    const inputVisc = document.createElement('input');
    inputVisc.type = 'number';
    inputVisc.step = 'any';
    inputVisc.value = viscosity;
    inputVisc.min = '0';
    inputVisc.id = `mix-visc-${rowIndex}`;
    tdVisc.appendChild(inputVisc);
    tr.appendChild(tdVisc);
    // remove button cell
    const tdRemove = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.className = 'secondary-btn';
    removeBtn.addEventListener('click', () => {
      mixtureTableBody.removeChild(tr);
      updateMixtureIndices();
    });
    tdRemove.appendChild(removeBtn);
    tr.appendChild(tdRemove);
    mixtureTableBody.appendChild(tr);
    registerPersistent(inputPercent);
    registerPersistent(inputVisc);
    setStored(mixRowCountKey, mixtureTableBody.children.length);
  }

  function updateMixtureIndices() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('vb_mix-percent-') || key.startsWith('vb_mix-visc-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) { /* ignore */ }
    Array.from(mixtureTableBody.children).forEach((tr, idx) => {
      const index = idx + 1;
      tr.children[0].textContent = index;
      const percentInput = tr.children[1].children[0];
      const viscInput = tr.children[2].children[0];
      percentInput.id = `mix-percent-${index}`;
      viscInput.id = `mix-visc-${index}`;
      setStored('vb_' + percentInput.id, percentInput.value);
      setStored('vb_' + viscInput.id, viscInput.value);
    });
    setStored(mixRowCountKey, mixtureTableBody.children.length);
  }

  addComponentBtn.addEventListener('click', () => {
    addMixtureRow();
  });
  const initialMixRows = parseInt(getStored(mixRowCountKey), 10) || 2;
  for (let i = 0; i < initialMixRows; i++) addMixtureRow();

  mixtureForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comps = [];
    let totalPercent = 0;
    let valid = true;
    Array.from(mixtureTableBody.children).forEach(tr => {
      const percent = parseFloat(tr.children[1].children[0].value);
      const visc = parseFloat(tr.children[2].children[0].value);
      if (!isNaN(percent) && !isNaN(visc) && percent > 0) {
        comps.push({ percent, viscosity: visc });
        totalPercent += percent;
      }
    });
    if (comps.length === 0) {
      mixtureResultDiv.textContent = currentLang === 'FR' ? 'Aucun constituant fourni' : 'No components provided';
      return;
    }
    if (Math.abs(totalPercent - 100) > 1e-6) {
      mixtureResultDiv.textContent = currentLang === 'FR' ? 'La somme des pourcentages doit être 100' : 'Sum of percentages must equal 100';
      return;
    }
    fetch('/api/mixture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ components: comps })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          mixtureResultDiv.textContent = body.error || 'Erreur';
        } else {
          mixtureResultDiv.innerHTML = `<strong>${currentLang === 'FR' ? 'Viscosité cinématique du mélange :' : 'Mixture kinematic viscosity:'}</strong> ${body.viscosity.toFixed(2)} mm²/s`;
        }
      })
      .catch(err => {
        mixtureResultDiv.textContent = err.toString();
      });
  });

  /* --- Two bases tab --- */
  const knownTableBody = document.querySelector('#known-table tbody');
  const addKnownBtn = document.getElementById('add-known-btn');
  const twoBasesForm = document.getElementById('twoBasesForm');
  const twoBasesResultDiv = document.getElementById('twoBases-result');
  const tbKnownCountKey = 'vb_tb_known_count';

  function addKnownRow(percent = '', viscosity = '') {
    const rowIndex = knownTableBody.children.length + 1;
    const tr = document.createElement('tr');
    const tdIndex = document.createElement('td');
    tdIndex.textContent = rowIndex;
    tr.appendChild(tdIndex);
    const tdPercent = document.createElement('td');
    const inputPercent = document.createElement('input');
    inputPercent.type = 'number';
    inputPercent.step = 'any';
    inputPercent.value = percent;
    inputPercent.min = '0';
    inputPercent.id = `tb-known-percent-${rowIndex}`;
    tdPercent.appendChild(inputPercent);
    tr.appendChild(tdPercent);
    const tdVisc = document.createElement('td');
    const inputVisc = document.createElement('input');
    inputVisc.type = 'number';
    inputVisc.step = 'any';
    inputVisc.value = viscosity;
    inputVisc.min = '0';
    inputVisc.id = `tb-known-visc-${rowIndex}`;
    tdVisc.appendChild(inputVisc);
    tr.appendChild(tdVisc);
    const tdRemove = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.className = 'secondary-btn';
    removeBtn.addEventListener('click', () => {
      knownTableBody.removeChild(tr);
      updateKnownIndices();
    });
    tdRemove.appendChild(removeBtn);
    tr.appendChild(tdRemove);
    knownTableBody.appendChild(tr);
    registerPersistent(inputPercent);
    registerPersistent(inputVisc);
    setStored(tbKnownCountKey, knownTableBody.children.length);
  }

  function updateKnownIndices() {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('vb_tb-known-percent-') || key.startsWith('vb_tb-known-visc-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) { /* ignore */ }
    Array.from(knownTableBody.children).forEach((tr, idx) => {
      const index = idx + 1;
      tr.children[0].textContent = index;
      const percentInput = tr.children[1].children[0];
      const viscInput = tr.children[2].children[0];
      percentInput.id = `tb-known-percent-${index}`;
      viscInput.id = `tb-known-visc-${index}`;
      setStored('vb_' + percentInput.id, percentInput.value);
      setStored('vb_' + viscInput.id, viscInput.value);
    });
    setStored(tbKnownCountKey, knownTableBody.children.length);
  }

  addKnownBtn.addEventListener('click', () => {
    addKnownRow();
  });
  const initialKnownRows = parseInt(getStored(tbKnownCountKey), 10) || 0;
  for (let i = 0; i < initialKnownRows; i++) addKnownRow();

  twoBasesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const target = parseFloat(document.getElementById('tb-target').value);
    const baseA = parseFloat(document.getElementById('tb-baseA').value);
    const baseB = parseFloat(document.getElementById('tb-baseB').value);
    const knownComponents = [];
    Array.from(knownTableBody.children).forEach(tr => {
      const percent = parseFloat(tr.children[1].children[0].value);
      const visc = parseFloat(tr.children[2].children[0].value);
      if (!isNaN(percent) && !isNaN(visc) && percent > 0) {
        knownComponents.push({ percent, viscosity: visc });
      }
    });
    fetch('/api/mix2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetViscosity: target, baseAViscosity: baseA, baseBViscosity: baseB, knownComponents })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          twoBasesResultDiv.textContent = body.error || 'Erreur';
        } else {
          twoBasesResultDiv.innerHTML = '';
          const pa = body.percentA;
          const pb = body.percentB;
          const pAEl = document.createElement('p');
          pAEl.innerHTML = `<strong>${currentLang === 'FR' ? 'Pourcentage du constituant A :' : 'Percentage of component A:'}</strong> ${pa.toFixed(2)} %`;
          const pBEl = document.createElement('p');
          pBEl.innerHTML = `<strong>${currentLang === 'FR' ? 'Pourcentage du constituant B :' : 'Percentage of component B:'}</strong> ${pb.toFixed(2)} %`;
          twoBasesResultDiv.appendChild(pAEl);
          twoBasesResultDiv.appendChild(pBEl);
        }
      })
      .catch(err => {
        twoBasesResultDiv.textContent = err.toString();
      });
  });

  /* --- Solver tab --- */
  const solverTableBody = document.querySelector('#solver-table tbody');
  const addSolverCompBtn = document.getElementById('add-solver-comp-btn');
  const solverForm = document.getElementById('solverForm');
  const solverResultDiv = document.getElementById('solver-result');
  const mixConstraintSelect = document.getElementById('mix-constraint');
  const mixValueRow = document.getElementById('mix-value-row');
  const mixRangeRow = document.getElementById('mix-range-row');
  const solverRowCountKey = 'vb_solver_row_count';
  let lastSolverRequest = null;
  let lastSolverResult = null;

  function addSolverRow(viscosity = '', type = 'free', value = '', min = '', max = '', nameValue = '') {
    const rowIndex = solverTableBody.children.length + 1;
    const tr = document.createElement('tr');
    // index
    const tdIndex = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'solver-name-input';
    const defaultName = `ID ${rowIndex}`;
    nameInput.value = nameValue || defaultName;
    nameInput.placeholder = defaultName;
    nameInput.id = `solver-name-${rowIndex}`;
    tdIndex.appendChild(nameInput);
    tr.appendChild(tdIndex);
    // viscosity
    const tdVisc = document.createElement('td');
    const inputVisc = document.createElement('input');
    inputVisc.type = 'number';
    inputVisc.step = 'any';
    inputVisc.value = viscosity;
    inputVisc.min = '0';
    inputVisc.id = `solver-visc-${rowIndex}`;
    tdVisc.appendChild(inputVisc);
    tr.appendChild(tdVisc);
    // type select
    const tdType = document.createElement('td');
    const selectType = document.createElement('select');
    selectType.id = `solver-type-${rowIndex}`;
    [
      { value: 'free', label: translations['solver_free'][currentLang] || 'Free' },
      { value: 'range', label: translations['solver_range'][currentLang] || 'Range' },
      { value: 'objectiveMin', label: translations['solver_min'][currentLang] || 'Minimise' },
      { value: 'objectiveMax', label: translations['solver_max'][currentLang] || 'Maximise' },
      { value: 'setValue', label: translations['solver_set'][currentLang] || 'Set value' }
    ].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      if (opt.value === type) option.selected = true;
      selectType.appendChild(option);
    });
    tdType.appendChild(selectType);
    tr.appendChild(tdType);
    // value or range cell
    const tdVal = document.createElement('td');
    // value input
    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.step = 'any';
    valueInput.style.display = 'none';
    valueInput.value = value;
    valueInput.id = `solver-value-${rowIndex}`;
    // range min
    const rangeMinInput = document.createElement('input');
    rangeMinInput.type = 'number';
    rangeMinInput.step = 'any';
    rangeMinInput.style.display = 'none';
    rangeMinInput.value = min;
    rangeMinInput.id = `solver-min-${rowIndex}`;
    // range max
    const rangeMaxInput = document.createElement('input');
    rangeMaxInput.type = 'number';
    rangeMaxInput.step = 'any';
    rangeMaxInput.style.display = 'none';
    rangeMaxInput.value = max;
    rangeMaxInput.id = `solver-max-${rowIndex}`;
    // labels for range inputs
    const minLabel = document.createElement('span');
    minLabel.textContent = translations['solver_min_value'][currentLang] || 'Min';
    minLabel.style.display = 'none';
    const maxLabel = document.createElement('span');
    maxLabel.textContent = translations['solver_max_value'][currentLang] || 'Max';
    maxLabel.style.display = 'none';
    tdVal.appendChild(valueInput);
    tdVal.appendChild(minLabel);
    tdVal.appendChild(rangeMinInput);
    tdVal.appendChild(maxLabel);
    tdVal.appendChild(rangeMaxInput);
    tr.appendChild(tdVal);
    // remove
    const tdRemove = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = '×';
    removeBtn.className = 'secondary-btn';
    removeBtn.addEventListener('click', () => {
      [nameInput, inputVisc, selectType, valueInput, rangeMinInput, rangeMaxInput].forEach(el => {
        if (el.id) removeStored('vb_' + el.id);
      });
      solverTableBody.removeChild(tr);
      updateSolverIndices();
    });
    tdRemove.appendChild(removeBtn);
    tr.appendChild(tdRemove);
    solverTableBody.appendChild(tr);
    [nameInput, inputVisc, selectType, valueInput, rangeMinInput, rangeMaxInput].forEach(registerPersistent);
    setStored(solverRowCountKey, solverTableBody.children.length);
    // update visibility according to type
    function updateVisibility() {
      const selVal = selectType.value;
      if (selVal === 'range') {
        valueInput.style.display = 'none';
        minLabel.style.display = 'inline-block';
        rangeMinInput.style.display = 'inline-block';
        maxLabel.style.display = 'inline-block';
        rangeMaxInput.style.display = 'inline-block';
      } else if (selVal === 'setValue') {
        valueInput.style.display = 'inline-block';
        minLabel.style.display = 'none';
        rangeMinInput.style.display = 'none';
        maxLabel.style.display = 'none';
        rangeMaxInput.style.display = 'none';
      } else {
        valueInput.style.display = 'none';
        minLabel.style.display = 'none';
        rangeMinInput.style.display = 'none';
        maxLabel.style.display = 'none';
        rangeMaxInput.style.display = 'none';
      }
    }
    updateVisibility();
    // persistence may restore the select value asynchronously; ensure
    // visibility matches any stored value once registration is complete.
    setTimeout(updateVisibility, 0);
    selectType.addEventListener('change', () => {
      updateVisibility();
    });
  }

  function updateSolverIndices() {
    Array.from(solverTableBody.children).forEach((tr, idx) => {
      const rowIndex = idx + 1;
      const nameInput = tr.children[0].querySelector('input');
      const inputVisc = tr.children[1].querySelector('input');
      const selectType = tr.children[2].querySelector('select');
      const inputs = tr.children[3].querySelectorAll('input');
      const valueInput = inputs[0];
      const rangeMinInput = inputs[1];
      const rangeMaxInput = inputs[2];
      [nameInput, inputVisc, selectType, valueInput, rangeMinInput, rangeMaxInput].forEach(el => {
        if (el && el.id) removeStored('vb_' + el.id);
      });
      if (nameInput) {
        const defaultName = `ID ${rowIndex}`;
        if (!nameInput.value.trim()) {
          nameInput.value = defaultName;
        }
        nameInput.placeholder = defaultName;
        nameInput.id = `solver-name-${rowIndex}`;
      }
      inputVisc.id = `solver-visc-${rowIndex}`;
      selectType.id = `solver-type-${rowIndex}`;
      valueInput.id = `solver-value-${rowIndex}`;
      rangeMinInput.id = `solver-min-${rowIndex}`;
      rangeMaxInput.id = `solver-max-${rowIndex}`;
      [nameInput, inputVisc, selectType, valueInput, rangeMinInput, rangeMaxInput].forEach(el => {
        if (el) registerPersistent(el);
      });
    });
    setStored(solverRowCountKey, solverTableBody.children.length);
  }

  addSolverCompBtn.addEventListener('click', () => {
    addSolverRow();
  });
  const initialSolverRows = parseInt(getStored(solverRowCountKey), 10) || 2;
  for (let i = 0; i < initialSolverRows; i++) addSolverRow();

  // mixture constraint type change
  mixConstraintSelect.addEventListener('change', () => {
    const val = mixConstraintSelect.value;
    if (val === 'setValue') {
      mixValueRow.style.display = 'flex';
      mixRangeRow.style.display = 'none';
    } else if (val === 'range') {
      mixValueRow.style.display = 'none';
      mixRangeRow.style.display = 'flex';
    } else {
      mixValueRow.style.display = 'none';
      mixRangeRow.style.display = 'none';
    }
  });

  solverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comps = [];
    const componentDetails = [];
    Array.from(solverTableBody.children).forEach((tr, idx) => {
      const nameInput = tr.children[0].querySelector('input');
      const rawName = nameInput ? nameInput.value : '';
      const name = rawName && rawName.trim() ? rawName.trim() : `ID ${idx + 1}`;
      const visc = parseFloat(tr.children[1].children[0].value);
      const type = tr.children[2].children[0].value;
      const obj = {};
      obj.viscosity = visc;
      obj.type = type;
      obj.name = name;
      let storedValue = null;
      let storedMin = null;
      let storedMax = null;
      if (type === 'setValue') {
        const val = parseFloat(tr.children[3].children[0].value);
        if (!Number.isNaN(val)) {
          obj.value = val;
          storedValue = val;
        }
      } else if (type === 'range') {
        const minv = parseFloat(tr.children[3].children[2].value);
        const maxv = parseFloat(tr.children[3].children[4].value);
        if (!Number.isNaN(minv)) {
          obj.min = minv;
          storedMin = minv;
        }
        if (!Number.isNaN(maxv)) {
          obj.max = maxv;
          storedMax = maxv;
        }
      }
      comps.push(obj);
      componentDetails.push({
        index: idx,
        name,
        viscosity: visc,
        type,
        value: storedValue,
        min: storedMin,
        max: storedMax
      });
    });
    // mixture constraints
    const mixType = mixConstraintSelect.value;
    const mixObj = { type: mixType };
    const mixDetails = { type: mixType };
    if (mixType === 'setValue') {
      const val = parseFloat(document.getElementById('mix-value').value);
      if (!Number.isNaN(val)) {
        mixObj.value = val;
        mixDetails.value = val;
      } else {
        mixDetails.value = null;
      }
    } else if (mixType === 'range') {
      const minv = parseFloat(document.getElementById('mix-min').value);
      const maxv = parseFloat(document.getElementById('mix-max').value);
      if (!Number.isNaN(minv)) {
        mixObj.min = minv;
        mixDetails.min = minv;
      } else {
        mixDetails.min = null;
      }
      if (!Number.isNaN(maxv)) {
        mixObj.max = maxv;
        mixDetails.max = maxv;
      } else {
        mixDetails.max = null;
      }
    }
    lastSolverRequest = JSON.parse(JSON.stringify({ components: comps, mixture: mixObj }));
    lastSolverResult = null;

    fetch('/api/solver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lastSolverRequest)
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          solverResultDiv.innerHTML = '';
          const errorParagraph = document.createElement('p');
          errorParagraph.className = 'solver-diagnostic solver-diagnostic--error';
          errorParagraph.textContent = body.error || 'Erreur';
          solverResultDiv.appendChild(errorParagraph);
        } else {
          // show result
          solverResultDiv.innerHTML = '';
          lastSolverResult = JSON.parse(JSON.stringify(body));
          const fractions = body.fractions || {};
          const diagnostics = body.diagnostics || {};
          const diagRanges = diagnostics.variableRanges || {};
          const tolerance = typeof diagnostics.tolerancePercent === 'number' ? diagnostics.tolerancePercent : 0;
          const rangeThreshold = Math.max(tolerance * 2, 1e-4);
          const localeNow = currentLang === 'FR' ? 'fr-FR' : 'en-US';
          const text = (fr, en) => (currentLang === 'FR' ? fr : en);
          const formatPercentFixed = (value, digits = 2) => {
            const num = typeof value === 'number' ? value : parseFloat(value);
            if (!Number.isFinite(num)) return '—';
            return `${num.toLocaleString(localeNow, {
              minimumFractionDigits: digits,
              maximumFractionDigits: digits
            })} %`;
          };
          const formatPercentFlexible = (value, maxDigits = 3) => {
            const num = typeof value === 'number' ? value : parseFloat(value);
            if (!Number.isFinite(num)) return '—';
            return `${num.toLocaleString(localeNow, {
              minimumFractionDigits: 0,
              maximumFractionDigits: maxDigits
            })} %`;
          };
          const formatViscosity = (value) => {
            const num = typeof value === 'number' ? value : parseFloat(value);
            if (!Number.isFinite(num)) return '—';
            return `${num.toLocaleString(localeNow, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 3
            })} mm²/s`;
          };

          if (diagnostics.status) {
            const diagKey = diagnostics.status === 'unique' ? 'solver_diag_unique' : 'solver_diag_multiple';
            const diagParagraph = document.createElement('p');
            diagParagraph.className = `solver-diagnostic ${diagnostics.status === 'unique' ? 'solver-diagnostic--unique' : 'solver-diagnostic--multiple'}`;
            diagParagraph.textContent = translations[diagKey] && translations[diagKey][currentLang]
              ? translations[diagKey][currentLang]
              : (diagnostics.status === 'unique' ? 'Unique solution found.' : 'Multiple feasible solutions detected.');
            solverResultDiv.appendChild(diagParagraph);
          }

          const summaryContainer = document.createElement('div');
          summaryContainer.className = 'solver-summary';
          const summaryTitle = document.createElement('h4');
          summaryTitle.textContent = translations['solver_summary_title'][currentLang] || 'Constraints summary';
          summaryContainer.appendChild(summaryTitle);
          const compList = document.createElement('ul');

          componentDetails.forEach(detail => {
            const constraintType = (detail.type === 'objectiveMin' || detail.type === 'objectiveMax') ? 'free' : detail.type;
            let constraintText;
            if (constraintType === 'setValue') {
              const valueText = formatPercentFlexible(detail.value, 3);
              constraintText = text(`Fixé à ${valueText}`, `Fixed at ${valueText}`);
            } else if (constraintType === 'range') {
              const minText = formatPercentFlexible(detail.min, 3);
              const maxText = formatPercentFlexible(detail.max, 3);
              constraintText = text(`Entre ${minText} et ${maxText}`, `Between ${minText} and ${maxText}`);
            } else {
              constraintText = text('Libre (0 à 100 %)', 'Free (0 to 100%)');
            }
            let objectiveText = '';
            if (detail.type === 'objectiveMin') {
              objectiveText = text('Objectif : minimiser la fraction', 'Objective: minimise the fraction');
            } else if (detail.type === 'objectiveMax') {
              objectiveText = text('Objectif : maximiser la fraction', 'Objective: maximise the fraction');
            }
            const infoParts = [
              text(`Viscosité : ${formatViscosity(detail.viscosity)}`, `Viscosity: ${formatViscosity(detail.viscosity)}`),
              constraintText
            ];
            if (objectiveText) infoParts.push(objectiveText);
            const li = document.createElement('li');
            li.innerHTML = `<strong>${detail.name}</strong> — ${infoParts.join(' · ')}`;
            compList.appendChild(li);
          });
          summaryContainer.appendChild(compList);

          const mixLabel = translations['solver_summary_mixture'][currentLang] || 'Mixture';
          let mixText;
          if (mixDetails.type === 'setValue') {
            mixText = text(`Fixé à ${formatViscosity(mixDetails.value)}`, `Fixed at ${formatViscosity(mixDetails.value)}`);
          } else if (mixDetails.type === 'range') {
            const minText = formatViscosity(mixDetails.min);
            const maxText = formatViscosity(mixDetails.max);
            mixText = text(`Entre ${minText} et ${maxText}`, `Between ${minText} and ${maxText}`);
          } else if (mixDetails.type === 'objectiveMin') {
            mixText = text('Objectif : minimiser la viscosité du mélange', 'Objective: minimise the mixture viscosity');
          } else if (mixDetails.type === 'objectiveMax') {
            mixText = text('Objectif : maximiser la viscosité du mélange', 'Objective: maximise the mixture viscosity');
          } else {
            mixText = text('Libre (aucune contrainte sur la viscosité)', 'Free (no viscosity constraint)');
          }
          const mixSummary = document.createElement('p');
          mixSummary.innerHTML = `<strong>${mixLabel} :</strong> ${mixText}`;
          summaryContainer.appendChild(mixSummary);

          solverResultDiv.appendChild(summaryContainer);

          const resultsTitle = document.createElement('h4');
          resultsTitle.textContent = translations['solver_result_title'][currentLang] || 'Results';
          solverResultDiv.appendChild(resultsTitle);

          const resultsList = document.createElement('ul');
          componentDetails.forEach(detail => {
            const key = String(detail.index);
            const fractionVal = fractions[key];
            const fractionText = formatPercentFixed(fractionVal, 2);
            let line = `<strong>${detail.name}</strong> : ${fractionText}`;
            const rangeInfo = diagRanges[key];
            if (rangeInfo) {
              const minVal = typeof rangeInfo.min === 'number' ? rangeInfo.min : parseFloat(rangeInfo.min);
              const maxVal = typeof rangeInfo.max === 'number' ? rangeInfo.max : parseFloat(rangeInfo.max);
              if (Number.isFinite(minVal) && Number.isFinite(maxVal) && (maxVal - minVal) > rangeThreshold) {
                const rangeLabel = translations['solver_possible_range'][currentLang] || 'Feasible range';
                line += ` <span class="solver-range">(${rangeLabel}: ${formatPercentFlexible(minVal, 4)} – ${formatPercentFlexible(maxVal, 4)})</span>`;
              }
            }
            const li = document.createElement('li');
            li.innerHTML = line;
            resultsList.appendChild(li);
          });
          solverResultDiv.appendChild(resultsList);

          const viscEl = document.createElement('p');
          const viscLabel = text('Viscosité cinématique du mélange résultant :', 'Resulting mixture kinematic viscosity:');
          viscEl.innerHTML = `<strong>${viscLabel}</strong> ${formatViscosity(body.viscosity)}`;
          solverResultDiv.appendChild(viscEl);

          const exportBtn = document.createElement('button');
          exportBtn.type = 'button';
          exportBtn.className = 'secondary-btn solver-export-btn';
          exportBtn.textContent = text('Exporter vers Excel', 'Export to Excel');
          exportBtn.addEventListener('click', () => {
            if (!lastSolverRequest || !lastSolverResult) {
              window.alert(text('Veuillez d’abord résoudre le problème pour exporter.', 'Please solve the problem before exporting.'));
              return;
            }
            const defaultName = `viscobat_solver_${new Date().toISOString().slice(0, 10)}`;
            const promptMessage = text('Nom du fichier pour l’export (sans extension) :', 'Enter a file name for the export (without extension):');
            let fileName = window.prompt(promptMessage, defaultName);
            if (fileName === null) {
              return;
            }
            fileName = fileName.trim();
            if (!fileName) {
              fileName = defaultName;
            }
            if (!fileName.toLowerCase().endsWith('.xlsx')) {
              fileName += '.xlsx';
            }
            const payload = JSON.parse(JSON.stringify(lastSolverRequest));
            payload.filename = fileName;
            fetch('/api/solver/export', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
              .then(resp => {
                if (!resp.ok) {
                  return resp.text().then(textResp => {
                    let message = textResp;
                    try {
                      const data = JSON.parse(textResp);
                      message = data.error || message;
                    } catch (err) {
                      /* keep message */
                    }
                    throw new Error(message || 'Export failed');
                  });
                }
                return resp.blob();
              })
              .then(blob => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }, 100);
              })
              .catch(err => {
                window.alert(`${text("Échec de l’export :", 'Export failed:')} ${err.message}`);
              });
          });
          solverResultDiv.appendChild(exportBtn);
        }
      })
      .catch(err => {
        solverResultDiv.textContent = err.toString();
      });
  });

  const motulInfoBtn = document.getElementById('motul-info-btn');
  const motulModal = document.getElementById('motul-modal');
  const motulCloseBtn = motulModal ? motulModal.querySelector('.modal-close') : null;

  const openMotulModal = () => {
    if (!motulModal) return;
    motulModal.classList.add('open');
    motulModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (motulCloseBtn) {
      motulCloseBtn.focus();
    }
  };

  const closeMotulModal = () => {
    if (!motulModal) return;
    motulModal.classList.remove('open');
    motulModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (motulInfoBtn) {
      motulInfoBtn.focus();
    }
  };

  if (motulInfoBtn && motulModal) {
    motulInfoBtn.addEventListener('click', openMotulModal);
  }
  if (motulCloseBtn) {
    motulCloseBtn.addEventListener('click', closeMotulModal);
  }
  if (motulModal) {
    motulModal.addEventListener('click', (event) => {
      if (event.target === motulModal) {
        closeMotulModal();
      }
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && motulModal && motulModal.classList.contains('open')) {
      closeMotulModal();
    }
  });
});
