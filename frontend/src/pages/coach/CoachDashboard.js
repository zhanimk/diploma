import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import '../athlete/Dashboard.css'; // Используем те же стили

const CoachDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [requests, setRequests] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Параллельно запрашиваем и запросы, и список студентов
            const [requestsRes, studentsRes] = await Promise.all([
                axios.get('/api/users/coach/student-requests'),
                axios.get('/api/users/coach/students')
            ]);
            setRequests(requestsRes.data.filter(req => req.status === 'pending'));
            setStudents(studentsRes.data);
        } catch (error) {
            console.error('Failed to fetch coach data', error);
            toast.error('Панель деректерін жүктей алмады.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRespond = async (studentId, accept) => {
        const action = accept ? 'қабылдау' : 'қабылдамау';
        const promise = axios.put('/api/users/coach/respond-request', { studentId, accept })
            .then(res => {
                // После успешного ответа, обновляем данные на странице
                fetchData(); 
                return res.data.message;
            });

        toast.promise(promise, {
            loading: `Сұраныс ${action} өңделуде...`,
            success: (message) => <b>{message || `Сұраныс сәтті ${action}ындалды!`}</b>,
            error: (err) => <b>{err.response?.data?.message || 'Қате пайда болды.'}</b>,
        });
    };
    
    const handleRemoveStudent = async (studentId) => {
        if(window.confirm("Сіз шынымен осы оқушыны өшіргіңіз келе ме?")) {
            const promise = axios.put('/api/users/coach/remove-student', { studentId })
            .then(res => {
                fetchData();
                return res.data.message;
            });

            toast.promise(promise, {
                loading: 'Оқушыны жою...',
                success: (message) => <b>{message || 'Оқушы сәтті жойылды!'}</b>,
                error: (err) => <b>{err.response?.data?.message || 'Қате пайда болды.'}</b>,
            });
        }
    };

    if (loading) {
        return <div className="container">Жүктеу...</div>;
    }

    return (
        <div className="container">
            <h2>Жаттықтырушы панелі</h2>
            <div className="dashboard-grid">
                {/* Секция запросов */}
                <div className="card">
                    <h3>Кіріс сұраныстар</h3>
                    {requests.length > 0 ? (
                        requests.map(req => (
                            <div key={req._id} className="request-item">
                                <p>
                                    <strong>{req.student.firstName} {req.student.lastName}</strong> ({req.student.email}) сізге сұраныс жіберді.
                                </p>
                                <div>
                                    <button onClick={() => handleRespond(req.student._id, true)} className="f-btn-main small">Қабылдау</button>
                                    <button onClick={() => handleRespond(req.student._id, false)} className="f-btn-link small">Қабылдамау</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Жаңа сұраныстар жоқ.</p>
                    )}
                </div>

                {/* Секция учеников */}
                <div className="card">
                    <h3>Менің оқушыларым</h3>
                    {students.length > 0 ? (
                        <ul className="students-list">
                            {students.map(student => (
                                <li key={student._id}>
                                    <span>{student.firstName} {student.lastName} ({student.email})</span>
                                    <button onClick={() => handleRemoveStudent(student._id)} className="f-btn-danger small">Жою</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Сізде әлі оқушылар жоқ.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoachDashboard;
