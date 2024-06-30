import React, { useState, useEffect } from 'react';
import { db } from "../firebase";
import { collection, getDocs } from 'firebase/firestore';
import { CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registering necessary components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Graph = () => {
    const [userData, setUserData] = useState({
        businessTypes: {},
        industrySectors: {},
        organizationSizes: {},
        registrationDates: {}
    });

    useEffect(() => {
        const fetchData = async () => {
            const usersCollection = collection(db, "users");
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => doc.data());

            const businessTypes = {};
            const industrySectors = {};
            const organizationSizes = {};
            const registrationDates = {};

            userList.forEach(user => {
                businessTypes[user.businessType] = (businessTypes[user.businessType] || 0) + 1;
                industrySectors[user.industrySector] = (industrySectors[user.industrySector] || 0) + 1;
                const sizeRange = getSizeRange(user.organizationSize);
                organizationSizes[sizeRange] = (organizationSizes[sizeRange] || 0) + 1;

                const date = new Date(user.timestamp);
                const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                registrationDates[monthYear] = (registrationDates[monthYear] || 0) + 1;
            });

            setUserData({ businessTypes, industrySectors, organizationSizes, registrationDates });
        };

        fetchData();
    }, []);

    const getSizeRange = (size) => {
        if (size < 10) return '1-9';
        if (size < 50) return '10-49';
        if (size < 250) return '50-249';
        return '250+';
    };

    const businessTypeData = {
        labels: Object.keys(userData.businessTypes),
        datasets: [{
            label: 'Business Types',
            data: Object.values(userData.businessTypes),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const industrySectorData = {
        labels: Object.keys(userData.industrySectors),
        datasets: [{
            label: 'Industry Sectors',
            data: Object.values(userData.industrySectors),
            backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1
        }]
    };

    const organizationSizeData = {
        labels: Object.keys(userData.organizationSizes),
        datasets: [{
            label: 'Organization Sizes',
            data: Object.values(userData.organizationSizes),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
        }]
    };

    const registrationData = {
        labels: Object.keys(userData.registrationDates),
        datasets: [{
            label: 'User Registrations',
            data: Object.values(userData.registrationDates),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Data Visualization Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-center">Business Types</h2>
                    <Bar data={businessTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>

                <div className="bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-center">Industry Sectors</h2>
                    <Pie data={industrySectorData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>

                <div className="bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-center">Organization Sizes</h2>
                    <Doughnut data={organizationSizeData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>

                <div className="bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-center">User Registrations Over Time</h2>
                    <Line data={registrationData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>
        </div>
    );
};

export default Graph;
