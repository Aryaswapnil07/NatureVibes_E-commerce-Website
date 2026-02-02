import React, { useState } from 'react';
import { Leaf, Upload, DollarSign, Sun, Droplets, LayoutGrid, PlusCircle, Settings } from 'lucide-react';


const AdminAddPlant = () => {
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    price: '',
    category: 'Indoor',
    stock: '',
    image: '',
    description: '',
    care: {
      light: 'Low',
      water: 'Weekly'
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'light' || name === 'water') {
      setFormData({
        ...formData,
        care: { ...formData.care, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Plant Data Submitted:', formData);
    alert("Plant added successfully! (Check console for data)");
    // Here you would typically send a POST request to your backend
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-white hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-green-800">
          <Leaf className="w-6 h-6 text-green-400" />
          <span className="text-xl font-bold">PlantAdmin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-left text-green-100 hover:bg-green-800 rounded-lg transition">
            <LayoutGrid className="w-5 h-5" /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-left bg-green-800 text-white rounded-lg shadow-sm">
            <PlusCircle className="w-5 h-5" /> Add Plant
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 text-left text-green-100 hover:bg-green-800 rounded-lg transition">
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Add New Plant</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new product listing for your store.</p>
        </header>

        <div className="max-w-4xl mx-auto px-6 pb-12">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Details Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">General Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plant Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="e.g. Monstera Deliciosa" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Name (Optional)</label>
                    <input 
                      type="text" 
                      name="scientificName" 
                      placeholder="e.g. Monstera deliciosa Liebm" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description" 
                      rows="4" 
                      placeholder="Describe the plant..." 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Inventory & Pricing</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input 
                        type="number" 
                        name="price" 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="0.00"
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      name="stock" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Available units"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media & Specifics */}
            <div className="space-y-6">
              
              {/* Media Upload */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Product Image</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  <input type="file" className="hidden" />
                </div>
                {/* Simulated Image URL Input for demo */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or Image URL</label>
                  <input 
                    type="text" 
                    name="image" 
                    placeholder="https://..." 
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Plant Specific Details */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Plant Care Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Sun className="w-4 h-4 text-orange-500" /> Sunlight Req.
                    </label>
                    <select 
                      name="light" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                      onChange={handleChange}
                    >
                      <option>Low Light</option>
                      <option>Indirect Sunlight</option>
                      <option>Direct Sunlight</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" /> Watering Freq.
                    </label>
                    <select 
                      name="water" 
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
                      onChange={handleChange}
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Bi-Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <div className="flex gap-2">
                      {['Indoor', 'Outdoor', 'Succulent'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({...formData, category: cat})}
                          className={`px-3 py-1 text-sm rounded-full border ${
                            formData.category === cat 
                            ? 'bg-green-100 border-green-500 text-green-700' 
                            : 'bg-white border-gray-300 text-gray-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200"
              >
                Publish Plant
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminAddPlant;   