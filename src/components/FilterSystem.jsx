import React, { useState, useEffect } from 'react';
import { SearchNormal, Filter } from 'iconsax-react';

const FilterSystem = ({ users, onFilterChange }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    businessTypes: [],
    industrySectors: [],
    sortOption: '',
  });
  const [businessTypes, setBusinessTypes] = useState([]);
  const [industrySectors, setIndustrySectors] = useState([]);

  useEffect(() => {
    if (users && users.length > 0) {
      const types = [...new Set(users.map(user => user.businessType))];
      const sectors = [...new Set(users.map(user => user.industrySector))];
      setBusinessTypes(types);
      setIndustrySectors(sectors);
    }
  }, [users]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    applyFilters(e.target.value, selectedFilters);
  };

  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (type === 'sortOption') {
        newFilters[type] = value;
      } else {
        if (newFilters[type].includes(value)) {
          newFilters[type] = newFilters[type].filter(item => item !== value);
        } else {
          newFilters[type] = [...newFilters[type], value];
        }
      }
      applyFilters(searchTerm, newFilters);
      return newFilters;
    });
  };

  const applyFilters = (search, filters) => {
    if (!users) {
      return; // Exit early if users is undefined or null
    }
  
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.businessType.toLowerCase().includes(search.toLowerCase()) ||
      user.industrySector.toLowerCase().includes(search.toLowerCase())
    );
  
    if (filters.businessTypes.length > 0) {
      filtered = filtered.filter(user => filters.businessTypes.includes(user.businessType));
    }
  
    if (filters.industrySectors.length > 0) {
      filtered = filtered.filter(user => filters.industrySectors.includes(user.industrySector));
    }
  
    if (filters.sortOption) {
      filtered.sort((a, b) => {
        if (filters.sortOption === 'nameAsc') return a.name.localeCompare(b.name);
        if (filters.sortOption === 'nameDesc') return b.name.localeCompare(a.name);
        if (filters.sortOption === 'recent') return new Date(b.timestamp) - new Date(a.timestamp);
        if (filters.sortOption === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
        return 0;
      });
    }
  
    onFilterChange(filtered);
  };
  
  const clearFilters = () => {
    setSelectedFilters({
      businessTypes: [],
      industrySectors: [],
      sortOption: '',
    });
    setSearchTerm('');
    onFilterChange(users);
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <SearchNormal className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search users, business types, or sectors..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <button
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-full flex items-center"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={20} className="mr-2" />
          Filters
        </button>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Business Types</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {businessTypes.map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedFilters.businessTypes.includes(type)}
                    onChange={() => toggleFilter('businessTypes', type)}
                  />
                  <span className="ml-2">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Industry Sectors</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {industrySectors.map(sector => (
                <label key={sector} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox"
                    checked={selectedFilters.industrySectors.includes(sector)}
                    onChange={() => toggleFilter('industrySectors', sector)}
                  />
                  <span className="ml-2">{sector}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Sort By</h3>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedFilters.sortOption}
              onChange={(e) => toggleFilter('sortOption', e.target.value)}
            >
              <option value="">Default</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>
      )}

      {(selectedFilters.businessTypes.length > 0 || selectedFilters.industrySectors.length > 0 || selectedFilters.sortOption) && (
        <div className="mt-4 flex flex-wrap items-center">
          <span className="mr-2 font-semibold">Applied Filters:</span>
          {selectedFilters.businessTypes.map(type => (
            <span key={type} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
              {type}
              <button className="ml-1" onClick={() => toggleFilter('businessTypes', type)}>×</button>
            </span>
          ))}
          {selectedFilters.industrySectors.map(sector => (
            <span key={sector} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
              {sector}
              <button className="ml-1" onClick={() => toggleFilter('industrySectors', sector)}>×</button>
            </span>
          ))}
          {selectedFilters.sortOption && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
              Sort: {selectedFilters.sortOption}
              <button className="ml-1" onClick={() => toggleFilter('sortOption', '')}>×</button>
            </span>
          )}
          <button
            className="text-red-600 underline text-sm"
            onClick={clearFilters}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSystem;
