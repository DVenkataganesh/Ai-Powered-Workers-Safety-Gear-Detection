import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Dashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = ({ setIsAuthenticated }) => {
    const [violations, setViolations] = useState([]);
    const [filteredViolations, setFilteredViolations] = useState([]);
    const [filter, setFilter] = useState('All');
    const [userProfile, setUserProfile] = useState({ email: '', role: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchViolations = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:7755/api/violations', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setViolations(data);
                    setFilteredViolations(data);
                } else {
                    console.error('Failed to fetch violations');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:7755/api/user/profile', {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserProfile(data);
                } else {
                    console.error('Failed to fetch user profile');
                }
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchViolations();
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const now = new Date();
        let filtered = violations;

        if (filter === 'Today') {
            filtered = violations.filter(v => new Date(v.timestamp).toDateString() === now.toDateString());
        } else if (filter === 'Yesterday') {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            filtered = violations.filter(v => new Date(v.timestamp).toDateString() === yesterday.toDateString());
        } else if (filter === 'Monthly') {
            filtered = violations.filter(v => {
                const violationDate = new Date(v.timestamp);
                return violationDate.getMonth() === now.getMonth() && violationDate.getFullYear() === now.getFullYear();
            });
        }

        setFilteredViolations(filtered);
    }, [filter, violations]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    const chartData = filteredViolations.reduce((acc, { camera_location }) => {
        acc[camera_location] = (acc[camera_location] || 0) + 1;
        return acc;
    }, {});

    const barChartData = Object.keys(chartData).map(location => ({
        location,
        count: chartData[location],
    }));

    const complianceData = [
        { name: 'Compliant', value: violations.length - filteredViolations.length },
        { name: 'Non-Compliant', value: filteredViolations.length },
    ];

    return (
        <div className='dashboard'>
            <Sidebar />
            <div className='main-content'>
                <Header onLogout={handleLogout} />
                <h1>Worker Safety Gear Detection Dashboard</h1>

                {/* User profile section */}
                <div className="profile-info">
                    <p><strong>Role:</strong> {userProfile.role}</p>
                    <p><strong>Email:</strong> {userProfile.email}</p>
                </div>

                <div className='dashboard-content'>
                    <h2>Violation Statistics</h2>
                    <select className='filter-dropdown' value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value='All'>All</option>
                        <option value='Today'>Today</option>
                        <option value='Yesterday'>Yesterday</option>
                        <option value='Monthly'>Monthly</option>
                    </select>

                    <ResponsiveContainer width='90%' height={400}>
                        <BarChart data={barChartData}>
                            <CartesianGrid strokeDasharray='3 3' />
                            <XAxis dataKey='location' />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey='count' fill='#8884d8' />
                        </BarChart>
                    </ResponsiveContainer>

                    <h2>Compliance Overview</h2>
                    <ResponsiveContainer width='50%' height={300}>
                        <PieChart>
                            <Pie
                                data={complianceData}
                                dataKey='value'
                                nameKey='name'
                                cx='50%'
                                cy='50%'
                                outerRadius={80}
                                fill='#82ca9d'
                                label
                            >
                                {complianceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>

                    <button className='btn btn-primary mt-3' onClick={() => navigate('/violations')}>
                        View Detailed Violations
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
