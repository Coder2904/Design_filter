import React, { useState } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

const SaveDesignModal = ({ parameters, results, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your design');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const tagArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await axios.post('/api/designs', {
        name: name.trim(),
        description: description.trim(),
        parameters,
        results,
        tags: tagArray
      });

      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.details || 'Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Save Filter Design</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Design Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Low-pass 1kHz Audio Filter"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional description of your filter design..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="audio, speech, prototype (comma-separated)"
            />
            <small>Separate tags with commas</small>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Design'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveDesignModal;