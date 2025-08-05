from flask import Flask, request, jsonify, render_template
import math
import numpy as np
from scipy.optimize import linprog

"""
Flask backend for the viscosity web application.

This backend exposes several endpoints used by the frontend to perform
engineering calculations related to fluid viscosity.  All heavy numerical
computations live here so the frontend remains lightweight.

Endpoints:

  /            : Serves the main single‑page application.
  /api/viscosity_temperature (POST)
                 Given two reference viscosities and temperatures, returns
                 Walther correlation parameters (slope and intercept), a
                 viscosity at a desired temperature, and a table of
                 viscosity values between ‑20 °C and 100 °C.
  /api/vi (POST)
                 Computes the kinematic viscosity index (VI) using the
                 ASTM D2270 method.  The service first determines the
                 viscosities at 40 °C and 100 °C via the Walther formula
                 and then applies piecewise functions to estimate the VI.
  /api/mixture (POST)
                 Accepts a list of components with their percentages and
                 viscosities.  Returns the mixture viscosity computed via
                 a weighted Walther average.
  /api/mix2 (POST)
                 Calculates the proportions of two base constituents
                 required to reach a target viscosity in a mixture that
                 may already contain other fixed components.  If no
                 physically meaningful solution exists, an explanatory
                 message is returned.
  /api/solver (POST)
                 A generic linear solver for mixture design.  Each
                 component can be fixed, free, or constrained to a range.
                 The overall mixture viscosity may also be constrained
                 or set as the optimisation objective.  Only one
                 optimisation objective (either a component fraction or
                 the mixture viscosity) is permitted per request.

For all computations involving viscosity the Walther transform

    x = log10(log10(v + 0.7))

is used.  The inverse transform is

    v = 10**(10**x) - 0.7.

See the workbook viscobat.xlsx for the origin of these formulas.
"""

app = Flask(__name__, static_folder='static', template_folder='templates')


def walther_params(v1: float, t1: float, v2: float, t2: float):
    """Return slope and intercept of the Walther correlation.

    The Walther correlation relates viscosity and temperature via

        x = intercept - slope * log10(T + 273.15)

    where x = log10(log10(v + 0.7)).  This implementation follows the
    procedure encoded in the Excel workbook (sheet ‘Viscosité‑Température’).

    Args:
        v1: viscosity at temperature t1 (mm²/s)
        t1: temperature 1 (°C)
        v2: viscosity at temperature t2 (mm²/s)
        t2: temperature 2 (°C)

    Returns:
        (slope, intercept)
    """
    # convert inputs to floats
    v1 = float(v1)
    v2 = float(v2)
    t1 = float(t1)
    t2 = float(t2)
    # compute log coordinates
    x1 = math.log10(math.log10(v1 + 0.7))
    x2 = math.log10(math.log10(v2 + 0.7))
    y1 = math.log10(t1 + 273.15)
    y2 = math.log10(t2 + 273.15)
    # avoid division by zero if temperatures coincide
    if abs(y2 - y1) < 1e-12:
        slope = 0.0
    else:
        slope = (x1 - x2) / (y2 - y1)
    intercept = x1 + slope * y1
    return slope, intercept


def walther_viscosity_at_temp(slope: float, intercept: float, temp_c: float):
    """Compute viscosity (mm²/s) at a given temperature using Walther parameters."""
    x = intercept - slope * math.log10(temp_c + 273.15)
    return 10 ** (10 ** x) - 0.7


