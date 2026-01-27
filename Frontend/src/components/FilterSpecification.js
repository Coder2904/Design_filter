import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, Settings, Zap } from 'lucide-react';

const FilterSpecification = ({ onDesignComplete, setLoading, setError, onBack }) => {
  const [filterClass, setFilterClass] = useState('fir');
  const [filterType, setFilterType] = useState('lowpass');
  const [method, setMethod] = useState('window');
  const [window, setWindow] = useState('hamming');
  
  const [samplingFreq, setSamplingFreq] = useState(10000);
  const [passbandFreq, setPassbandFreq] = useState(1000);
  const [passbandFreq2, setPassbandFreq2] = useState(2000);
  const [order, setOrder] = useState(51);
  const [passbandRipple, setPassbandRipple] = useState(1);
  const [stopbandAtten, setStopbandAtten] = useState(40);
  
  const [validationErrors, setValidationErrors] = useState([]);

  const isBandFilter = filterType === 'bandpass' || filterType === 'bandstop';

  // Real-time validation
  useEffect(() => {
    const errors = [];
    const nyquist = samplingFreq / 2;

    if (samplingFreq <= 0) {
      errors.push('Sampling frequency must be positive');
    }

    if (passbandFreq <= 0 || passbandFreq >= nyquist) {
      errors.push(`Passband frequency must be between 0 and ${nyquist} Hz`);
    }

    if (isBandFilter) {
      if (passbandFreq2 <= 0 || passbandFreq2 >= nyquist) {
        errors.push(`Second passband frequency must be between 0 and ${nyquist} Hz`);
      }
      if (passbandFreq >= passbandFreq2) {
        errors.push('First passband frequency must be less than second');
      }
    }

    if (order < 1) {
      errors.push('Filter order must be at least 1');
    }

    setValidationErrors(errors);
  }, [samplingFreq, passbandFreq, passbandFreq2, order, filterType, isBandFilter]);

  const handleDesign = async () => {
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    const params = {
      filter_class: filterClass,
      filter_type: filterType,
      method: filterClass === 'fir' ? method : method,
      sampling_freq: samplingFreq,
      passband_freq: isBandFilter ? [passbandFreq, passbandFreq2] : passbandFreq,
      order: order,
    };

    // Add method-specific parameters
    if (filterClass === 'fir' && method === 'window') {
      params.window = window;
    }

    if (filterClass === 'iir') {
      if (method === 'chebyshev1' || method === 'elliptic') {
        params.passband_ripple = passbandRipple;
      }
      if (method === 'chebyshev2' || method === 'elliptic') {
        params.stopband_atten = stopbandAtten;
      }
    }

    try {
      const response = await axios.post('/api/design-filter', params);
      onDesignComplete(response.data.data, params);
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to design filter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="specification-panel">
      {onBack && (
        <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Dashboard
        </button>
      )}
      
      <div className="panel-section">
        <h2><Settings size={20} /> Filter Configuration</h2>
        
        {/* Filter Class Selection */}
        <div className="form-group">
          <label>Filter Class</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="fir"
                checked={filterClass === 'fir'}
                onChange={(e) => {
                  setFilterClass(e.target.value);
                  setMethod('window');
                }}
              />
              FIR (Finite Impulse Response)
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="iir"
                checked={filterClass === 'iir'}
                onChange={(e) => {
                  setFilterClass(e.target.value);
                  setMethod('butterworth');
                }}
              />
              IIR (Infinite Impulse Response)
            </label>
          </div>
        </div>

        {/* Filter Type */}
        <div className="form-group">
          <label>Filter Type</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="lowpass">Low-pass</option>
            <option value="highpass">High-pass</option>
            <option value="bandpass">Band-pass</option>
            <option value="bandstop">Band-stop</option>
          </select>
        </div>

        {/* Design Method */}
        <div className="form-group">
          <label>Design Method</label>
          {filterClass === 'fir' ? (
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="window">Window Method</option>
              <option value="remez">Parks-McClellan (Remez)</option>
            </select>
          ) : (
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="butterworth">Butterworth</option>
              <option value="chebyshev1">Chebyshev I</option>
              <option value="chebyshev2">Chebyshev II</option>
              <option value="elliptic">Elliptic</option>
            </select>
          )}
        </div>

        {/* Window Type (FIR only) */}
        {filterClass === 'fir' && method === 'window' && (
          <div className="form-group">
            <label>Window Type</label>
            <select value={window} onChange={(e) => setWindow(e.target.value)}>
              <option value="hamming">Hamming</option>
              <option value="hanning">Hanning</option>
              <option value="blackman">Blackman</option>
              <option value="kaiser">Kaiser</option>
              <option value="rectangular">Rectangular</option>
            </select>
          </div>
        )}
      </div>

      <div className="panel-section">
        <h2><Zap size={20} /> Frequency Specifications</h2>

        {/* Sampling Frequency */}
        <div className="form-group">
          <label>Sampling Frequency (Hz)</label>
          <input
            type="number"
            value={samplingFreq}
            onChange={(e) => setSamplingFreq(Number(e.target.value))}
            min="1"
          />
          <small>Nyquist frequency: {samplingFreq / 2} Hz</small>
        </div>

        {/* Passband Frequency */}
        <div className="form-group">
          <label>{isBandFilter ? 'Lower Passband Frequency (Hz)' : 'Cutoff Frequency (Hz)'}</label>
          <input
            type="number"
            value={passbandFreq}
            onChange={(e) => setPassbandFreq(Number(e.target.value))}
            min="0"
            max={samplingFreq / 2}
          />
        </div>

        {/* Second Passband Frequency (for band filters) */}
        {isBandFilter && (
          <div className="form-group">
            <label>Upper Passband Frequency (Hz)</label>
            <input
              type="number"
              value={passbandFreq2}
              onChange={(e) => setPassbandFreq2(Number(e.target.value))}
              min="0"
              max={samplingFreq / 2}
            />
          </div>
        )}

        {/* Filter Order */}
        <div className="form-group">
          <label>Filter Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            min="1"
          />
          <small>{filterClass === 'fir' ? 'Number of taps' : 'Filter order'}</small>
        </div>

        {/* IIR-specific parameters */}
        {filterClass === 'iir' && (method === 'chebyshev1' || method === 'elliptic') && (
          <div className="form-group">
            <label>Passband Ripple (dB)</label>
            <input
              type="number"
              value={passbandRipple}
              onChange={(e) => setPassbandRipple(Number(e.target.value))}
              min="0.1"
              step="0.1"
            />
          </div>
        )}

        {filterClass === 'iir' && (method === 'chebyshev2' || method === 'elliptic') && (
          <div className="form-group">
            <label>Stopband Attenuation (dB)</label>
            <input
              type="number"
              value={stopbandAtten}
              onChange={(e) => setStopbandAtten(Number(e.target.value))}
              min="1"
            />
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <AlertCircle size={18} />
          <div>
            {validationErrors.map((err, idx) => (
              <div key={idx}>{err}</div>
            ))}
          </div>
        </div>
      )}

      {/* Design Button */}
      <button
        className="btn-primary btn-large"
        onClick={handleDesign}
        disabled={validationErrors.length > 0}
      >
        Design Filter
      </button>
    </div>
  );
};

export default FilterSpecification;