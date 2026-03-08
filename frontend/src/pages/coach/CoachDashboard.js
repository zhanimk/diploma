import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoachDashboard = () => {
    const [students, setStudents] = useState([]);
    const [allAthletes, setAllAthletes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const studentsRes = await axios.get('/api/users/coach/students');
                setStudents(studentsRes.data);

                const allAthletesRes = await axios.get('/api/users?role=athlete');
                setAllAthletes(allAthletesRes.data);

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSendRequest = async (athleteId) => {
        try {
            await axios.post('/api/users/coach/request', { athleteId });
            alert('Request sent successfully');
        } catch (error) {
            console.error('Failed to send request', error);
            alert('Failed to send request');
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            await axios.delete('/api/users/coach/remove-student', { data: { studentId } });
            // Refresh the data
            window.location.reload();
        } catch (error) {
            console.error('Failed to remove student', error);
        }
    };

    const filteredAthletes = allAthletes.filter(athlete =>
        athlete.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Coach Dashboard</h2>
            
            <div>
                <h3>Your Students</h3>
                {students.length > 0 ? (
                    <ul>
                        {students.map(student => (
                            <li key={student._id}>
                                <p>{student.firstName} {student.lastName}</p>
                                <button onClick={() => handleRemoveStudent(student._id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>You have no students.</p>
                )}
            </div>

            <div>
                <h3>Find Athletes</h3>
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                {searchTerm && (
                    <ul>
                        {filteredAthletes.map(athlete => (
                            <li key={athlete._id}>
                                <p>{athlete.firstName} {athlete.lastName}</p>
                                <button onClick={() => handleSendRequest(athlete._id)}>Send Request</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CoachDashboard;