def compute_vi_from_v40_v100(u: float, y: float) -> float:
    """Compute the viscosity index given viscosities at 40 °C and 100 °C.

    Implements the piecewise formulas found in the Excel workbook (sheet ‘VI’).
    See comments in the workbook for derivation.  Returns a value rounded to
    one decimal place.
    """
    U = float(u)
    Y = float(y)
    # guard against invalid inputs
    if U <= 0 or Y <= 0:
        return float('nan')
    # low viscosity regime
    if Y < 2:
        # low viscosity method (AJ formulas)
        logU = math.log10(math.log10(U + 0.7))
        logY = math.log10(math.log10(Y + 0.7))
        AJ5 = 10 ** (10 ** (logU + ((logU - logY) * 0.04022))) - 0.7
        AJ6 = 10 ** (10 ** (logU + ((logU - logY) * 0.98316))) - 0.7
        numerator = 1.2665 * (AJ6 ** 2) + 1.655 * AJ6 - AJ5
        denominator = 0.34984 * (AJ6 ** 2) + 0.1725 * AJ6
        if denominator == 0:
            return float('nan')
        vi = 100 * numerator / denominator
        return round(vi, 1)
    # piecewise regimes according to Y
    def compute_piece(a_coef, b_coef):
        """Helper to compute VI for a given pair of functions a(Y) and b(Y)."""
        a = a_coef
        b = b_coef
        # eqn for c (AB6 etc)
        c = (100 * (a + b - U)) / b
        # eqn for d (AB7 etc)
        # avoid log of negative numbers
        if a <= 0 or U <= 0 or Y <= 0:
            return float('nan')
        d = (math.log(a) - math.log(U)) / math.log(Y)
        e = ((10 ** d - 1) / 0.00715) + 100
        # if c > 100 use e, else use c
        f = e if c > 100 else c
        return round(f, 1)
    # compute piecewise functions for a(Y), b(Y) depending on Y
    # definitions from workbook
    if Y < 4:
        a = 0.827 * (Y ** 2) + 1.632 * Y - 0.181
        b = 0.3094 * (Y ** 2) + 0.182 * Y
        return compute_piece(a, b)
    elif Y < 6.1:
        a = -2.6758 * (Y ** 2) + 96.671 * Y - 269.664 * (Y ** 0.5) + 215.025
        b = -7.1955 * (Y ** 2) + 241.992 * Y - 725.478 * (Y ** 0.5) + 603.888
        return compute_piece(a, b)
    elif Y < 7.2:
        a = 2.32 * (Y ** 1.5626)
        b = 2.838 * (Y ** 2) - 27.35 * Y + 81.83
        return compute_piece(a, b)
    elif Y < 12.4:
        a = 0.1922 * (Y ** 2) + 8.25 * Y - 18.728
        b = 0.5463 * (Y ** 2) + 2.442 * Y - 14.16
        return compute_piece(a, b)
    elif Y < 70:
        a = 1795.2 * (Y ** -2) + 0.1818 * (Y ** 2) + 10.357 * Y - 54.547
        b = 0.6995 * (Y ** 2) - 1.19 * Y + 7.6
        return compute_piece(a, b)
    else:
        # Y >= 70
        a0 = 0.835313 * (Y ** 2) + 14.6731 * Y - 216.246
        b = 0.666904 * (Y ** 2) + 2.8238 * Y - 119.298
        a = a0 - b
        return compute_piece(a, b)


def compute_mixture(viscosities: list, fractions: list) -> float:
    """Compute the mixture viscosity using the Walther weighted average.

    Args:
        viscosities: list of component viscosities in mm²/s
        fractions: list of component fractions (values between 0 and 1) that
                   sum to 1

    Returns:
        viscosity of the mixture (mm²/s)
    """
    if not viscosities or not fractions or len(viscosities) != len(fractions):
        return float('nan')
    # convert to Walther x values
    x_values = []
    for v in viscosities:
        v = float(v)
        # guard against non‑positive viscosity
        if v <= 0:
            return float('nan')
        x_values.append(math.log10(math.log10(v + 0.7)))
    # compute weighted average of x values
    x_mix = 0.0
    for w, x in zip(fractions, x_values):
        x_mix += w * x
    # invert Walther transform
    return 10 ** (10 ** x_mix) - 0.7


