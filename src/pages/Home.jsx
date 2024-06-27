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
import 'primeicons/primeicons.css';
import { Edit } from 'iconsax-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'flowbite';


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
    const navigate = useNavigate();

    useEffect(() => {
        const isAdminModeLocalStorage = localStorage.getItem('adminMode') === 'true';
        const selectedAdminLocalStorage = localStorage.getItem('selectedAdmin') || '';
        const secretCodeLocalStorage = localStorage.getItem('secretCode') || '';

        setAdminMode(isAdminModeLocalStorage);
        setSelectedAdmin(selectedAdminLocalStorage);
        setSecretCode(secretCodeLocalStorage);

        if (isAdminModeLocalStorage && selectedAdminLocalStorage && secretCodeLocalStorage) {
            validateAdminMode(selectedAdminLocalStorage, secretCodeLocalStorage);
        }
    }, []);

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
        localStorage.setItem('adminMode', isChecked);
    };

    const handleAdminSelectChange = (event, data) => {
        const selectedAdminValue = data.value;
        setSelectedAdmin(selectedAdminValue);
        localStorage.setItem('selectedAdmin', selectedAdminValue);
    };

    const handleSecretCodeChange = (event) => {
        const secretCodeValue = event.target.value;
        setSecretCode(secretCodeValue);
        localStorage.setItem('secretCode', secretCodeValue);
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
        const selectedSortOption = data.value;
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
        <div className='bg-gradient-to-br from-yellow-200 via-emerald-300 to-emerald-300'>
            <Container>
                <div style={{ marginBottom: '20px' }}>
                    <Checkbox
                        className='!p-4 !bg-slate-100 !rounded-3xl !mt-4 !font-bold'
                        label='Admin Mode'
                        checked={adminMode}
                        onChange={handleAdminModeChange}
                    />
                    <br></br>
                    {adminMode && (
                        <div className='' style={{ marginTop: '10px' }}>
                            <Dropdown
                                className="!py-3 !px-4 !inline-flex !items-center !gap-x-2 !text-sm !font-medium !rounded-lg !border !border-gray-200 !bg-white !text-gray-800 !shadow-sm !hover:bg-gray-50 !mb-8"
                                placeholder='Select admin...'
                                selection
                                options={admins.map(admin => ({ key: admin.name, text: admin.name, value: admin.name }))}
                                onChange={handleAdminSelectChange}
                                value={selectedAdmin}
                            />
                            <Input
                                placeholder='Enter secret code...'
                                type='password'
                                value={secretCode}
                                onChange={handleSecretCodeChange}
                            />
                            <Button
                                color='blue'
                                className='!mt-4 !bg-blue-500 !ml-2 !rounded-full !hover:bg-blue-600 !text-white !font-bold'
                                onClick={() => {
                                    if (isAdminModeValid()) {
                                        handleSuccessAlert();
                                    } else {
                                        alert('Invalid admin credentials.');
                                    }
                                }}
                            >
                                ->
                            </Button>
                        </div>
                    )}
                    <Input
                        className=''
                        placeholder='Search...'
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <input placeholder='Search...' className='input py-3 px-4 block w-full bg-gray-100 border-transparent rounded-xl text-sm dark:border-transparent dark:text-gray-400 dark:focus:ring-gray-600 transition-transform duration-300 transform hover:translate-y-0.5' value={searchTerm} onChange={handleSearchChange}></input>
                    <br></br>
                    Actions:
                    <button className='py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none' onClick={exportData}>
                        Export
                    </button>
                    <button
                        style={{ marginLeft: '10px' }}
                        onClick={generatePDF}
                        className='py-3 px-4 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none'
                    >
                        Generate PDF
                    </button>
                    <br></br>
                    View:
                    <Button
                        style={{ marginLeft: '10px' }}
                        onClick={() => setTableView(!tableView)}
                    >
                        {tableView ? 'Card View' : 'Table View'}
                    </Button>
                    <br />
                    <Dropdown
                        placeholder='Filter by business type...'
                        multiple
                        selection
                        options={businessTypes.map(type => ({ key: type, text: type, value: type }))}
                        onChange={handleBusinessTypeChange}
                        value={selectedBusinessTypes}
                        style={{ marginTop: '10px' }}
                    />
                    <Dropdown
                        placeholder='Filter by industry sector...'
                        multiple
                        selection
                        options={industrySectors.map(sector => ({ key: sector, text: sector, value: sector }))}
                        onChange={handleIndustrySectorChange}
                        value={selectedIndustrySectors}
                        style={{ marginTop: '10px' }}
                    />
                    <Dropdown
                        placeholder='Sort by...'
                        selection
                        options={[
                            { key: 'organizationSizeAsc', text: 'Organization Size (Ascending)', value: 'organizationSizeAsc' },
                            { key: 'organizationSizeDesc', text: 'Organization Size (Descending)', value: 'organizationSizeDesc' },
                            { key: 'timestampAsc', text: 'Most Recent', value: 'timestampDesc' },
                            { key: 'timestampDesc', text: 'Oldest', value: 'timestampAsc' },
                            { key: 'nameAsc', text: 'Name (A-Z)', value: 'nameAsc' },
                            { key: 'nameDesc', text: 'Name (Z-A)', value: 'nameDesc' }
                        ]}
                        onChange={handleSortChange}
                        value={sortOption}
                        style={{ marginTop: '10px' }}
                    />
                    <Dropdown
                        placeholder='Select fields for report...'
                        multiple
                        selection
                        options={[
                            { key: 'name', text: 'Name', value: 'name' },
                            { key: 'businessType', text: 'Business Type', value: 'businessType' },
                            { key: 'info', text: 'Info', value: 'info' },
                            { key: 'industrySector', text: 'Industry Sector', value: 'industrySector' },
                            { key: 'organizationSize', text: 'Organization Size', value: 'organizationSize' },
                            { key: 'timestamp', text: 'Timestamp', value: 'timestamp' },
                            { key: 'tags', text: 'Tags', value: 'tags' }
                        ]}
                        onChange={(e, { value }) => setSelectedFields(value)}
                        value={selectedFields}
                        style={{ marginTop: '10px' }}
                    />
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
                    <Grid columns={3} stackable>
                        {filteredUsers.map((item) => (
                            <Grid.Column key={item.id}>
                                <Card className="!group !flex !flex-col !h-full !bg-slate-50 !border-4 !border-black-200 !shadow-sm !rounded-xl !transition !duration-300 !ease-in-out !transform !hover:shadow-lg !w-80 !relative !rounded-t-xl !overflow-hidden">
                                    <Card.Content>
                                        <Image className="rounded-xl" src={item.img} alt="Image" width="250" preview />
                                        <h2>{item.name} </h2>
                                        <Card.Description>{item.info}</Card.Description>
                                        <div class="!p-4 !md:p-6">
                                        Business Type: {item.businessType}
                                            <br />
                                        Industry Sector: {item.industrySector}
                                            <br />
                                            Organization Size: {item.organizationSize}
                                            <br />
                                            Timestamp: {item.timestamp}
                                            <br />
                                            Tags: {item.tags.map((tag, index) => (
                                                <Chip key={index} label={tag} />
                                            ))}
                                        </div>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div>
                                                <button onClick={() => handleModal(item)}
                                                loading={loading}>
                                                    View
                                                </button>
                                            {adminMode && isAdminModeValid() && (
                                                <button onClick={() => navigate(`/update/${item.id}`)}>
                                                    Update
                                                </button>
                                            )}
                                            {adminMode && isAdminModeValid() && (
                                                <button onClick={() => handleDelete(item.id)}>
                                                    Delete
                                                </button>
                                            )}
                                            {open && (
                                                <ModalComp
                                                    open={open}
                                                    setOpen={setOpen}
                                                    handleDelete={handleDelete}
                                                    {...user}
                                                />
                                            )}
                                        </div>
                                    </Card.Content>
                                    </Card>
                            </Grid.Column>
                        ))}
                    </Grid>
                )}


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
        <button type="button" data-tooltip-target="tooltip-print" data-tooltip-placement="left" class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 20h10a1 1 0 0 0 1-1v-5H4v5a1 1 0 0 0 1 1Z"/>
                <path d="M18 7H2a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2v-3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Zm-1-2V2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3h14Z"/>
            </svg>
            <span class="sr-only">Print</span>
        </button>
        <div id="tooltip-print" role="tooltip" class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
            Print
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button type="button" data-tooltip-target="tooltip-download" data-tooltip-placement="left" class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 shadow-sm dark:hover:text-white dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>
                <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
            </svg>
            <span class="sr-only">Download</span>
        </button>
        <div id="tooltip-download" role="tooltip" class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
            Download
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
        <button type="button" data-tooltip-target="tooltip-copy" data-tooltip-placement="left" class="flex justify-center items-center w-[52px] h-[52px] text-gray-500 hover:text-gray-900 bg-white rounded-full border border-gray-200 dark:border-gray-600 dark:hover:text-white shadow-sm dark:text-gray-400 hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 focus:outline-none dark:focus:ring-gray-400">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                <path d="M5 9V4.13a2.96 2.96 0 0 0-1.293.749L.879 7.707A2.96 2.96 0 0 0 .13 9H5Zm11.066-9H9.829a2.98 2.98 0 0 0-2.122.879L7 1.584A.987.987 0 0 0 6.766 2h4.3A3.972 3.972 0 0 1 15 6v10h1.066A1.97 1.97 0 0 0 18 14V2a1.97 1.97 0 0 0-1.934-2Z"/>
                <path d="M11.066 4H7v5a2 2 0 0 1-2 2H0v7a1.969 1.969 0 0 0 1.933 2h9.133A1.97 1.97 0 0 0 13 18V6a1.97 1.97 0 0 0-1.934-2Z"/>
            </svg>
            <span class="sr-only">Copy</span>
        </button>
        <div id="tooltip-copy" role="tooltip" class="absolute z-10 invisible inline-block w-auto px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
            Copy
            <div class="tooltip-arrow" data-popper-arrow></div>
        </div>
    </div>
    <button type="button" data-dial-toggle="speed-dial-menu-default" aria-controls="speed-dial-menu-default" aria-expanded="false" class="flex items-center justify-center text-white bg-blue-700 rounded-full w-14 h-14 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:focus:ring-blue-800">
        <svg class="w-5 h-5 transition-transform group-hover:rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 1v16M1 9h16"/>
        </svg>
        <span class="sr-only">Open actions menu</span>
    </button>
</div>

            </Container>
        </div>
    );
};

export default Home;


<script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>
