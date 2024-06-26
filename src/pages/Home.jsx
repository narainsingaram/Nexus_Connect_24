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
                        label='Admin Mode'
                        checked={adminMode}
                        onChange={handleAdminModeChange}
                    />
                    {adminMode && (
                        <div style={{ marginTop: '10px' }}>
                            <Dropdown
                                className="!bg-blue-500"
                                placeholder='Select admin...'
                                fluid
                                selection
                                options={admins.map(admin => ({ key: admin.name, text: admin.name, value: admin.name }))}
                                onChange={handleAdminSelectChange}
                                value={selectedAdmin}
                            />
                            <Input
                                placeholder='Enter secret code...'
                                fluid
                                type='password'
                                value={secretCode}
                                onChange={handleSecretCodeChange}
                            />
                            <Button
                                color='blue'
                                className='!mt-4 !bg-blue-500 !hover:bg-blue-600 !text-white !font-bold'
                                onClick={() => {
                                    if (isAdminModeValid()) {
                                        handleSuccessAlert();
                                    } else {
                                        alert('Invalid admin credentials.');
                                    }
                                }}
                            >
                                Submit
                            </Button>
                        </div>
                    )}
                    <Input
                        icon='search'
                        placeholder='Search...'
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    Actions:
                    <Button
                        style={{ marginLeft: '10px' }}
                        onClick={exportData}
                    >
                        Export
                    </Button>
                    <Button
                        style={{ marginLeft: '10px' }}
                        onClick={generatePDF}
                    >
                        Generate PDF
                    </Button>
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
                                <Card>
                                    <Card.Content>
                                        <Image className="rounded-xl" src={item.img} alt="Image" width="250" preview />
                                        <h2>{item.name} </h2>
                                        Business Type: {item.businessType}
                                        <Card.Description>{item.info}</Card.Description>
                                        <Card.Meta style={{ marginTop: "10px" }}>
                                            Industry Sector: {item.industrySector}
                                            <br />
                                            Organization Size: {item.organizationSize}
                                            <br />
                                            Timestamp: {item.timestamp}
                                            <br />
                                            Tags: {item.tags.map((tag, index) => (
                                                <Chip key={index} label={tag} />
                                            ))}
                                        </Card.Meta>
                                    </Card.Content>
                                    <Card.Content extra>
                                        <div>
                                            <Button label="View"
                                                onClick={() => handleModal(item)}
                                                loading={loading}></Button>
                                            {adminMode && isAdminModeValid() && (
                                                <Button
                                                    color="green"
                                                    onClick={() => navigate(`/update/${item.id}`)}
                                                >
                                                    <Edit size="16" variant="Bulk" color="#fff" /> Update
                                                </Button>
                                            )}
                                            {adminMode && isAdminModeValid() && (
                                                <Button
                                                    color="red"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Delete
                                                </Button>
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
            </Container>
        </div>
    );
};

export default Home;
