import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FolderOpen, Star, Trash2, Edit, Calendar, Filter } from 'lucide-react';

const Dashboard = ({ onCreateNew, onLoadDesign }) => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, favorites, fir, iir

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const response = await axios.get('/api/designs');
      setDesigns(response.data.designs);
    } catch (error) {
      console.error('Failed to fetch designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this design?')) {
      return;
    }

    try {
      await axios.delete(`/api/designs/${id}`);
      setDesigns(designs.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete design:', error);
    }
  };

  const handleToggleFavorite = async (design) => {
    try {
      await axios.put(`/api/designs/${design.id}`, {
        is_favorite: !design.is_favorite
      });
      
      setDesigns(designs.map(d => 
        d.id === design.id ? { ...d, is_favorite: !d.is_favorite } : d
      ));
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  const filteredDesigns = designs.filter(design => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return design.is_favorite;
    if (filter === 'fir') return design.filter_class === 'fir';
    if (filter === 'iir') return design.filter_class === 'iir';
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your designs...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>My Filters</h2>
          <p>{designs.length} design{designs.length !== 1 ? 's' : ''} saved</p>
        </div>
        <button className="btn-primary" onClick={onCreateNew}>
          <Plus size={20} /> Create New Design
        </button>
      </div>

      <div className="dashboard-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Designs
        </button>
        <button 
          className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
          onClick={() => setFilter('favorites')}
        >
          <Star size={16} /> Favorites
        </button>
        <button 
          className={`filter-btn ${filter === 'fir' ? 'active' : ''}`}
          onClick={() => setFilter('fir')}
        >
          FIR Filters
        </button>
        <button 
          className={`filter-btn ${filter === 'iir' ? 'active' : ''}`}
          onClick={() => setFilter('iir')}
        >
          IIR Filters
        </button>
      </div>

      {filteredDesigns.length === 0 ? (
        <div className="empty-state">
          <FolderOpen size={64} color="#cbd5e1" />
          <h2>No designs yet</h2>
          <p>Create your first filter design to get started</p>
          <button className="btn-primary" onClick={onCreateNew}>
            <Plus size={20} /> Create Design
          </button>
        </div>
      ) : (
        <div className="designs-grid">
          {filteredDesigns.map(design => (
            <div key={design.id} className="design-card">
              <div className="design-card-header">
                <div className="design-badge">
                  <Filter size={16} />
                  {design.filter_class.toUpperCase()}
                </div>
                <button 
                  className={`favorite-btn ${design.is_favorite ? 'active' : ''}`}
                  onClick={() => handleToggleFavorite(design)}
                >
                  <Star size={18} fill={design.is_favorite ? '#fbbf24' : 'none'} />
                </button>
              </div>

              <h3>{design.name}</h3>
              <p className="design-description">
                {design.description || 'No description'}
              </p>

              <div className="design-meta">
                <span className="design-type">{design.filter_type}</span>
                <span className="design-method">{design.method}</span>
              </div>

              {design.tags && design.tags.length > 0 && (
                <div className="design-tags">
                  {design.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="design-footer">
                <div className="design-date">
                  <Calendar size={14} />
                  {new Date(design.updated_at).toLocaleDateString()}
                </div>
                <div className="design-actions">
                  <button 
                    className="btn-icon-small"
                    onClick={() => onLoadDesign(design.id)}
                    title="Load design"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="btn-icon-small danger"
                    onClick={() => handleDelete(design.id)}
                    title="Delete design"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;