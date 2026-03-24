import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Clock, 
  DollarSign, 
  Star, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Grid, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Hair',
    image: '',
    isPopular: false
  });

  const categories = ['All', 'Hair', 'Skincare', 'Nails', 'Makeup', 'Brows & Lashes', 'Spa & Massage'];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'Hair',
      image: '',
      isPopular: false
    });
    setEditingService(null);
  };

  const handleEditClick = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      category: service.category,
      image: service.image || '',
      isPopular: service.isPopular || false
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingService) {
        await axios.put(`http://localhost:5000/api/services/${editingService._id}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/services', formData, config);
      }
      
      fetchServices();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service. Please try again.');
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/services/${serviceToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service.');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate quick stats
  const stats = {
    total: services.length,
    popular: services.filter(s => s.isPopular).length,
    avgPrice: services.length > 0 
      ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / services.length) 
      : 0
  };

  return (
    <AdminLayout>
      <div className="services-admin-container">
        {/* Header */}
        <header className="services-admin-header">
          <div className="header-info">
            <h1>Services</h1>
            <p>Manage all salon services <span className="title-dot">•</span> {stats.total} Active</p>
          </div>
          <button className="add-service-btn" onClick={() => { resetForm(); setShowAddModal(true); }}>
            <Plus size={18} />
            <span>Add Service</span>
          </button>
        </header>

        {/* Quick Stats Row */}
        <div className="services-stats-row">
          <div className="stat-mini-pill">
            <Layers size={16} />
            <span>{stats.total} Total Services</span>
          </div>
          <div className="stat-mini-pill highlight-gold">
            <Star size={16} />
            <span>{stats.popular} Popular Highlights</span>
          </div>
          <div className="stat-mini-pill">
            <DollarSign size={16} />
            <span>${stats.avgPrice} Avg Price</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="services-toolbar">
          <div className="search-wrapper-premium">
            <Search className="search-icon-fixed" size={18} />
            <input 
              type="text" 
              placeholder="Search by service name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group-premium">
            {categories.map(cat => (
              <button 
                key={cat}
                className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="services-loading">
            <div className="loader-ring"></div>
            <p>Loading services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <motion.div 
            className="services-grid-premium"
            layout
          >
            <AnimatePresence>
              {filteredServices.map((service) => (
                <motion.div 
                  key={service._id}
                  className="service-pro-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="card-image-wrap">
                    <img src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400'} alt={service.name} />
                    {service.isPopular && <span className="popular-ribbon"><Star size={10} fill="currentColor" /> POPULAR</span>}
                    <div className="card-actions-overlay">
                      <button className="overlay-btn edit" onClick={() => handleEditClick(service)}><Edit2 size={16} /></button>
                      <button className="overlay-btn delete" onClick={() => handleDeleteClick(service)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                  
                  <div className="card-body-pro">
                    <div className="category-tag">{service.category}</div>
                    <h3>{service.name}</h3>
                    <p className="card-desc">{service.description || 'Professional service tailored to your needs.'}</p>
                    
                    <div className="card-footer-metrics">
                      <div className="metric-item">
                        <Clock size={14} />
                        <span>{service.duration} min</span>
                      </div>
                      <div className="metric-price">${service.price}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="empty-services-state">
            <Grid size={48} />
            <h3>No services found</h3>
            <p>Try adjusting your search or category filters.</p>
            <button className="clear-filter-btn" onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Filters</button>
          </div>
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="modal-overlay-blur">
              <motion.div 
                className="service-form-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
              >
                <div className="modal-header-pro">
                  <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                  <button className="close-x-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
                </div>

                <form className="modal-form-grid" onSubmit={handleSubmit}>
                  <div className="form-group-full">
                    <label>Service Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      placeholder="e.g., Professional Haircut"
                      value={formData.name}
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="form-group-full">
                    <label>Description</label>
                    <textarea 
                      name="description" 
                      rows="3" 
                      placeholder="Short description of the service..."
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <div className="form-group-half">
                    <label>Price ($)</label>
                    <input 
                      type="number" 
                      name="price" 
                      required 
                      placeholder="25"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group-half">
                    <label>Duration (mins)</label>
                    <input 
                      type="number" 
                      name="duration" 
                      required 
                      placeholder="30"
                      value={formData.duration}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group-half">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}>
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-half">
                    <label>Image URL</label>
                    <input 
                      type="text" 
                      name="image" 
                      placeholder="https://..."
                      value={formData.image}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group-checkbox">
                    <label className="checkbox-wrap">
                      <input 
                        type="checkbox" 
                        name="isPopular" 
                        checked={formData.isPopular}
                        onChange={handleInputChange}
                      />
                      <span className="chk-label">Mark as Popular Service</span>
                    </label>
                  </div>

                  <div className="form-actions-pro">
                    <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn-save">{editingService ? 'Update Service' : 'Create Service'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="modal-overlay-blur">
              <motion.div 
                className="delete-modal-pro"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="delete-icon-warn">
                  <AlertTriangle size={32} />
                </div>
                <h3>Delete Service?</h3>
                <p>Are you sure you want to delete <strong>{serviceToDelete?.name}</strong>? This action cannot be undone.</p>
                <div className="delete-actions-pro">
                  <button className="btn-no" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                  <button className="btn-yes" onClick={confirmDelete}>Yes, Delete</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default Services;