@app.route('/')
def serve_index():
    """Serve the single page application."""
    return render_template('index.html')


@app.route('/api/viscosity_temperature', methods=['POST'])
def api_viscosity_temperature():
    data = request.get_json(force=True)
    try:
        v1 = float(data.get('v1', 0))
        t1 = float(data.get('t1', 0))
        v2 = float(data.get('v2', 0))
        t2 = float(data.get('t2', 0))
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid input'}), 400
    # compute Walther parameters
    slope, intercept = walther_params(v1, t1, v2, t2)
    # compute table from -20 to 100 °C inclusive every 10 °C
    temps = list(range(-20, 101, 10))
    table = []
    for T in temps:
        visc = walther_viscosity_at_temp(slope, intercept, T)
        table.append({'temperature': T, 'viscosity': visc})
    # compute optional target viscosity
    result = {
        'slope': slope,
        'intercept': intercept,
        'table': table
    }
    if 'target' in data:
        try:
            target_temp = float(data['target'])
            visc_target = walther_viscosity_at_temp(slope, intercept, target_temp)
            result['targetViscosity'] = visc_target
        except (TypeError, ValueError):
            pass
    return jsonify(result)


@app.route('/api/vi', methods=['POST'])
def api_vi():
    data = request.get_json(force=True)
    try:
        v1 = float(data.get('v1', 0))
        t1 = float(data.get('t1', 0))
        v2 = float(data.get('v2', 0))
        t2 = float(data.get('t2', 0))
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid input'}), 400
    # compute Walther parameters and viscosities at 40 and 100 °C
    slope, intercept = walther_params(v1, t1, v2, t2)
    v40 = walther_viscosity_at_temp(slope, intercept, 40)
    v100 = walther_viscosity_at_temp(slope, intercept, 100)
    vi = compute_vi_from_v40_v100(v40, v100)
    return jsonify({'v40': v40, 'v100': v100, 'vi': vi})


@app.route('/api/mixture', methods=['POST'])
def api_mixture():
    data = request.get_json(force=True)
    comps = data.get('components')
    if not isinstance(comps, list) or not comps:
        return jsonify({'error': 'No components provided'}), 400
    viscosities = []
    percents = []
    total = 0.0
    for comp in comps:
        try:
            p = float(comp.get('percent', 0))
            v = float(comp.get('viscosity', 0))
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid component data'}), 400
        if p < 0:
            return jsonify({'error': 'Percentages must be non‑negative'}), 400
        viscosities.append(v)
        percents.append(p)
        total += p
    if abs(total - 100.0) > 1e-6:
        return jsonify({'error': 'Sum of percentages must equal 100'}), 400
    # convert percentages to fractions
    fractions = [p / 100.0 for p in percents]
    mixture_visc = compute_mixture(viscosities, fractions)
    return jsonify({'viscosity': mixture_visc})


