import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Clock, 
  DollarSign, 
  Star, 
  X, 
  AlertTriangle, 
  Grid, 
  Layers,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/layout/AdminLayout';
import { useToast } from '../../context/ToastContext';
import './Services.css';

const Services = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
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
    imageFile: null, // For local upload
    isPopular: false
  });

  const [imagePreview, setImagePreview] = useState(null);

  const [activeMenu, setActiveMenu] = useState(null);

  const categories = ['All', 'Hair', 'Skincare', 'Nails', 'Makeup', 'Brows & Lashes', 'Spa & Massage'];

  useEffect(() => {
    fetchServices();
    const handleOutsideClick = () => setActiveMenu(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
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
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        setFormData({ ...formData, imageFile: file });
        setImagePreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'Hair',
      imageFile: null,
      isPopular: false
    });
    setImagePreview(null);
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
      imageFile: null,
      isPopular: service.isPopular || false
    });
    setImagePreview(service.image || null);
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
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'imageFile') {
          if (formData.imageFile) submitData.append('image', formData.imageFile);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editingService) {
        await axios.put(`http://localhost:5000/api/services/${editingService._id}`, submitData, config);
        showToast('Service updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/services', submitData, config);
        showToast('Service created successfully!');
      }
      
      fetchServices();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      showToast('Failed to save service.', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/services/${serviceToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Service deleted successfully!');
      fetchServices();
      setShowDeleteModal(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      showToast('Failed to delete service.', 'error');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

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
          <>
            <motion.div 
              className="services-grid-premium"
              layout
            >
              <AnimatePresence>
                {currentServices.map((service) => (
                  <motion.div 
                    key={service._id}
                    className="service-pro-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="card-body-pro">
                      <div className="card-header-actions">
                        <div className="category-tag">{service.category}</div>
                        <div className="action-menu-wrap" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="dots-action-btn"
                            onClick={() => setActiveMenu(activeMenu === service._id ? null : service._id)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenu === service._id && (
                            <div className="service-action-dropdown">
                              <button className="dropdown-opt edit" onClick={() => handleEditClick(service)}><Edit2 size={14} /> Edit Service</button>
                              <button className="dropdown-opt delete" onClick={() => handleDeleteClick(service)}><Trash2 size={14} /> Delete</button>
                            </div>
                          )}
                        </div>
                      </div>

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

                    <div className="card-image-wrap">
                      <img src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400'} alt={service.name} />
                      {service.isPopular && <span className="popular-ribbon"><Star size={10} fill="currentColor" /> POPULAR</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-footer">
                <div className="pagination-info">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredServices.length)} of {filteredServices.length}
                </div>
                <div className="pagination-controls-pro">
                  <button 
                    className="pagination-btn-square"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`pagination-btn-square ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    className="pagination-btn-square"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
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
                    <label>Service Image</label>
                    <div className="file-upload-pro">
                      <input 
                        type="file" 
                        id="serviceImage"
                        name="image" 
                        accept="image/*"
                        onChange={handleInputChange}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="serviceImage" className="file-label-btn">
                        <Upload size={14} style={{ marginRight: '8px' }} />
                        {imagePreview ? 'Change Image' : 'Choose Local Image'}
                      </label>
                      {imagePreview && (
                        <div className="preview-small-wrap" title="Image Preview">
                          <img src={imagePreview} alt="Preview" />
                        </div>
                      )}
                    </div>
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
