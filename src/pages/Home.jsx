import React, { useEffect, useState } from 'react';
import { db } from "../firebase";
import {Card, Grid, Container, Input, Checkbox, Dropdown } from 'semantic-ui-react';
import { Button } from 'primereact/button';
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import ModalComp from '../components/ModalComp';
import Spinner from '../components/Spinner'
import "primereact/resources/themes/lara-light-indigo/theme.css";
import { AutoComplete } from 'primereact/autocomplete';
import { Image } from 'primereact/image';
import {Code} from "@nextui-org/react";
import { Chip } from 'primereact/chip';
import 'primeicons/primeicons.css';
import { Edit } from 'iconsax-react';


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
                userData.timestamp = userData.timestamp.toDate(); // Convert Firestore timestamp to JavaScript Date object
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
                filtered.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'timestampDesc':
                filtered.sort((a, b) => b.timestamp - a.timestamp);
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
        // Prepare data for export
        const exportData = filteredUsers.map(user => ({
            Name: user.name,
            BusinessType: user.businessType,
            Info: user.info,
            IndustrySector: user.industrySector,
            OrganizationSize: user.organizationSize,
            Timestamp: new Date(user.timestamp).toLocaleString(),
            Tags: user.tags.join(', ')
        }));

        // Convert to JSON string
        const jsonExport = JSON.stringify(exportData, null, 2);

        // Create a Blob object for the JSON data
        const blob = new Blob([jsonExport], { type: 'application/json' });

        // Create URL for the Blob object
        const url = URL.createObjectURL(blob);

        // Create a temporary <a> element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported_data.json';
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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
                    <br></br>
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
                </div>
                <Grid columns={3} stackable>
                    {filteredUsers.map((item) => (
                        <Grid.Column key={item.id}>
                            <Card>
                                <Card.Content>
                                    <Image src={item.img} alt="Image" width="250" style={{
                                            borderRadius: "20px",
                                        }} preview />
                                        <h2>{item.name} </h2>
                                        Business Type: {item.businessType}
                                    <Card.Description>{item.info}</Card.Description>
                                    <Card.Meta style={{ marginTop: "10px" }}>
                                        Industry Sector: {item.industrySector}
                                        <br />
                                        Organization Size: {item.organizationSize}
                                        <br />
                                        Timestamp: {new Date(item.timestamp).toLocaleString()}
                                        <br />
                                        Tags: {item.tags.map((tag, index) => (
                                            <Chip label={tag} />
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
                                                <Edit size="16" variant="Bulk" color="#fff"/> Update
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
            </Container>
        </div>
    );
};

export default Home;