@app.route('/api/mix2', methods=['POST'])
def api_mix2():
    data = request.get_json(force=True)
    try:
        target = float(data.get('targetViscosity', 0))
        baseA = float(data.get('baseAViscosity', 0))
        baseB = float(data.get('baseBViscosity', 0))
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid input'}), 400
    # known components may exist
    known_comps = data.get('knownComponents', [])
    viscosities = []
    percents = []
    sum_known = 0.0
    x_known_sum = 0.0
    for comp in known_comps:
        try:
            p = float(comp.get('percent', 0))
            v = float(comp.get('viscosity', 0))
        except (TypeError, ValueError):
            return jsonify({'error': 'Invalid component data'}), 400
        if p < 0:
            return jsonify({'error': 'Percentages must be non‑negative'}), 400
        sum_known += p / 100.0
        # compute x contributions for known components
        if v <= 0:
            return jsonify({'error': 'Viscosities must be positive'}), 400
        x_known_sum += (p / 100.0) * math.log10(math.log10(v + 0.7))
    if sum_known >= 1:
        return jsonify({'error': 'Sum of known percentages must be less than 100'}), 400
    # convert target and bases to x domain
    if target <= 0 or baseA <= 0 or baseB <= 0:
        return jsonify({'error': 'Viscosities must be positive'}), 400
    x_target = math.log10(math.log10(target + 0.7))
    x_A = math.log10(math.log10(baseA + 0.7))
    x_B = math.log10(math.log10(baseB + 0.7))
    p_remaining = 1.0 - sum_known
    # compute p_A fraction
    denominator = (x_A - x_B)
    if abs(denominator) < 1e-12:
        return jsonify({'error': 'Base viscosities must be different'}), 400
    # solve p_A * x_A + p_B * x_B + x_known_sum = x_target
    # with p_B = p_remaining - p_A
    p_A = (x_target - x_known_sum - p_remaining * x_B) / denominator
    # p_B computed
    p_B = p_remaining - p_A
    # convert to percent
    p_A_percent = p_A * 100.0
    p_B_percent = p_B * 100.0
    # check for feasibility
    if p_A < -1e-6 or p_B < -1e-6:
        return jsonify({'error': 'Impossible to obtain this viscosity with these two bases'}), 400
    # adjust to zero if very small negative due to numerical error
    if p_A < 0: p_A = 0.0
    if p_B < 0: p_B = 0.0
    # verify that p_A + p_B <= p_remaining
    if p_A + p_B > p_remaining + 1e-6:
        return jsonify({'error': 'Impossible to obtain this viscosity with these two bases'}), 400
    return jsonify({'percentA': p_A_percent, 'percentB': p_B_percent})


