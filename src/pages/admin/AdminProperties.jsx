import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../utils/supabaseClient';
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
  FaLandmark
} from 'react-icons/fa';

const AdminProperties = () => {
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
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Property types based on purpose
  const propertyTypes = {
    sale: ['land', 'residential', 'commercial'],
    rent: ['apartment', 'villa', 'office']
  };

  // Fetch Cloudinary settings and properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Cloudinary settings
        const { data: settings } = await supabase
          .from('settings')
          .select('cloud_name, upload_preset')
          .single();
        
        if (settings) {
          setCloudinarySettings({
            cloudName: settings.cloud_name,
            uploadPreset: settings.upload_preset
          });
        }

        // Fetch properties
        setLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (error) throw error;
        setProperties(data);
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [sortField, sortDirection]);

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
      console.error('Image upload error:', err);
      setError('Failed to upload images. Please check Cloudinary settings.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
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
        setSuccess('Property updated successfully!');
      } else {
        // Create
        const { error } = await supabase
          .from('properties')
          .insert([submitData]);
        
        if (error) throw error;
        setSuccess('Property added successfully!');
      }
      
      fetchProperties();
      setIsModalOpen(false);
      setCurrentProperty(null);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error saving property: ' + error.message);
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
      setError('Error fetching properties: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProperties(properties.filter(p => p.id !== id));
      setSuccess('Property deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Error deleting property: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter and sort properties
  const filteredProperties = properties
    .filter(property => {
      return property.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             property.location?.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <>
      <Helmet>
        <title>Manage Properties | Raslipwani Properties</title>
      </Helmet>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">Total Properties</p>
          <p className="text-2xl font-bold mt-1">{properties.length}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">Featured</p>
          <p className="text-2xl font-bold mt-1">
            {properties.filter(p => p.featured).length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">Pending</p>
          <p className="text-2xl font-bold mt-1">
            {properties.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-800 font-medium">Sold</p>
          <p className="text-2xl font-bold mt-1">
            {properties.filter(p => p.status === 'sold').length}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Properties</h1>
          <p className="text-gray-600">{properties.length} properties listed</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaSearch />
            </div>
          </div>
          
          <button
            onClick={() => {
              setCurrentProperty(null);
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-md"
          >
            <FaPlus className="mr-2" /> Add Property
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="created_at">Date Added</option>
            <option value="price">Price</option>
            <option value="bedrooms">Bedrooms</option>
            <option value="bathrooms">Bathrooms</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="bg-gray-100 border border-gray-300 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center"
          >
            {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl mb-4 text-gray-600">No properties found</h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProperties.map(property => (
                <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {property.images?.[0] ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.title} 
                          className="w-16 h-16 object-cover rounded-md mr-4"
                        />
                      ) : (
                        <div className="bg-gray-100 border-2 border-dashed rounded-md w-16 h-16 mr-4 flex items-center justify-center text-gray-400">
                          <FaTimes />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms} Beds, {property.bathrooms} Baths
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{property.location}</div>
                    <div className="text-sm text-gray-500">
                      {property.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    Ksh{parseFloat(property.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize text-gray-900">
                    {property.property_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                      property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setupEditForm(property)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Edit property"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
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
      )}
      
      {/* Property Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentProperty ? 'Edit Property' : 'Add New Property'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title*</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (KES)*</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purpose*</label>
                      <select
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type*</label>
                      <select
                        name="property_type"
                        value={formData.property_type}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.property_type ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        required
                      >
                        <option value="">Select Type</option>
                        {propertyTypes[formData.purpose]?.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.property_type && <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location*</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address*</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      required
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms*</label>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.bedrooms ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        required
                      />
                      {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms*</label>
                      <input
                        type="number"
                        name="bathrooms"
                        value={formData.bathrooms}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        required
                      />
                      {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Area (sqft)*</label>
                      <input
                        type="number"
                        name="area_sqft"
                        value={formData.area_sqft}
                        onChange={handleInputChange}
                        className={`w-full border ${errors.area_sqft ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                        required
                      />
                      {errors.area_sqft && <p className="text-red-500 text-sm mt-1">{errors.area_sqft}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lot Size (sqft)</label>
                      <input
                        type="number"
                        name="lot_size_sqft"
                        value={formData.lot_size_sqft}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status*</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      >
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="sold">Sold</option>
                        <option value="off-market">Off Market</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                    <div className="flex mb-3">
                      <input
                        type="text"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        placeholder="Add amenity (e.g. Swimming Pool)"
                        className="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddAmenity}
                        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, index) => (
                        <div 
                          key={index} 
                          className="bg-blue-100 text-blue-800 rounded-full pl-3 pr-2 py-1.5 flex items-center"
                        >
                          <span className="text-sm">{amenity}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveAmenity(index)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
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
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">Has Pool</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="has_garden"
                        checked={formData.has_garden}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">Has Garden</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={formData.featured}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">Featured Property</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                    <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <div>
                        <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                        <p className="text-sm text-gray-600">
                          Drag & drop images here or
                          <label htmlFor="property-images" className="text-blue-600 cursor-pointer ml-1 font-medium">
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
                    
                    {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                    
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
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
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
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {loading && (
                      <div className="mt-3 text-blue-500 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                        Uploading images...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      {currentProperty ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : currentProperty ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProperties;