import numpy as np
from scipy import signal
from scipy.signal import freqz
import warnings

class FilterDesigner:
    """DSP Engine for FIR and IIR filter design"""
    
    def __init__(self):
        self.valid_fir_methods = ['window', 'remez']
        self.valid_iir_methods = ['butterworth', 'chebyshev1', 'chebyshev2', 'elliptic']
        self.valid_windows = ['hamming', 'hanning', 'blackman', 'kaiser', 'rectangular']
    
    def validate_inputs(self, params):
        """Validate filter design parameters"""
        errors = []
        fs = params.get('sampling_freq', 0)
        nyquist = fs / 2
        
        if fs <= 0:
            errors.append("Sampling frequency must be positive")
        
        # Validate frequencies
        freqs = []
        if 'passband_freq' in params:
            freqs.extend(params['passband_freq'] if isinstance(params['passband_freq'], list) else [params['passband_freq']])
        if 'stopband_freq' in params:
            freqs.extend(params['stopband_freq'] if isinstance(params['stopband_freq'], list) else [params['stopband_freq']])
        
        for f in freqs:
            if f <= 0 or f >= nyquist:
                errors.append(f"Frequency {f} must be between 0 and {nyquist} Hz")
        
        return errors
    
    def design_fir(self, params):
        """Design FIR filter"""
        method = params.get('method', 'window')
        fs = params['sampling_freq']
        filter_type = params['filter_type']
        numtaps = params.get('order', 51)
        
        if method == 'window':
            return self._design_fir_window(params)
        elif method == 'remez':
            return self._design_fir_remez(params)
        else:
            raise ValueError(f"Unknown FIR method: {method}")
    
    def _design_fir_window(self, params):
        """FIR design using window method"""
        fs = params['sampling_freq']
        filter_type = params['filter_type']
        numtaps = params.get('order', 51)
        window = params.get('window', 'hamming')
        
        # Normalize frequencies
        if filter_type == 'lowpass':
            cutoff = params['passband_freq'] / (fs / 2)
            b = signal.firwin(numtaps, cutoff, window=window)
        elif filter_type == 'highpass':
            cutoff = params['passband_freq'] / (fs / 2)
            b = signal.firwin(numtaps, cutoff, window=window, pass_zero=False)
        elif filter_type == 'bandpass':
            cutoff = [f / (fs / 2) for f in params['passband_freq']]
            b = signal.firwin(numtaps, cutoff, window=window, pass_zero=False)
        elif filter_type == 'bandstop':
            cutoff = [f / (fs / 2) for f in params['passband_freq']]
            b = signal.firwin(numtaps, cutoff, window=window)
        else:
            raise ValueError(f"Unknown filter type: {filter_type}")
        
        # FIR filters have a=[1]
        a = np.array([1.0])
        
        return self._compute_responses(b, a, fs)
    
    def _design_fir_remez(self, params):
        """FIR design using Parks-McClellan (Remez) algorithm"""
        fs = params['sampling_freq']
        numtaps = params.get('order', 51)
        
        # Define frequency bands and desired gains
        bands = params.get('bands', [0, 0.1, 0.2, 0.5])  # Normalized [0, 0.5]
        desired = params.get('desired', [1, 0])  # Passband=1, Stopband=0
        
        # Convert to actual frequencies (0 to fs/2)
        bands_hz = [f * (fs / 2) for f in bands]
        
        b = signal.remez(numtaps, bands_hz, desired, fs=fs)
        a = np.array([1.0])
        
        return self._compute_responses(b, a, fs)
    
    def design_iir(self, params):
        """Design IIR filter"""
        method = params.get('method', 'butterworth')
        fs = params['sampling_freq']
        filter_type = params['filter_type']
        order = params.get('order', 5)
        
        # Normalize frequencies
        nyquist = fs / 2
        
        if filter_type in ['lowpass', 'highpass']:
            Wn = params['passband_freq'] / nyquist
        else:  # bandpass, bandstop
            Wn = [f / nyquist for f in params['passband_freq']]
        
        # Design filter based on method
        if method == 'butterworth':
            b, a = signal.butter(order, Wn, btype=filter_type, analog=False)
        elif method == 'chebyshev1':
            rp = params.get('passband_ripple', 1)  # dB
            b, a = signal.cheby1(order, rp, Wn, btype=filter_type, analog=False)
        elif method == 'chebyshev2':
            rs = params.get('stopband_atten', 40)  # dB
            b, a = signal.cheby2(order, rs, Wn, btype=filter_type, analog=False)
        elif method == 'elliptic':
            rp = params.get('passband_ripple', 1)
            rs = params.get('stopband_atten', 40)
            b, a = signal.ellip(order, rp, rs, Wn, btype=filter_type, analog=False)
        else:
            raise ValueError(f"Unknown IIR method: {method}")
        
        return self._compute_responses(b, a, fs)
    
    def _compute_responses(self, b, a, fs):
        """Compute frequency, impulse, and pole-zero responses"""
        # Frequency response
        w, h = freqz(b, a, worN=2048, fs=fs)
        magnitude_db = 20 * np.log10(np.abs(h) + 1e-10)
        phase = np.angle(h)
        
        # Impulse response - use lfilter for better compatibility
        impulse_len = max(len(b), 50)
        impulse = signal.unit_impulse(impulse_len)
        impulse_response = signal.lfilter(b, a, impulse)
        
        # Step response
        step_len = 100
        step = np.ones(step_len)
        step_response = signal.lfilter(b, a, step)
        
        # Pole-zero (for IIR)
        poles = []
        zeros = []
        if len(a) > 1:
            zeros = np.roots(b).tolist()
            poles = np.roots(a).tolist()
            # Convert complex to [real, imag] for JSON
            zeros = [[z.real, z.imag] for z in zeros]
            poles = [[p.real, p.imag] for p in poles]
        
        return {
            'coefficients': {
                'b': b.tolist(),
                'a': a.tolist()
            },
            'frequency_response': {
                'frequency': w.tolist(),
                'magnitude_db': magnitude_db.tolist(),
                'phase': phase.tolist()
            },
            'impulse_response': impulse_response.tolist(),
            'step_response': step_response.tolist(),
            'pole_zero': {
                'poles': poles,
                'zeros': zeros
            }
        }
    
    def export_coefficients(self, coeffs, export_format='text'):
        """Export coefficients in various formats"""
        b = coeffs['b']
        a = coeffs['a']
        
        if export_format == 'text':
            return f"b = {b}\na = {a}"
        
        elif export_format == 'matlab':
            b_str = '[' + ', '.join([f'{x:.10f}' for x in b]) + ']'
            a_str = '[' + ', '.join([f'{x:.10f}' for x in a]) + ']'
            return f"b = {b_str};\na = {a_str};"
        
        elif export_format == 'python':
            b_str = '[' + ', '.join([f'{x:.10f}' for x in b]) + ']'
            a_str = '[' + ', '.join([f'{x:.10f}' for x in a]) + ']'
            return f"import numpy as np\n\nb = np.array({b_str})\na = np.array({a_str})"
        
        elif export_format == 'c':
            b_str = ', '.join([f'{x:.10f}f' for x in b])
            a_str = ', '.join([f'{x:.10f}f' for x in a])
            return f"float b[{len(b)}] = {{{b_str}}};\nfloat a[{len(a)}] = {{{a_str}}};"
        
        else:
            raise ValueError(f"Unknown export format: {export_format}")