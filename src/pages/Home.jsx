import React, { useEffect, useState, useMemo } from 'react';
import { db } from "../firebase";
import { Card, Grid, Container, Input, Checkbox, Dropdown, Button } from 'semantic-ui-react';
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import ModalComp from '../components/ModalComp';
import Spinner from '../components/Spinner';
import { Image } from 'primereact/image';
import { Code } from "@nextui-org/react";
import { Chip } from 'primereact/chip';
import { Edit, SearchNormal } from 'iconsax-react';
import jsPDF from 'jspdf';
import 'flowbite';
import autoTable from 'jspdf-autotable';
import Cookies from 'js-cookie';



import { useTable, useGlobalFilter, useFilters, useSortBy } from 'react-table';

const admins = [
    { name: 'Admin 1', code: 'admin1code' },
    { name: 'Admin 2', code: 'admin2code' },
    // Add more admins as needed
];

const Home = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [adminMode, setAdminMode] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const [businessTypes, setBusinessTypes] = useState([]);
    const [selectedBusinessTypes, setSelectedBusinessTypes] = useState([]);
    const [industrySectors, setIndustrySectors] = useState([]);
    const [selectedIndustrySectors, setSelectedIndustrySectors] = useState([]);
    const [sortOption, setSortOption] = useState('');
    const [selectedFields, setSelectedFields] = useState([]);
    const [tableView, setTableView] = useState(false); // Added state for view toggle
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const isAdminModeCookie = getCookie('adminMode') === 'true';
        const selectedAdminCookie = getCookie('selectedAdmin') || '';
        const secretCodeCookie = getCookie('secretCode') || '';
    
        setAdminMode(isAdminModeCookie);
        setSelectedAdmin(selectedAdminCookie);
        setSecretCode(secretCodeCookie);
    
        if (isAdminModeCookie && selectedAdminCookie && secretCodeCookie) {
            validateAdminMode(selectedAdminCookie, secretCodeCookie);
        }
    }, []);

    const setCookie = (name, value, days = 7) => {
        Cookies.set(name, value, { expires: days });
    };
    
    const getCookie = (name) => {
        return Cookies.get(name);
    };
    
    const removeCookie = (name) => {
        Cookies.remove(name);
    };

    useEffect(() => {
        setLoading(true);
        const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
            let list = [];
            let businessTypesSet = new Set();
            let industrySectorsSet = new Set();
            snapshot.docs.forEach((doc) => {
                const userData = { id: doc.id, ...doc.data() };
                userData.tags = userData.tags ? userData.tags.split(',').map(tag => tag.trim()) : [];
                userData.timestamp = userData.timestamp.toDate().toLocaleString(); // Convert Firestore timestamp to JavaScript Date object
                businessTypesSet.add(userData.businessType);
                industrySectorsSet.add(userData.industrySector);
                list.push(userData);
            });
            setUsers(list);
            setFilteredUsers(list);
            setBusinessTypes([...businessTypesSet]);
            setIndustrySectors([...industrySectorsSet]);
            setLoading(false);
        }, (error) => {
            console.log(error);
        });

        return () => {
            unsub();
        };
    }, []);

    const handleModal = (item) => {
        setOpen(true);
        setUser(item);
    };

    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.lang = 'en-US';
      
          recognition.onstart = () => {
            setIsListening(true);
          };
      
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchTerm(transcript);
            handleSearchChange({ target: { value: transcript } });
          };
      
          recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
          };
      
          recognition.onend = () => {
            setIsListening(false);
          };
      
          recognition.start();
        } else {
          alert('Speech recognition is not supported in your browser.');
        }
      };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure to delete this user?")) {
            try {
                setOpen(false);
                await deleteDoc(doc(db, "users", id));
                setUsers(users.filter((user) => user.id !== id));
                setFilteredUsers(filteredUsers.filter((user) => user.id !== id));
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleAdminModeChange = (event, data) => {
        const isChecked = data.checked;
        setAdminMode(isChecked);
        setSelectedAdmin('');
        setSecretCode('');
        if (isChecked) {
            setCookie('adminMode', 'true');
        } else {
            removeCookie('adminMode');
            removeCookie('selectedAdmin');
            removeCookie('secretCode');
        }
    };

    const handleAdminSelectChange = (event, data) => {
        const selectedAdminValue = data.value;
        setSelectedAdmin(selectedAdminValue);
        setCookie('selectedAdmin', selectedAdminValue);
    };

    const handleSecretCodeChange = (event) => {
        const secretCodeValue = event.target.value;
        setSecretCode(secretCodeValue);
        setCookie('secretCode', secretCodeValue);
    };

    const validateAdminMode = (adminName, code) => {
        const admin = admins.find(admin => admin.name === adminName);
        return admin && admin.code === code;
    };

    const isAdminModeValid = () => {
        return validateAdminMode(selectedAdmin, secretCode);
    };

    const handleSuccessAlert = () => {
        alert('Success! You are now in admin mode.');
    };

    const handleSearchChange = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchTerm(searchTerm);
        
        // Update autocomplete suggestions
        const suggestions = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.businessType.toLowerCase().includes(searchTerm)
        ).slice(0, 5); // Limit to 5 suggestions
        setAutocompleteSuggestions(suggestions);
        
        filterUsers(searchTerm, selectedBusinessTypes, selectedIndustrySectors, sortOption);
    };

    const handleBusinessTypeChange = (event, data) => {
        const selectedTypes = data.value;
        setSelectedBusinessTypes(selectedTypes);
        filterUsers(searchTerm, selectedTypes, selectedIndustrySectors, sortOption);
    };

    const handleIndustrySectorChange = (event, data) => {
        const selectedSectors = data.value;
        setSelectedIndustrySectors(selectedSectors);
        filterUsers(searchTerm, selectedBusinessTypes, selectedSectors, sortOption);
    };

    const handleSortChange = (event, data) => {
        // Check if data is defined and has a value property
        const selectedSortOption = data && data.value ? data.value : event.target.value;
        
        setSortOption(selectedSortOption);
        filterUsers(searchTerm, selectedBusinessTypes, selectedIndustrySectors, selectedSortOption);
    };    

    const filterUsers = (searchTerm, selectedBusinessTypes, selectedIndustrySectors, sortOption) => {
        let filtered = users.filter(user => {
            const matchesSearchTerm = user.name.toLowerCase().includes(searchTerm) ||
                user.info.toLowerCase().includes(searchTerm) ||
                user.tags.some(tag => tag.toLowerCase().includes(searchTerm));

            const matchesBusinessType = selectedBusinessTypes.length === 0 || selectedBusinessTypes.includes(user.businessType);

            const matchesIndustrySector = selectedIndustrySectors.length === 0 || selectedIndustrySectors.includes(user.industrySector);

            return matchesSearchTerm && matchesBusinessType && matchesIndustrySector;
        });

        switch (sortOption) {
            case 'organizationSizeAsc':
                filtered.sort((a, b) => a.organizationSize - b.organizationSize);
                break;
            case 'organizationSizeDesc':
                filtered.sort((a, b) => b.organizationSize - a.organizationSize);
                break;
            case 'timestampAsc':
                filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                break;
            case 'timestampDesc':
                filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                break;
            case 'nameAsc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        setFilteredUsers(filtered);
    };

    const exportData = () => {
        const exportData = filteredUsers.map(user => ({
            Name: user.name,
            BusinessType: user.businessType,
            Info: user.info,
            IndustrySector: user.industrySector,
            OrganizationSize: user.organizationSize,
            Timestamp: user.timestamp,
            Tags: user.tags.join(', ')
        }));

        const jsonExport = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonExport], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const tableColumn = selectedFields.length > 0 ? selectedFields : ["Name", "BusinessType", "Info", "IndustrySector", "OrganizationSize", "Timestamp", "Tags"];
        const tableRows = [];

        filteredUsers.forEach(user => {
            const userData = tableColumn.map(field => user[field]);
            tableRows.push(userData);
        });

        autoTable(doc, { head: [tableColumn], body: tableRows });
        doc.save("report.pdf");
    };

    const columns = useMemo(
        () => [
            { Header: 'Name', accessor: 'name' },
            { Header: 'Business Type', accessor: 'businessType' },
            { Header: 'Info', accessor: 'info' },
            { Header: 'Industry Sector', accessor: 'industrySector' },
            { Header: 'Organization Size', accessor: 'organizationSize' },
            { Header: 'Timestamp', accessor: 'timestamp' },
            { Header: 'Tags', accessor: 'tags' }
        ],
        []
    );

    const data = useMemo(() => filteredUsers, [filteredUsers]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter
    } = useTable({ columns, data }, useGlobalFilter, useFilters, useSortBy);

    if (loading) {
        return <Spinner />;
    }
    

    return (
        <>
            <div className='ml-64 p-4'>
            <div className='' style={{ marginBottom: '20px' }}>
        <button 
            className={`btn ${adminMode ? 'btn-success' : 'btn-error'}`} 
            onClick={()=>document.getElementById('admin_modal').showModal()}
        >
            Admin Mode: {adminMode ? 'Active' : 'Inactive'}
        </button>
        
        <dialog id="admin_modal" className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Admin Mode Settings</h3>
                <div className='mb-6 mt-2'>
                    <Dropdown
                        className="dropdown rounded-full mb-2"
                        placeholder='Select admin...'
                        selection
                        options={admins.map(admin => ({ key: admin.name, text: admin.name, value: admin.name }))}
                        onChange={handleAdminSelectChange}
                        value={selectedAdmin}
                    />
                    <input
                        className='input input-bordered bg-white w-full mb-2'
                        placeholder='Enter secret code...'
                        type='password'
                        value={secretCode}
                        onChange={handleSecretCodeChange}
                    />
                <button
                    className='btn btn-primary w-full'
                    onClick={() => {
                        if (isAdminModeValid()) {
                            setAdminMode(true);
                            setCookie('adminMode', 'true');
                            handleSuccessAlert();
                            document.getElementById('admin_modal').close();
                        } else {
                            alert('Invalid admin credentials.');
                        }
                    }}
                >
                    Activate Admin Mode
                </button>
                </div>
                <div className="modal-action">
                    <form method="dialog">
                    <button className="btn" onClick={() => {
    setAdminMode(false);
    removeCookie('adminMode');
    removeCookie('selectedAdmin');
    removeCookie('secretCode');
}}>Close & Deactivate Admin Mode</button>
                    </form>
                </div>
            </div>
        </dialog>
                    <br></br>
                    <h1 className='text-4xl text-center'>NexusConnect</h1> <br></br>

                    <div className="flex justify-center items-center w-full pb-3 relative">
  <div className="flex items-center w-9/12 max-w-md bg-gray-100 border-transparent rounded-xl text-lg transition-transform duration-300 transform hover:translate-y-0.5">
    <SearchNormal size="24" color="#3b82f6" variant="Bulk" className="ml-4"/>
    <input
      placeholder="Search..." 
      className="w-full py-4 px-5 bg-transparent border-none focus:outline-none" 
      value={searchTerm} 
      onChange={handleSearchChange} 
    />
    <button
      onClick={handleVoiceSearch}
      className={`p-2 rounded-full mr-2 focus:outline-none ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white`}
    >
      {isListening ? (
        <span className="animate-pulse">●</span>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  </div>
  {autocompleteSuggestions.length > 0 && (
    <div className="absolute z-10 w-full max-w-md mt-1 bg-white rounded-md shadow-lg top-full">
      {autocompleteSuggestions.map((suggestion, index) => (
        <div 
          key={index} 
          className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setSearchTerm(suggestion.name);
            setAutocompleteSuggestions([]);
            filterUsers(suggestion.name, selectedBusinessTypes, selectedIndustrySectors, sortOption);
          }}
        >
          <img src={suggestion.img} alt={suggestion.name} className="w-10 h-10 rounded-full mr-3" />
          <div>
            <div className="font-semibold">{suggestion.name}</div>
            <div className="text-sm text-gray-500">{suggestion.businessType}</div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
    <div className="relative">
        <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
        <select
            id="businessType"
            multiple
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={(e) => handleBusinessTypeChange(e, { value: Array.from(e.target.selectedOptions, option => option.value) })}
            value={selectedBusinessTypes}
        >
            {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
            ))}
        </select>
    </div>

    <div className="relative">
        <label htmlFor="industrySector" className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
        <select
            id="industrySector"
            multiple
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={(e) => handleIndustrySectorChange(e, { value: Array.from(e.target.selectedOptions, option => option.value) })}
            value={selectedIndustrySectors}
        >
            {industrySectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
            ))}
        </select>
    </div>

    <div className="relative">
        <label htmlFor="sortOption" className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
        <select
            id="sortOption"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleSortChange}
            value={sortOption}
        >
            <option value="">Default</option>
            <option value="organizationSizeAsc">Organization Size (Ascending)</option>
            <option value="organizationSizeDesc">Organization Size (Descending)</option>
            <option value="timestampDesc">Most Recent</option>
            <option value="timestampAsc">Oldest</option>
            <option value="nameAsc">Name (A-Z)</option>
            <option value="nameDesc">Name (Z-A)</option>
        </select>
    </div>
</div>

<div className="mt-6">
    <label htmlFor="reportFields" className="block text-sm font-medium text-gray-700 mb-1">Select fields for report</label>
    <select
        id="reportFields"
        multiple
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        onChange={(e) => setSelectedFields(Array.from(e.target.selectedOptions, option => option.value))}
        value={selectedFields}
    >
        <option value="name">Name</option>
        <option value="businessType">Business Type</option>
        <option value="info">Info</option>
        <option value="industrySector">Industry Sector</option>
        <option value="organizationSize">Organization Size</option>
        <option value="timestamp">Timestamp</option>
        <option value="tags">Tags</option>
    </select>
</div>

<div className="mt-6 space-x-4">
    <button
        onClick={generatePDF}
        className="btn btn-primary"
    >
        Generate PDF
    </button>
    <button
        onClick={exportData}
        className="btn btn-warning"
    >
        Export as JSON
    </button>
</div>

                                
            <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                    onClick={() => setTableView(false)}
                    className={`py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border ${!tableView ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-200'} hover:bg-blue-700 hover:text-white transition-all`}
                >
                    Card View
                </button>
                <button
                    onClick={() => setTableView(true)}
                    className={`py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border ${tableView ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border-gray-200'} hover:bg-blue-700 hover:text-white transition-all`}
                >
                    Table View
                </button>
            </div>
                    <br />
                </div>
                {tableView ? (
                    <table {...getTableProps()} style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ border: '1px solid black', padding: '10px' }}>
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()} style={{ border: '1px solid black', padding: '10px' }}>
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 m-8 rounded-2xl'>
  {filteredUsers.map((item) => (
    <div key={item.id}>
      <section className="max-w-sm rounded-2xl overflow-hidden shadow-lg">
        <img className="w-full h-56" src={item.img} alt="Sunset in the mountains" />
        <div className="px-6 py-4 max-h-60 max-w-lg overflow-y-auto">
          <span className='inline-block text-red-600'>{item.businessType}</span>
          <div className="font-bold text-xl mb-2">{item.name}</div>
          <p className="text-gray-700">
            {item.info}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Industry Sector:</span> {item.industrySector}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Organization Size:</span> {item.organizationSize}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Timestamp:</span> {item.timestamp}
          </p>
        </div>
        <div className="px-6 pt-4 pb-2">
          {item.tags.map((tag, index) => (
            <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex border-t border-gray-200 divide-x divide-gray-200 dark:border-neutral-700 dark:divide-neutral-700">
          <span className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-es-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" onClick={() => handleModal(item)} loading={loading} href="#">
            View
          </span>
          {adminMode && isAdminModeValid() && (
            <>
              <span className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" onClick={() => navigate(`/update/${item.id}`)} href="#">
                Update
              </span>
              <span className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-ee-xl bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" onClick={() => handleDelete(item.id)} href="#">
                Delete
              </span>
            </>
          )}
        </div>
        {open && (
          <ModalComp open={open} setOpen={setOpen} handleDelete={handleDelete} {...user} />
        )}
      </section>
    </div>
  ))}
</div>

                    
                )}

            </div>
<div data-dial-init class="fixed end-6 bottom-6 group">
    <div id="speed-dial-menu-default" class="flex flex-col items-center hidden mb-4 space-y-2">
        <button type="button" data-tooltip-target="tooltip-share" data-tooltip-placement="left" class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18">
                <path d="M14.419 10.581a3.564 3.564 0 0 0-2.574 1.1l-4.756-2.49a3.54 3.54 0 0 0 .072-.71 3.55 3.55 0 0 0-.043-.428L11.67 6.1a3.56 3.56 0 1 0-.831-2.265c.006.143.02.286.043.428L6.33 6.218a3.573 3.573 0 1 0-.175 4.743l4.756 2.491a3.58 3.58 0 1 0 3.508-2.871Z"/>
            </svg>
            <span class="sr-only">Share</span>
        </button>
        <div id="tooltip-share" role="tooltip" class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
            Share
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
    </div>
    <button type="button" data-dial-toggle="speed-dial-menu-default" aria-controls="speed-dial-menu-default" aria-expanded="false" class="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
        <svg class="w-5 h-5 transition-transform group-hover:rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16"/>
        </svg>
        <span class="sr-only">Open actions menu</span>
    </button>
</div>


        </>
    );
};

export default Home;



<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