def solve_general_mixture(data):
    """Solve a general mixture design problem using linear programming.

    The input `data` dictionary is expected to contain:
        'components': a list of component dicts with keys:
            - 'viscosity': numeric
            - 'type': one of 'fixed', 'free', 'range', 'objectiveMin',
                        'objectiveMax', 'setValue'
            - 'value': numeric (only for fixed or setValue)
            - 'min': numeric (for range)
            - 'max': numeric (for range)
        'mixture': a dict describing the mixture constraint:
            - 'type': one of 'free', 'range', 'objectiveMin', 'objectiveMax',
                      'setValue'
            - 'value': numeric (for setValue)
            - 'min': numeric (for range)
            - 'max': numeric (for range)
        Only one optimisation objective across components and mixture is
        permitted.  The function returns either a solution (list of
        percentages and mixture viscosity) or an error message.
    """
    comps = data.get('components', [])
    mix_info = data.get('mixture', {})
    n = len(comps)
    if n == 0:
        return {'error': 'No components supplied'}
    # Determine objective
    objective_type = None  # 'mixture' or 'component'
    objective_index = None
    objective_direction = None  # 'min' or 'max'
    # parse components for objective flags and bounds
    fixed_fractions = []
    fixed_x_contrib = 0.0
    fixed_sum = 0.0
    var_bounds = []  # for variables (non‑fixed)
    x_values = []  # x values for variables (non‑fixed)
    var_indices = []  # original index of each variable in comps
    for idx, comp in enumerate(comps):
        ctype = comp.get('type', 'free')
        visc = comp.get('viscosity')
        if visc is None or visc <= 0:
            return {'error': f'Component {idx+1} viscosity must be positive'}
        # convert viscosity to x domain
        x_i = math.log10(math.log10(float(visc) + 0.7))
        if ctype == 'fixed' or ctype == 'setValue':
            # fraction is fixed
            val = comp.get('value')
            if val is None:
                return {'error': f'Component {idx+1} fixed value missing'}
            try:
                p = float(val) / 100.0
            except (TypeError, ValueError):
                return {'error': f'Component {idx+1} fixed value invalid'}
            if p < 0 or p > 1:
                return {'error': f'Component {idx+1} fixed value must be between 0 and 100'}
            fixed_sum += p
            fixed_x_contrib += p * x_i
            fixed_fractions.append((idx, p))
        else:
            # variable component
            lb = 0.0
            ub = 1.0
            if ctype == 'range':
                # range specified
                minv = comp.get('min')
                maxv = comp.get('max')
                if minv is None or maxv is None:
                    return {'error': f'Component {idx+1} range requires min and max'}
                try:
                    lb = float(minv) / 100.0
                    ub = float(maxv) / 100.0
                except (TypeError, ValueError):
                    return {'error': f'Component {idx+1} range values invalid'}
                if lb < 0 or ub > 1 or lb > ub:
                    return {'error': f'Component {idx+1} range is invalid'}
            # store variable
            var_indices.append(idx)
            x_values.append(x_i)
            var_bounds.append((lb, ub))
            # check objective flags
            if ctype == 'objectiveMin':
                if objective_type is not None:
                    return {'error': 'Multiple objectives not allowed'}
                objective_type = 'component'
                objective_index = len(var_indices) - 1
                objective_direction = 'min'
            elif ctype == 'objectiveMax':
                if objective_type is not None:
                    return {'error': 'Multiple objectives not allowed'}
                objective_type = 'component'
                objective_index = len(var_indices) - 1
                objective_direction = 'max'
    # after processing components, handle mixture objective
    mtype = mix_info.get('type', 'free')
    if mtype == 'objectiveMin' or mtype == 'objectiveMax':
        if objective_type is not None:
            return {'error': 'Multiple objectives not allowed'}
        objective_type = 'mixture'
        objective_direction = 'min' if mtype == 'objectiveMin' else 'max'
    # mixture constraints
    mix_set_val = None
    mix_range_min = None
    mix_range_max = None
    if mtype == 'setValue':
        val = mix_info.get('value')
        if val is None:
            return {'error': 'Mixture set value missing'}
        try:
            mix_set_val = float(val)
        except (TypeError, ValueError):
            return {'error': 'Mixture set value invalid'}
        if mix_set_val <= 0:
            return {'error': 'Mixture viscosity must be positive'}
    elif mtype == 'range':
        minv = mix_info.get('min')
        maxv = mix_info.get('max')
        if minv is None or maxv is None:
            return {'error': 'Mixture range requires min and max'}
        try:
            mix_range_min = float(minv)
            mix_range_max = float(maxv)
        except (TypeError, ValueError):
            return {'error': 'Mixture range values invalid'}
        if mix_range_min <= 0 or mix_range_max <= 0 or mix_range_min > mix_range_max:
            return {'error': 'Mixture range is invalid'}
    # ensure fixed_sum <= 1
    if fixed_sum > 1 + 1e-9:
        return {'error': 'Sum of fixed component fractions exceeds 100%'}
    # handle the case where there are no variable components
    if len(var_indices) == 0:
        # all components are fixed; verify mixture constraints if any
        total = fixed_sum
        if abs(total - 1.0) > 1e-6:
            return {'error': 'Sum of fixed components must be exactly 100%'}
        # compute mixture viscosity
        x_total = fixed_x_contrib
        v_mix = 10 ** (10 ** x_total) - 0.7
        # check mixture constraints
        if mix_set_val is not None and abs(v_mix - mix_set_val) > 1e-6:
            return {'error': 'Mixture viscosity does not match target value'}
        if mix_range_min is not None and (v_mix < mix_range_min - 1e-6 or v_mix > mix_range_max + 1e-6):
            return {'error': 'Mixture viscosity not within specified range'}
        return {'fractions': {idx: frac * 100.0 for idx, frac in fixed_fractions}, 'viscosity': v_mix}
    # build linear programming problem
    m = len(var_indices)
    # Equality: sum p_i = 1 - fixed_sum
    A_eq = np.ones((1, m))
    b_eq = np.array([1.0 - fixed_sum])
    # Mixture equality if setValue specified
    A_ub = []
    b_ub = []
    A_eq2 = []
    b_eq2 = []
    if mix_set_val is not None:
        # equality constraint: sum p_i * x_i = x_target - fixed_x_contrib
        x_target = math.log10(math.log10(mix_set_val + 0.7))
        row = np.array(x_values)
        A_eq2.append(row)
        b_eq2.append(x_target - fixed_x_contrib)
    else:
        # range constraints if any
        if mix_range_min is not None:
            x_min = math.log10(math.log10(mix_range_min + 0.7))
            # x_total >= x_min => -(x_total) <= -(x_min)
            row = -np.array(x_values)
            A_ub.append(row)
            b_ub.append(-(x_min - fixed_x_contrib))
        if mix_range_max is not None:
            x_max = math.log10(math.log10(mix_range_max + 0.7))
            row = np.array(x_values)
            A_ub.append(row)
            b_ub.append(x_max - fixed_x_contrib)
    # combine equality matrices
    if A_eq2:
        A_eq = np.vstack([A_eq, A_eq2])
        b_eq = np.concatenate([b_eq, b_eq2])
    # objective vector
    c = np.zeros(m)
    if objective_type == 'mixture':
        # objective to minimise or maximise mixture viscosity (i.e., x_total)
        # minimise mixture viscosity -> minimise x_total -> objective = x_values
        # maximise mixture viscosity -> maximise x_total -> minimise -x_total
        if objective_direction == 'min':
            c = np.array(x_values)
        else:
            c = -np.array(x_values)
    elif objective_type == 'component':
        # objective to minimise or maximise a specific component fraction
        idx = objective_index
        c = np.zeros(m)
        if objective_direction == 'min':
            c[idx] = 1.0
        else:
            c[idx] = -1.0
    else:
        # no objective; just find any feasible solution; objective is zero
        c = np.zeros(m)
    # convert A_ub and b_ub lists to arrays if not empty
    if A_ub:
        A_ub = np.array(A_ub)
        b_ub = np.array(b_ub)
    else:
        A_ub = None
        b_ub = None
    # solve linear program
    res = linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=var_bounds, method='highs')
    if not res.success:
        return {'error': 'No feasible solution found'}
    # assemble fractions back into original order
    fractions = [0.0 for _ in range(n)]
    for (fixed_idx, frac) in fixed_fractions:
        fractions[fixed_idx] = frac
    for j, orig_idx in enumerate(var_indices):
        fractions[orig_idx] = res.x[j]
    # verify non‑negativity and sum
    if any(f < -1e-6 for f in fractions):
        return {'error': 'Solution contains negative fractions'}
    total_sum = sum(fractions)
    if abs(total_sum - 1.0) > 1e-6:
        # due to numerical error, normalise
        fractions = [f / total_sum for f in fractions]
    # compute mixture viscosity
    x_total = fixed_x_contrib + sum(res.x[j] * x_values[j] for j in range(m))
    viscosity = 10 ** (10 ** x_total) - 0.7
    # return fractions in percent along with viscosity
    return {
        'fractions': {i: round(f * 100.0, 6) for i, f in enumerate(fractions)},
        'viscosity': viscosity
    }


@app.route('/api/solver', methods=['POST'])
def api_solver():
    data = request.get_json(force=True)
    try:
        result = solve_general_mixture(data)
    except Exception as e:
        # capture unexpected errors for debugging
        return jsonify({'error': str(e)}), 400
    if 'error' in result:
        return jsonify({'error': result['error']}), 400
    return jsonify(result)


if __name__ == '__main__':
    # When run directly, start the Flask development server.
    # Note: In production the app would typically be served via
    # Gunicorn or another WSGI server.  For this exercise,
    # debug=False to avoid exposing internal state.
    app.run(host='0.0.0.0', port=5000, debug=False)