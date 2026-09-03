import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient';
import { useDebounce } from '../../hooks/useDebounce';
import { exportToCSV, formatPropertiesForExport } from '../../utils/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import MobilePropertyCard from '../../components/admin/MobilePropertyCard';
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaTimes, 
  FaUpload, 
  FaSearch,
  FaCheck,
  FaDollarSign,
  FaHome,
  FaBuilding,
  FaLandmark,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaTh,
  FaList,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaStar
} from 'react-icons/fa';

import { logger } from '../../utils/logger';
import useConfirm from '../../components/ui/useConfirm';

const AdminProperties = () => {
  const [confirm, confirmDialog] = useConfirm();
  const queryClient = useQueryClient();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null);
  const [cloudinarySettings, setCloudinarySettings] = useState({
    cloudName: '',
    uploadPreset: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    property_type: '',
    status: 'available',
    purpose: 'sale',
    location: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    lot_size_sqft: '',
    has_pool: false,
    has_garden: false,
    featured: false,
    images: [],
    amenities: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounced search
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile state
  const [mobileViewMode, setMobileViewMode] = useState('grid'); // 'grid' or 'list'
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');

  // Property types based on purpose
  const propertyTypes = {
    sale: ['land', 'residential', 'commercial'],
    rent: ['apartment', 'villa', 'office']
  };

  // Fetch Cloudinary settings and properties with pagination
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Cloudinary settings. `admin_settings` is the single source
        // of truth since 010; the legacy `settings` table it replaced also
        // held the Cloudinary api_secret in a browser-readable row.
        const { data: settings } = await supabase
          .from('admin_settings')
          .select('cloud_name, upload_preset')
          .single();
        
        if (settings) {
          setCloudinarySettings({
            cloudName: settings.cloud_name,
            uploadPreset: settings.upload_preset
          });
        }

        // Fetch properties with pagination
        setLoading(true);
        
        // Calculate pagination
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        let query = supabase
          .from('properties')
          .select('*', { count: 'exact' })
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        // Apply search filter
        if (debouncedSearchTerm) {
          query = query.or(`title.ilike.%${debouncedSearchTerm}%,location.ilike.%${debouncedSearchTerm}%`);
        }
        
        query = query.range(from, to);
        
        const { data, error, count } = await query;
        
        if (error) throw error;
        setProperties(data || []);
        setTotalCount(count || 0);
      } catch (error) {
        toast.error('Error fetching properties: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sortField, sortDirection, currentPage, debouncedSearchTerm, itemsPerPage]);

  // Export properties to CSV
  const handleExport = () => {
    try {
      const formattedData = formatPropertiesForExport(properties);
      exportToCSV(formattedData, `properties-${new Date().toISOString().split('T')[0]}`);
      toast.success(`Exported ${properties.length} properties`);
    } catch {
      toast.error('Failed to export properties');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset property type when purpose changes
    if (name === 'purpose') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        property_type: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => {
      const newAmenities = [...prev.amenities];
      newAmenities.splice(index, 1);
      return { ...prev, amenities: newAmenities };
    });
  };

  // Handle image uploads for multiple files
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Reset previous selections
    setImageFiles([]);
    setImagePreviews([]);
    setImageFiles(files);
    
    // Create previews for all selected files
    const previews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Delete an existing image
  const handleDeleteImage = (index, type) => {
    if (type === 'existing') {
      // Delete from Cloudinary URLs
      setFormData(prev => {
        const newImages = [...prev.images];
        newImages.splice(index, 1);
        return { ...prev, images: newImages };
      });
    } else {
      // Delete from new previews
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
      
      setImageFiles(prev => {
        const newFiles = [...prev];
        newFiles.splice(index, 1);
        return newFiles;
      });
    }
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      property_type: '',
      status: 'available',
      purpose: 'sale',
      location: '',
      address: '',
      bedrooms: '',
      bathrooms: '',
      area_sqft: '',
      lot_size_sqft: '',
      has_pool: false,
      has_garden: false,
      featured: false,
      images: [],
      amenities: []
    });
    setImageFiles([]);
    setImagePreviews([]);
    setNewAmenity('');
    setErrors({});
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'title', 'description', 'price', 'property_type', 
      'location', 'address', 'bedrooms', 'bathrooms', 'area_sqft'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = `${field.replace('_', ' ')} is required`;
      }
    });
    
    if (formData.images.length === 0 && imageFiles.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload multiple images to Cloudinary
  const uploadImages = async () => {
    if (!imageFiles.length || !cloudinarySettings.cloudName || !cloudinarySettings.uploadPreset) {
      return [];
    }

    try {
      setLoading(true);
      const uploadPromises = imageFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinarySettings.uploadPreset);
        
        return fetch(
          `https://api.cloudinary.com/v1_1/${cloudinarySettings.cloudName}/image/upload`,
          { method: 'POST', body: formData }
        ).then(res => res.json());
      });

      const results = await Promise.all(uploadPromises);
      return results.map(result => result.secure_url);
    } catch (err) {
      logger.error('Image upload error:', err);
      toast.error('Failed to upload images. Please check Cloudinary settings.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Upload new images if selected
      let cloudinaryUrls = [...formData.images];
      
      if (imageFiles.length) {
        const uploadedUrls = await uploadImages();
        cloudinaryUrls = [...cloudinaryUrls, ...uploadedUrls];
      }

      // Convert number fields
      const numericFields = [
        'price', 'bedrooms', 'bathrooms', 'area_sqft', 
        'lot_size_sqft'
      ];
      const submitData = { ...formData, images: cloudinaryUrls };
      
      numericFields.forEach(field => {
        if (submitData[field]) submitData[field] = Number(submitData[field]);
      });

      if (currentProperty) {
        // Update
        const { error } = await supabase
          .from('properties')
          .update(submitData)
          .eq('id', currentProperty.id);
        
        if (error) throw error;
        toast.success('Property updated successfully!');
      } else {
        // Create
        const { error } = await supabase
          .from('properties')
          .insert([submitData]);
        
        if (error) throw error;
        toast.success('Property added successfully!');
      }
      
      fetchProperties();
      setIsModalOpen(false);
      setCurrentProperty(null);
      resetForm();
    } catch (error) {
      toast.error('Error saving property: ' + error.message);
      toast.error('Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) throw error;
      setProperties(data);
    } catch (error) {
      toast.error('Error fetching properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Name the listing. "Are you sure you want to delete this property?" is the
    // same sentence for every row, so it cannot catch the mistake it exists to
    // catch — deleting the wrong one.
    const property = properties.find((p) => p.id === id);
    const ok = await confirm({
      title: 'Delete property',
      message: property
        ? `"${property.title}" will be permanently deleted. This cannot be undone.`
        : 'This property will be permanently deleted. This cannot be undone.',
      confirmLabel: 'Delete property',
    });
    if (!ok) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProperties(properties.filter(p => p.id !== id));
      toast.success('Property deleted successfully!');
    } catch (error) {
      toast.error('Error deleting property: ' + error.message);
      toast.error('Failed to delete property');
    } finally {
      setLoading(false);
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (property) => {
    try {
      const newFeaturedValue = !property.featured;
      
      logger.debug('Toggling featured for property:', property.id, 'to:', newFeaturedValue);
      
      // Plain client: the Supabase Auth session carries admin identity, and the
      // "admins manage properties" policy in 009 authorises this write.
      const { data, error } = await supabase
        .from('properties')
        .update({ featured: newFeaturedValue })
        .eq('id', property.id)
        .select();
      
      if (error) {
        logger.error('Supabase error:', error);
        throw error;
      }
      
      logger.debug('Update result:', data);
      
      // Check if update actually happened
      if (!data || data.length === 0) {
        throw new Error('No rows updated - property may not exist');
      }
      
      setProperties(prev => prev.map(p => 
        p.id === property.id ? { ...p, featured: newFeaturedValue } : p
      ));
      
      // Invalidate homepage featured properties cache
      queryClient.invalidateQueries({ queryKey: ['featured-properties'] });
      
      toast.success(newFeaturedValue ? 'Added to featured' : 'Removed from featured');
    } catch (error) {
      logger.error('Toggle featured error:', error);
      toast.error(`Failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Filter properties for mobile
  const filteredProperties = properties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (purposeFilter !== 'all' && p.purpose !== purposeFilter) return false;
    return true;
  });

  const setupEditForm = (property) => {
    setCurrentProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price,
      property_type: property.property_type,
      status: property.status,
      purpose: property.purpose || 'sale',
      location: property.location,
      address: property.address || '',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area_sqft: property.area_sqft,
      lot_size_sqft: property.lot_size_sqft || '',
      has_pool: property.has_pool || false,
      has_garden: property.has_garden || false,
      featured: property.featured || false,
      images: property.images || [],
      amenities: property.amenities || []
    });
    setImageFiles([]);
    setImagePreviews([]);
    setNewAmenity('');
    setIsModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Manage Properties | Raslipwani Properties</title>
      </Helmet>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-brand-subtle border border-brand-subtle rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-brand-content font-medium">Total</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">{properties.length}</p>
        </div>
        <div className="bg-success-surface border border-success-border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-success-content font-medium">Featured</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">
            {properties.filter(p => p.featured).length}
          </p>
        </div>
        <div className="bg-warning-surface border border-warning-border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-warning-content font-medium">Pending</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">
            {properties.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-purple-800 font-medium">Sold</p>
          <p className="text-xl sm:text-2xl font-bold mt-1">
            {properties.filter(p => p.status === 'sold').length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-content">Manage Properties</h1>
          <p className="text-sm sm:text-base text-content-muted">{totalCount} properties total</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-initial sm:min-w-[250px]">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-line-strong rounded-lg px-3 sm:px-4 py-2 pl-9 sm:pl-10 text-sm sm:text-base focus:ring-2 focus:ring-focus-ring focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-content-subtle">
              <FaSearch className="text-sm" />
            </div>
          </div>
          
          <button
            onClick={handleExport}
            className="bg-success-content hover:bg-success-content text-content-on-brand px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center shadow-md text-sm sm:text-base"
            title="Export to CSV"
          >
            <FaDownload className="mr-2" /> <span className="hidden sm:inline">Export</span><span className="sm:hidden">CSV</span>
          </button>
          
          <button
            onClick={() => {
              setCurrentProperty(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-brand hover:bg-brand-hover text-content-on-brand px-4 py-2 rounded-lg flex items-center shadow-md"
          >
            <FaPlus className="mr-2" /> Add Property
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex gap-2 flex-1 sm:flex-initial">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="flex-1 sm:flex-initial border border-line-strong rounded-lg px-2 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-focus-ring focus:outline-none"
          >
            <option value="created_at">Date Added</option>
            <option value="price">Price</option>
            <option value="bedrooms">Bedrooms</option>
            <option value="bathrooms">Bathrooms</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="bg-surface-sunken border border-line-strong hover:bg-surface-sunken px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm sm:text-base"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={5} />
      ) : properties.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg border border-line">
          <h3 className="text-xl mb-4 text-content-muted">No properties found</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-content-on-brand px-6 py-2.5 rounded-lg shadow-md"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-lg border border-line shadow-sm">
            <table className="min-w-full divide-y divide-line">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface-raised divide-y divide-line">
                {properties.map(property => (
                  <tr key={property.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.images?.[0] ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.title} 
                            className="w-16 h-16 object-cover rounded-md mr-4"
                          />
                        ) : (
                          <div className="bg-surface-sunken border-2 border-dashed rounded-md w-16 h-16 mr-4 flex items-center justify-center text-content-subtle">
                            <FaTimes />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-content">{property.title}</div>
                          <div className="text-sm text-content-subtle">
                            {property.bedrooms} Beds, {property.bathrooms} Baths
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-content">{property.location}</div>
                      <div className="text-sm text-content-subtle">
                        {property.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-content">
                      Ksh{parseFloat(property.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize text-content">
                      {property.property_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'available' ? 'bg-success-surface text-success-content' :
                        property.status === 'pending' ? 'bg-warning-surface text-warning-content' :
                        property.status === 'sold' ? 'bg-brand-subtle text-brand-content' :
                        'bg-surface-sunken text-content'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setupEditForm(property)}
                          className="text-brand hover:text-brand-content transition-colors"
                          title="Edit property"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="text-danger-content hover:text-danger-content transition-colors"
                          title="Delete property"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden">
            {/* Mobile View Toggle & Filters */}
            <div className="flex gap-2 mb-4">
              {/* View Mode Toggle */}
              <div className="flex bg-surface-sunken rounded-lg p-1">
                <button
                  onClick={() => setMobileViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    mobileViewMode === 'grid' ? 'bg-surface-raised text-brand shadow-sm' : 'text-content-muted'
                  }`}
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setMobileViewMode('list')}
                  className={`p-2 rounded-md transition-all ${
                    mobileViewMode === 'list' ? 'bg-surface-raised text-brand shadow-sm' : 'text-content-muted'
                  }`}
                >
                  <FaList />
                </button>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                  showMobileFilters || statusFilter !== 'all' || purposeFilter !== 'all'
                    ? 'bg-brand-subtle border-brand-subtle text-brand'
                    : 'bg-surface-raised border-line text-content-muted'
                }`}
              >
                <FaFilter className="text-sm" />
                <span className="text-sm">Filter</span>
              </button>
            </div>

            {/* Mobile Filters Dropdown */}
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="bg-surface-raised rounded-lg shadow p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-content-muted mb-1">Status</label>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'available', 'pending', 'sold', 'rented'].map(status => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                              statusFilter === status
                                ? 'bg-brand text-content-on-media'
                                : 'bg-surface-sunken text-content-muted'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-content-muted mb-1">Purpose</label>
                      <div className="flex flex-wrap gap-2">
                        {['all', 'sale', 'rent'].map(purpose => (
                          <button
                            key={purpose}
                            onClick={() => setPurposeFilter(purpose)}
                            className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all ${
                              purposeFilter === purpose
                                ? 'bg-brand text-content-on-media'
                                : 'bg-surface-sunken text-content-muted'
                            }`}
                          >
                            {purpose === 'all' ? 'All' : purpose === 'sale' ? 'For Sale' : 'For Rent'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {(statusFilter !== 'all' || purposeFilter !== 'all') && (
                      <button
                        onClick={() => { setStatusFilter('all'); setPurposeFilter('all'); }}
                        className="w-full py-2 text-sm text-danger-content font-medium"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid View */}
            {mobileViewMode === 'grid' && (
              <div className="grid grid-cols-1 gap-3">
                {filteredProperties.map(property => (
                  <MobilePropertyCard
                    key={property.id}
                    property={property}
                    onView={() => setupEditForm(property)}
                    onEdit={() => setupEditForm(property)}
                    onDelete={() => handleDelete(property.id)}
                    onToggleFeatured={() => handleToggleFeatured(property)}
                  />
                ))}
              </div>
            )}

            {/* List View */}
            {mobileViewMode === 'list' && (
              <div className="space-y-2">
                {filteredProperties.map(property => (
                  <div 
                    key={property.id} 
                    className="bg-surface-raised rounded-lg shadow-sm border border-line p-3 flex items-center gap-3"
                    onClick={() => setupEditForm(property)}
                  >
                    {property.images?.[0] ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.title} 
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-surface-sunken rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaHome className="text-content-subtle text-xl" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-content text-sm truncate">{property.title}</h3>
                      <p className="text-xs text-content-subtle truncate">{property.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-brand">
                          Ksh {parseFloat(property.price).toLocaleString()}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          property.status === 'available' ? 'bg-success-surface text-success-content' :
                          property.status === 'pending' ? 'bg-warning-surface text-warning-content' :
                          property.status === 'sold' ? 'bg-danger-surface text-danger-content' :
                          'bg-surface-sunken text-content'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                    <FaChevronRight className="text-content-on-media/80" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Pagination */}
      {!loading && totalCount > 0 && (
        <div className="mt-4 sm:mt-6 flex flex-col gap-3 sm:flex-row items-center justify-between">
          <div className="text-xs sm:text-sm text-content-muted text-center sm:text-left">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center text-xs sm:text-sm ${
                currentPage === 1
                  ? 'bg-surface-sunken text-content-subtle cursor-not-allowed'
                  : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
              }`}
            >
              <FaChevronLeft className="mr-0 sm:mr-1" /> <span className="hidden xs:inline">Prev</span>
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(totalCount / itemsPerPage) }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                         page === Math.ceil(totalCount / itemsPerPage) || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, arr) => (
                  <React.Fragment key={page}>
                    {index > 0 && arr[index - 1] !== page - 1 && (
                      <span className="px-1 text-content-subtle text-xs sm:text-sm">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${
                        currentPage === page
                          ? 'bg-brand text-content-on-media'
                          : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalCount / itemsPerPage)))}
              disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg flex items-center text-xs sm:text-sm ${
                currentPage === Math.ceil(totalCount / itemsPerPage)
                  ? 'bg-surface-sunken text-content-subtle cursor-not-allowed'
                  : 'bg-surface-raised border border-line-strong text-content-muted hover:bg-surface'
              }`}
            >
              <span className="hidden xs:inline">Next</span> <FaChevronRight className="ml-0 sm:ml-1" />
            </button>
          </div>
        </div>
      )}
      
      {/*
        The property form. It was a hand-rolled overlay with a sticky header:
        focus never entered it, Tab left the form for the table behind, and
        Escape did nothing. `Modal` supplies all three. The fields inside are
        still hand-written and still carry unassociated labels — they move to
        `Input`/`Select` with this surface's own migration, which is a larger
        change than putting the dialog in the right shell.
      */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={currentProperty ? 'Edit Property' : 'Add New Property'}
        size="xl"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading} disabled={loading}>
              {loading
                ? currentProperty
                  ? 'Updating...'
                  : 'Adding...'
                : currentProperty
                  ? 'Update Property'
                  : 'Add Property'}
            </Button>
          </>
        }
      >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-content-muted mb-2">Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.title ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                      required
                    />
                    {errors.title && <p className="text-danger-content text-sm mt-1">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-content-muted mb-2">Description*</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.description ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 h-32 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                      required
                    ></textarea>
                    {errors.description && <p className="text-danger-content text-sm mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-content-muted mb-2">Price (KES)*</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.price ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                      required
                    />
                    {errors.price && <p className="text-danger-content text-sm mt-1">{errors.price}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Purpose*</label>
                      <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="w-full border border-line-strong rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none"
                        required
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Property Type*</label>
                      <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.property_type ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                        required
                      >
                        <option value="">Select Type</option>
                        {propertyTypes[formData.purpose]?.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.property_type && <p className="text-danger-content text-sm mt-1">{errors.property_type}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-content-muted mb-2">Location*</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.location ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                      required
                    />
                    {errors.location && <p className="text-danger-content text-sm mt-1">{errors.location}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-content-muted mb-2">Address*</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.address ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                      required
                    />
                    {errors.address && <p className="text-danger-content text-sm mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Bedrooms*</label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.bedrooms ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                        required
                      />
                      {errors.bedrooms && <p className="text-danger-content text-sm mt-1">{errors.bedrooms}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Bathrooms*</label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.bathrooms ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                        required
                      />
                      {errors.bathrooms && <p className="text-danger-content text-sm mt-1">{errors.bathrooms}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Area (sqft)*</label>
                      <input
                        type="number"
                        name="area_sqft"
                        value={formData.area_sqft}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.area_sqft ? 'border-danger-border' : 'border-line-strong'} rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none`}
                        required
                      />
                      {errors.area_sqft && <p className="text-danger-content text-sm mt-1">{errors.area_sqft}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Lot Size (sqft)</label>
                      <input
                        type="number"
                        name="lot_size_sqft"
                        value={formData.lot_size_sqft}
                        onChange={handleInputChange}
                        className="w-full border border-line-strong rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-content-muted mb-2">Status*</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-line-strong rounded-lg p-3 focus:ring-2 focus:ring-focus-ring focus:outline-none"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="off-market">Off Market</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-surface p-4 rounded-lg">
                    <label className="block text-sm font-medium text-content-muted mb-2">Amenities</label>
                    <div className="flex mb-3">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add amenity (e.g. Swimming Pool)"
                        className="flex-grow border border-line-strong rounded-lg p-2 focus:ring-2 focus:ring-focus-ring focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddAmenity}
                        className="ml-2 bg-brand text-content-on-brand px-4 py-2 rounded-lg hover:bg-brand-hover transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <div 
                          key={index} 
                          className="bg-brand-subtle text-brand-content rounded-full pl-3 pr-2 py-1.5 flex items-center"
                        >
                          <span className="text-sm">{amenity}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveAmenity(index)}
                            className="ml-1 text-brand hover:text-brand-content"
                          >
                            <FaTimes size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="has_pool"
                        checked={formData.has_pool}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-brand rounded focus:ring-focus-ring"
                      />
                      <label className="text-sm font-medium text-content-muted">Has Pool</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="has_garden"
                        checked={formData.has_garden}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-brand rounded focus:ring-focus-ring"
                      />
                      <label className="text-sm font-medium text-content-muted">Has Garden</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-brand rounded focus:ring-focus-ring"
                      />
                      <label className="text-sm font-medium text-content-muted">Featured Property</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-content-muted mb-2">Property Images</label>
                    <div className="flex items-center justify-center w-full border-2 border-dashed border-line-strong rounded-lg p-8 text-center bg-surface">
                      <div>
                        <FaUpload className="mx-auto text-content-subtle text-2xl mb-2" />
                        <p className="text-sm text-content-muted">
                          Drag & drop images here or
                          <label htmlFor="property-images" className="text-brand cursor-pointer ml-1 font-medium">
                            browse files
                          </label>
                        </p>
                        <input
                          type="file"
                          id="property-images"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                          multiple
                        />
                      </div>
                    </div>
                    
                    {errors.images && <p className="text-danger-content text-sm mt-1">{errors.images}</p>}
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                      {/* Existing images */}
                      {formData.images.map((img, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img 
                            src={img} 
                            alt={`Property ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(index, 'existing')}
                            className="absolute top-1 right-1 bg-danger-content text-content-on-brand rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      
                      {/* New image previews */}
                      {imagePreviews.map((preview, index) => (
                        <div key={`preview-${index}`} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(index, 'preview')}
                            className="absolute top-1 right-1 bg-danger-content text-content-on-brand rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {loading && (
                      <div className="mt-3 text-brand flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-brand mr-2"></div>
                        Uploading images...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
      </Modal>

      {confirmDialog}
    </>
  );
};

export default AdminProperties;