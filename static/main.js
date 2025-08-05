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
    app_title: { FR: 'Application de viscosité', EN: 'Viscosity Application' },
    app_name: { FR: 'Application de viscosité', EN: 'Viscosity Application' },
    tab_vi: { FR: 'Indice de viscosité', EN: 'Viscosity Index' },
    tab_temp: { FR: 'Viscosité vs Température', EN: 'Viscosity vs Temperature' },
    tab_mixture: { FR: 'Mélange', EN: 'Mixture' },
    tab_two_bases: { FR: 'Mélange 2 bases', EN: '2‑Base Mixer' },
    tab_solver: { FR: 'Solveur', EN: 'Solver' },
    vi_heading: { FR: 'Indice de viscosité', EN: 'Viscosity Index' },
    temp_heading: { FR: 'Viscosité en fonction de la température', EN: 'Viscosity vs Temperature' },
    mixture_heading: { FR: 'Mélange de plusieurs constituants', EN: 'Mixture of several components' },
    two_bases_heading: { FR: 'Mélange avec deux bases', EN: 'Mixture with two bases' },
    solver_heading: { FR: 'Solveur de formulation', EN: 'Formulation solver' },
    label_v1: { FR: 'Viscosité 1 (mm²/s)', EN: 'Viscosity 1 (mm²/s)' },
    label_v2: { FR: 'Viscosité 2 (mm²/s)', EN: 'Viscosity 2 (mm²/s)' },
    label_t1: { FR: 'Température 1 (°C)', EN: 'Temperature 1 (°C)' },
    label_t2: { FR: 'Température 2 (°C)', EN: 'Temperature 2 (°C)' },
    label_target_temp: { FR: 'Température voulue (°C)', EN: 'Target temperature (°C)' },
    btn_calculate: { FR: 'Calculer', EN: 'Calculate' },
    btn_solve: { FR: 'Résoudre', EN: 'Solve' },
    btn_add_component: { FR: 'Ajouter un constituant', EN: 'Add component' },
    btn_add_known: { FR: 'Ajouter un constituant connu', EN: 'Add known component' },
    table_temp: { FR: 'Température (°C)', EN: 'Temperature (°C)' },
    table_visc: { FR: 'Viscosité (mm²/s)', EN: 'Viscosity (mm²/s)' },
    table_percent: { FR: '% masse', EN: '% mass' },
    label_target_mix: { FR: 'Viscosité du mélange cible (mm²/s)', EN: 'Target mixture viscosity (mm²/s)' },
    label_baseA: { FR: 'Viscosité du constituant A (mm²/s)', EN: 'Viscosity of component A (mm²/s)' },
    label_baseB: { FR: 'Viscosité du constituant B (mm²/s)', EN: 'Viscosity of component B (mm²/s)' },
    solver_type: { FR: 'Contrainte', EN: 'Constraint' },
    solver_value: { FR: 'Valeur/Intervalle', EN: 'Value/Range' },
    solver_mix: { FR: 'Contrainte sur la viscosité du mélange', EN: 'Mixture viscosity constraint' },
    solver_mix_type: { FR: 'Type', EN: 'Type' },
    solver_free: { FR: 'Libre', EN: 'Free' },
    solver_range: { FR: 'Intervalle', EN: 'Range' },
    solver_min: { FR: 'Minimiser', EN: 'Minimise' },
    solver_max: { FR: 'Maximiser', EN: 'Maximise' },
    solver_set: { FR: 'Fixer une valeur', EN: 'Set value' },
    solver_min_value: { FR: 'Min', EN: 'Min' },
    solver_max_value: { FR: 'Max', EN: 'Max' },
    btn_solve: { FR: 'Résoudre', EN: 'Solve' },
    solver_free: { FR: 'Libre', EN: 'Free' },
    solver_range: { FR: 'Intervalle', EN: 'Range' },
    solver_min: { FR: 'Minimiser', EN: 'Minimise' },
    solver_max: { FR: 'Maximiser', EN: 'Maximise' },
    solver_set: { FR: 'Fixer une valeur', EN: 'Set value' }
  };

  let currentLang = 'FR';
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
        el.textContent = trans[currentLang];
      }
    });
  }

  /* --- Form field persistence --- */
  const viFieldIds = ['vi-v1', 'vi-t1', 'vi-v2', 'vi-t2'];
  const tempFieldIds = ['temp-v1', 'temp-t1', 'temp-v2', 'temp-t2', 'temp-target'];

  function fieldKey(id) {
    return `${currentLang}:${id}`;
  }

  function loadStoredValues() {
    [...viFieldIds, ...tempFieldIds].forEach(id => {
      const stored = localStorage.getItem(fieldKey(id));
      if (stored !== null) {
        const el = document.getElementById(id);
        if (el) {
          el.value = stored;
        }
      }
    });
  }

  function attachStorageListeners() {
    [...viFieldIds, ...tempFieldIds].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          localStorage.setItem(fieldKey(id), el.value);
        });
      }
    });
  }

  languageSelect.addEventListener('change', () => {
    currentLang = languageSelect.value;
    translatePage();
    loadStoredValues();
  });

  translatePage();
  loadStoredValues();
  attachStorageListeners();

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
        drawChart(currentChartData);
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
          p1.innerHTML = `<strong>${translations['vi_result_v40'] ? translations['vi_result_v40'][currentLang] : 'V40'} </strong> ${v40.toFixed(3)}`;
          const p2 = document.createElement('p');
          p2.innerHTML = `<strong>${translations['vi_result_v100'] ? translations['vi_result_v100'][currentLang] : 'V100'} </strong> ${v100.toFixed(3)}`;
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
  translations['vi_result_v40'] = { FR: 'Viscosité à 40 °C :', EN: 'Viscosity at 40°C:' };
  translations['vi_result_v100'] = { FR: 'Viscosité à 100 °C :', EN: 'Viscosity at 100°C:' };
  translations['vi_result_vi'] = { FR: 'Indice de viscosité :', EN: 'Viscosity index:' };

  /* --- Temperature vs Viscosity form --- */
  const tempForm = document.getElementById('tempForm');
  const tempTableBody = document.querySelector('#temp-table tbody');
  const tempResult = document.getElementById('temp-target-result');
  const tempCanvas = document.getElementById('temp-chart');
  const ctx = tempCanvas.getContext('2d');
  let currentChartData = [];

  tempForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const v1 = parseFloat(document.getElementById('temp-v1').value);
    const t1 = parseFloat(document.getElementById('temp-t1').value);
    const v2 = parseFloat(document.getElementById('temp-v2').value);
    const t2 = parseFloat(document.getElementById('temp-t2').value);
    const target = parseFloat(document.getElementById('temp-target').value);
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
          // update target result
          if (body.targetViscosity !== undefined) {
            tempResult.innerHTML = `<strong>${translations['temp_result_at'] ? translations['temp_result_at'][currentLang] : 'Viscosity at target:'}</strong> ${body.targetViscosity.toFixed(3)}`;
          }
          // update table
          tempTableBody.innerHTML = '';
          currentChartData = [];
          body.table.forEach(row => {
            const tr = document.createElement('tr');
            const tdT = document.createElement('td');
            tdT.textContent = row.temperature;
            const tdV = document.createElement('td');
            tdV.textContent = row.viscosity.toFixed(3);
            tr.appendChild(tdT);
            tr.appendChild(tdV);
            tempTableBody.appendChild(tr);
            currentChartData.push({ x: row.temperature, y: row.viscosity });
          });
          drawChart(currentChartData);
        }
      })
      .catch(err => {
        tempResult.textContent = err.toString();
      });
  });

  translations['temp_result_at'] = { FR: 'Viscosité à la température voulue :', EN: 'Viscosity at target temperature:' };

  /**
   * Draw a simple line chart on the canvas using the provided data.
   * data: array of objects {x: temperature, y: viscosity}
   */
  function drawChart(data) {
    // if the temp tab is not visible, skip drawing to avoid wasted work
    const canvasStyle = window.getComputedStyle(tempCanvas);
    const isHidden = canvasStyle.display === 'none' || !document.getElementById('tab-temp').classList.contains('active');
    if (isHidden) return;
    // clear canvas
    const width = tempCanvas.width;
    const height = tempCanvas.height;
    ctx.clearRect(0, 0, width, height);
    if (!data || data.length === 0) return;
    // determine ranges
    let xMin = data[0].x;
    let xMax = data[0].x;
    let yMin = data[0].y;
    let yMax = data[0].y;
    data.forEach(pt => {
      if (pt.x < xMin) xMin = pt.x;
      if (pt.x > xMax) xMax = pt.x;
      if (pt.y < yMin) yMin = pt.y;
      if (pt.y > yMax) yMax = pt.y;
    });
    // add margins
    const yRange = yMax - yMin;
    const xRange = xMax - xMin;
    if (yRange === 0) {
      yMin -= 1;
      yMax += 1;
    } else {
      yMin -= yRange * 0.1;
      yMax += yRange * 0.1;
    }
    if (xRange === 0) {
      xMin -= 1;
      xMax += 1;
    } else {
      xMin -= xRange * 0.05;
      xMax += xRange * 0.05;
    }
    const marginLeft = 50;
    const marginBottom = 40;
    const marginTop = 20;
    const marginRight = 20;
    const plotWidth = width - marginLeft - marginRight;
    const plotHeight = height - marginTop - marginBottom;
    // helpers to transform data to canvas coords
    function xToCanvas(x) {
      return marginLeft + ((x - xMin) / (xMax - xMin)) * plotWidth;
    }
    function yToCanvas(y) {
      return marginTop + plotHeight - ((y - yMin) / (yMax - yMin)) * plotHeight;
    }
    // draw axes
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    // x axis
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop + plotHeight);
    ctx.lineTo(marginLeft + plotWidth, marginTop + plotHeight);
    ctx.stroke();
    // y axis
    ctx.beginPath();
    ctx.moveTo(marginLeft, marginTop);
    ctx.lineTo(marginLeft, marginTop + plotHeight);
    ctx.stroke();
    // draw ticks and labels
    ctx.font = '12px Arial';
    ctx.fillStyle = '#444';
    // x ticks (use actual temperature values)
    data.forEach(pt => {
      const xC = xToCanvas(pt.x);
      ctx.beginPath();
      ctx.moveTo(xC, marginTop + plotHeight);
      ctx.lineTo(xC, marginTop + plotHeight + 5);
      ctx.stroke();
      ctx.fillText(String(pt.x), xC - 10, marginTop + plotHeight + 18);
    });
    // y ticks using nice numbers
    const yTicks = getNiceTicks(yMin, yMax, 5);
    yTicks.forEach(tick => {
      const yC = yToCanvas(tick);
      ctx.beginPath();
      ctx.moveTo(marginLeft - 5, yC);
      ctx.lineTo(marginLeft, yC);
      ctx.stroke();
      ctx.fillText(tick.toFixed(1), marginLeft - 45, yC + 4);
      // horizontal grid line
      ctx.strokeStyle = '#e0e0e0';
      ctx.beginPath();
      ctx.moveTo(marginLeft, yC);
      ctx.lineTo(marginLeft + plotWidth, yC);
      ctx.stroke();
      ctx.strokeStyle = '#444';
    });
    // draw the line
    ctx.strokeStyle = '#c62828';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((pt, idx) => {
      const xC = xToCanvas(pt.x);
      const yC = yToCanvas(pt.y);
      if (idx === 0) {
        ctx.moveTo(xC, yC);
      } else {
        ctx.lineTo(xC, yC);
      }
    });
    ctx.stroke();
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
    tdPercent.appendChild(inputPercent);
    tr.appendChild(tdPercent);
    // viscosity cell
    const tdVisc = document.createElement('td');
    const inputVisc = document.createElement('input');
    inputVisc.type = 'number';
    inputVisc.step = 'any';
    inputVisc.value = viscosity;
    inputVisc.min = '0';
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
  }

  function updateMixtureIndices() {
    Array.from(mixtureTableBody.children).forEach((tr, idx) => {
      tr.children[0].textContent = idx + 1;
    });
  }

  addComponentBtn.addEventListener('click', () => {
    addMixtureRow();
  });
  // initialise with two rows
  addMixtureRow();
  addMixtureRow();

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
          mixtureResultDiv.innerHTML = `<strong>${currentLang === 'FR' ? 'Viscosité du mélange :' : 'Mixture viscosity:'}</strong> ${body.viscosity.toFixed(3)}`;
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
    tdPercent.appendChild(inputPercent);
    tr.appendChild(tdPercent);
    const tdVisc = document.createElement('td');
    const inputVisc = document.createElement('input');
    inputVisc.type = 'number';
    inputVisc.step = 'any';
    inputVisc.value = viscosity;
    inputVisc.min = '0';
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
  }

  function updateKnownIndices() {
    Array.from(knownTableBody.children).forEach((tr, idx) => {
      tr.children[0].textContent = idx + 1;
    });
  }

  addKnownBtn.addEventListener('click', () => {
    addKnownRow();
  });
  // start with no known components

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

  function addSolverRow(viscosity = '', type = 'free', value = '', min = '', max = '') {
    const rowIndex = solverTableBody.children.length + 1;
    const tr = document.createElement('tr');
    // index
    const tdIndex = document.createElement('td');
    tdIndex.textContent = rowIndex;
    tr.appendChild(tdIndex);
    // viscosity
    const tdVisc = document.createElement('td');
    const inputVisc = document.createElement('input');
    inputVisc.type = 'number';
    inputVisc.step = 'any';
    inputVisc.value = viscosity;
    inputVisc.min = '0';
    tdVisc.appendChild(inputVisc);
    tr.appendChild(tdVisc);
    // type select
    const tdType = document.createElement('td');
    const selectType = document.createElement('select');
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
    // range min
    const rangeMinInput = document.createElement('input');
    rangeMinInput.type = 'number';
    rangeMinInput.step = 'any';
    rangeMinInput.style.display = 'none';
    rangeMinInput.value = min;
    // range max
    const rangeMaxInput = document.createElement('input');
    rangeMaxInput.type = 'number';
    rangeMaxInput.step = 'any';
    rangeMaxInput.style.display = 'none';
    rangeMaxInput.value = max;
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
      solverTableBody.removeChild(tr);
      updateSolverIndices();
    });
    tdRemove.appendChild(removeBtn);
    tr.appendChild(tdRemove);
    solverTableBody.appendChild(tr);
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
    selectType.addEventListener('change', () => {
      updateVisibility();
    });
  }

  function updateSolverIndices() {
    Array.from(solverTableBody.children).forEach((tr, idx) => {
      tr.children[0].textContent = idx + 1;
    });
  }

  addSolverCompBtn.addEventListener('click', () => {
    addSolverRow();
  });
  // start with two solver rows by default
  addSolverRow();
  addSolverRow();

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
    let hasObjective = false;
    Array.from(solverTableBody.children).forEach(tr => {
      const visc = parseFloat(tr.children[1].children[0].value);
      const type = tr.children[2].children[0].value;
      const obj = {};
      obj.viscosity = visc;
      obj.type = type;
      if (type === 'setValue') {
        const val = parseFloat(tr.children[3].children[0].value);
        obj.value = val;
      } else if (type === 'range') {
        const minv = parseFloat(tr.children[3].children[2].value);
        const maxv = parseFloat(tr.children[3].children[4].value);
        obj.min = minv;
        obj.max = maxv;
      }
      comps.push(obj);
    });
    // mixture constraints
    const mixType = mixConstraintSelect.value;
    const mixObj = { type: mixType };
    if (mixType === 'setValue') {
      mixObj.value = parseFloat(document.getElementById('mix-value').value);
    } else if (mixType === 'range') {
      mixObj.min = parseFloat(document.getElementById('mix-min').value);
      mixObj.max = parseFloat(document.getElementById('mix-max').value);
    }
    fetch('/api/solver', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ components: comps, mixture: mixObj })
    })
      .then(resp => resp.json().then(data => ({ status: resp.status, body: data })))
      .then(({ status, body }) => {
        if (status !== 200) {
          solverResultDiv.textContent = body.error || 'Erreur';
        } else {
          // show result
          solverResultDiv.innerHTML = '';
          // list fractions
          const fractions = body.fractions;
          Object.keys(fractions).forEach(idx => {
            const p = fractions[idx];
            const pEl = document.createElement('p');
            const label = currentLang === 'FR' ? `Pourcentage du constituant ${parseInt(idx) + 1} :` : `Percentage of component ${parseInt(idx) + 1}:`;
            pEl.innerHTML = `<strong>${label}</strong> ${p.toFixed(2)} %`;
            solverResultDiv.appendChild(pEl);
          });
          const viscEl = document.createElement('p');
          viscEl.innerHTML = `<strong>${currentLang === 'FR' ? 'Viscosité du mélange résultante :' : 'Resulting mixture viscosity:'}</strong> ${body.viscosity.toFixed(3)}`;
          solverResultDiv.appendChild(viscEl);
        }
      })
      .catch(err => {
        solverResultDiv.textContent = err.toString();
      });
  });
});