import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ArrowLeft, Download, TrendingUp, Activity, Zap, Target } from 'lucide-react';

const ResultsDisplay = ({ results, onBack, onExport, onSave }) => {
  const [activeTab, setActiveTab] = useState('magnitude');

  // Prepare data for frequency response
  const frequencyData = results.frequency_response.frequency.map((freq, idx) => ({
    frequency: freq,
    magnitude: results.frequency_response.magnitude_db[idx],
    phase: results.frequency_response.phase[idx]
  }));

  // Prepare impulse response data
  const impulseData = results.impulse_response.map((val, idx) => ({
    n: idx,
    amplitude: val
  }));

  // Prepare step response data
  const stepData = results.step_response.map((val, idx) => ({
    n: idx,
    amplitude: val
  }));

  // Prepare pole-zero data
  const poleZeroData = {
    poles: results.pole_zero.poles.map(p => ({ x: p[0], y: p[1], type: 'pole' })),
    zeros: results.pole_zero.zeros.map(z => ({ x: z[0], y: z[1], type: 'zero' }))
  };

  const hasPoleZero = poleZeroData.poles.length > 0 || poleZeroData.zeros.length > 0;

  return (
    <div className="results-panel">
      <div className="results-header">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Filter Design Results</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onSave}>
            Save Design
          </button>
          <button className="btn-primary" onClick={onExport}>
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* Coefficients Summary */}
      <div className="coefficients-summary">
        <div className="coeff-section">
          <h3>Numerator (b)</h3>
          <div className="coeff-preview">
            [{results.coefficients.b.slice(0, 5).map(c => c.toFixed(6)).join(', ')}
            {results.coefficients.b.length > 5 ? ', ...' : ''}]
          </div>
          <small>{results.coefficients.b.length} coefficients</small>
        </div>
        <div className="coeff-section">
          <h3>Denominator (a)</h3>
          <div className="coeff-preview">
            [{results.coefficients.a.slice(0, 5).map(c => c.toFixed(6)).join(', ')}
            {results.coefficients.a.length > 5 ? ', ...' : ''}]
          </div>
          <small>{results.coefficients.a.length} coefficients</small>
        </div>
      </div>

      {/* Tabs for different plots */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'magnitude' ? 'active' : ''}`}
          onClick={() => setActiveTab('magnitude')}
        >
          <TrendingUp size={16} /> Magnitude Response
        </button>
        <button
          className={`tab ${activeTab === 'phase' ? 'active' : ''}`}
          onClick={() => setActiveTab('phase')}
        >
          <Activity size={16} /> Phase Response
        </button>
        <button
          className={`tab ${activeTab === 'impulse' ? 'active' : ''}`}
          onClick={() => setActiveTab('impulse')}
        >
          <Zap size={16} /> Impulse Response
        </button>
        <button
          className={`tab ${activeTab === 'step' ? 'active' : ''}`}
          onClick={() => setActiveTab('step')}
        >
          <Activity size={16} /> Step Response
        </button>
        {hasPoleZero && (
          <button
            className={`tab ${activeTab === 'polezero' ? 'active' : ''}`}
            onClick={() => setActiveTab('polezero')}
          >
            <Target size={16} /> Pole-Zero
          </button>
        )}
      </div>

      {/* Plot Display */}
      <div className="plot-container">
        {activeTab === 'magnitude' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="frequency" 
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Magnitude (dB)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="magnitude" 
                stroke="#2563eb" 
                dot={false}
                name="Magnitude"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'phase' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="frequency" 
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Phase (radians)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="phase" 
                stroke="#dc2626" 
                dot={false}
                name="Phase"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'impulse' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={impulseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="n" 
                label={{ value: 'Sample (n)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amplitude" 
                stroke="#16a34a" 
                dot={{ r: 3 }}
                name="Impulse Response"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'step' && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={stepData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="n" 
                label={{ value: 'Sample (n)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amplitude" 
                stroke="#9333ea" 
                dot={false}
                name="Step Response"
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'polezero' && hasPoleZero && (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="x" 
                domain={[-1.5, 1.5]}
                label={{ value: 'Real', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                domain={[-1.5, 1.5]}
                label={{ value: 'Imaginary', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {poleZeroData.zeros.length > 0 && (
                <Scatter 
                  name="Zeros" 
                  data={poleZeroData.zeros} 
                  fill="#16a34a"
                  shape="circle"
                />
              )}
              {poleZeroData.poles.length > 0 && (
                <Scatter 
                  name="Poles" 
                  data={poleZeroData.poles} 
                  fill="#dc2626"
                  shape="cross"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;