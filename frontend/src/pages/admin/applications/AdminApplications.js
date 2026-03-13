
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getApplications } from '../../../store/applicationSlice';
import './AdminApplications.css';

const AdminApplications = () => {
    const dispatch = useDispatch();
    const { applications, loading, error } = useSelector(state => state.applications);

    useEffect(() => {
        dispatch(getApplications());
    }, [dispatch]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Approved': return 'status-approved';
            case 'Pending': return 'status-pending';
            case 'Rejected': return 'status-rejected';
            default: return '';
        }
    }

    return (
        <div className="admin-applications-container">
            <h1>Өтінімдер (Заявки)</h1>

            <div className="content-block">
                <div className="toolbar">
                    <input type="text" placeholder="Іздеу..." className="search-input" />
                </div>

                {loading ? (
                    <p>Загрузка...</p>
                ) : error ? (
                    <p>Ошибка: {error}</p>
                ) : (
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th>Турнир</th>
                                <th>Команда</th>
                                <th>Спортсмендер</th>
                                <th>Күні</th>
                                <th>Статус</th>
                                <th>Әрекеттер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app._id}>
                                    <td>{app.tournament?.name || '-'}</td>
                                    <td>{app.team?.name || '-'}</td>
                                    <td>{app.athletes?.length || 0}</td>
                                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <Link to={`/admin/applications/${app._id}`} className="action-btn view-btn">👁️</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminApplications;
