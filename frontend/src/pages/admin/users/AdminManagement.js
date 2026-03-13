import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, Home, Loader, X, Edit, Save, CheckCircle, Trash, Lock, Unlock } from 'lucide-react';
import './AdminManagement.css';
import { useDebounce } from '../../../hooks/useDebounce';

// Импорт новых компонентов
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import UserDetailsPanel from '../../../components/admin/UserDetailsPanel';
import ClubDetailsPanel from '../../../components/admin/ClubDetailsPanel';

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.token : null;
};

// --- Вкладка Пользователи (упрощенная) ---
const UsersTab = ({ users, loading, onUserClick, editingUser, handleSave, handleCancelEdit, editedRole, setEditedRole, onEdit }) => {
    return (
        loading ? <div className="loader-container"><Loader className="animate-spin" size={48} /></div> : (
            <div className="table-wrapper">
                <table className="content-table interactive">
                    <thead>
                        <tr>
                            <th>Аты-жөні</th>
                            <th>Email</th>
                            <th>Рөлі</th>
                            <th>Мәртебесі</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} onClick={() => onUserClick(user._id)} className={user.isBlocked ? 'blocked-row' : ''}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>
                                    {editingUser === user._id ? (
                                        <div onClick={e => e.stopPropagation()}>
                                             <select value={editedRole} onChange={(e) => setEditedRole(e.target.value)} className="role-select-inline">
                                                <option value="athlete">Спортшы</option>
                                                <option value="coach">Жаттықтырушы</option>
                                                <option value="admin">Әкімші</option>
                                                <option value="judge">Төреші</option>
                                            </select>
                                            <button onClick={() => handleSave(user._id)} className="action-btn-inline save"><Save size={16}/></button>
                                            <button onClick={handleCancelEdit} className="action-btn-inline cancel"><X size={16}/></button>
                                        </div>
                                    ) : (
                                        <span className={`role-badge role-${user.role}`}>{user.role} <button onClick={(e) => {e.stopPropagation(); onEdit(user)}} className='edit-role-btn'><Edit size={12}/></button></span>
                                    )}
                                </td>
                                <td>
                                    <span className={`status-badge status-${user.isBlocked ? 'blocked' : 'active'}`}>
                                        {user.isBlocked ? 'Бұғатталған' : 'Белсенді'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );
};

// --- Вкладка Клубы (упрощенная) ---
const ClubsTab = ({ clubs, loading, onClubClick }) => {
    return (
        loading ? <div className="loader-container"><Loader className="animate-spin" size={48} /></div> : (
            <div className="table-wrapper">
                <table className="content-table interactive">
                    <thead>
                        <tr>
                            <th>Атауы</th>
                            <th>Жаттықтырушы</th>
                            <th>Аймақ</th>
                            <th>Мүшелер</th>
                            <th>Мәртебесі</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clubs.map(club => (
                            <tr key={club._id} onClick={() => onClubClick(club._id)} className={!club.isVerified ? 'pending-row' : ''}>
                                <td>{club.name || '—'}</td>
                                <td>{club.coachName || '—'}</td>
                                <td>{club.region || '—'}</td>
                                <td>{club.athleteCount || 0}</td>
                                <td>
                                    <span className={`status-badge status-${club.isVerified ? 'verified' : 'pending'}`}>
                                        {club.isVerified ? 'Расталған' : 'Күтуде'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );
};

// --- Основной компонент-контейнер ---
const AdminManagement = () => {
    const [activeTab, setActiveTab] = useState('users');

    // State для пользователей
    const [users, setUsers] = useState([]);
    const [userLoading, setUserLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // State для клубов
    const [clubs, setClubs] = useState([]);
    const [clubLoading, setClubLoading] = useState(true);
    const [clubStatusFilter, setClubStatusFilter] = useState('');

    // State для панелей
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedClub, setSelectedClub] = useState(null);
    const [panelLoading, setPanelLoading] = useState(false);

    // State для модального окна
    const [modalState, setModalState] = useState({ isOpen: false, onConfirm: null, title: '', message: '' });

    // State для редактирования роли inline
    const [editingUser, setEditingUser] = useState(null);
    const [editedRole, setEditedRole] = useState('');

    // --- Data Fetching ---
    const fetchUsers = useCallback(async () => {
        setUserLoading(true);
        try {
            const { data } = await axios.get('/api/users', { 
                headers: { Authorization: `Bearer ${getToken()}` },
                params: { search: debouncedSearchTerm, role: roleFilter },
            });
            setUsers(data);
        } catch (error) { toast.error('Пайдаланушыларды жүктеу сәтсіз болды'); }
        finally { setUserLoading(false); }
    }, [debouncedSearchTerm, roleFilter]);

    const fetchClubs = useCallback(async () => {
        setClubLoading(true);
        try {
            const { data } = await axios.get('/api/clubs', { 
                headers: { Authorization: `Bearer ${getToken()}` },
                params: { status: clubStatusFilter },
            });
            setClubs(data);
        } catch (error) { toast.error('Клубтарды жүктеу мүмкін болмады'); }
        finally { setClubLoading(false); }
    }, [clubStatusFilter]);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
    }, [activeTab, fetchUsers]);

    useEffect(() => {
        if (activeTab === 'clubs') fetchClubs();
    }, [activeTab, fetchClubs]);

    // --- Modal Logic ---
    const openModal = (onConfirm, title, message, confirmText, confirmVariant = 'danger') => {
        setModalState({ isOpen: true, onConfirm, title, message, confirmText, confirmVariant });
    };
    const closeModal = () => setModalState({ isOpen: false });
    const confirmAction = () => {
        if (modalState.onConfirm) modalState.onConfirm();
        closeModal();
    };

    // --- Panel Logic ---
    const handleUserClick = async (userId) => {
        setPanelLoading(true);
        setSelectedClub(null); // Close other panel
        try {
            const { data } = await axios.get(`/api/users/${userId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            setSelectedUser(data);
        } catch (error) { toast.error('Пайдаланушы деректерін алу мүмкін болмады'); }
        finally { setPanelLoading(false); }
    };

    const handleClubClick = async (clubId) => {
        setPanelLoading(true);
        setSelectedUser(null); // Close other panel
        try {
            // Use the correct endpoint for club details
            const { data } = await axios.get(`/api/clubs/${clubId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
            // Assuming the members are now populated under 'athletes' from the backend
            setSelectedClub({ ...data, members: data.athletes }); 
        } catch (error) { toast.error('Клуб деректерін алу мүмкін болмады'); }
        finally { setPanelLoading(false); }
    };

    const closePanel = () => {
        setSelectedUser(null);
        setSelectedClub(null);
    };

    // --- Action Handlers ---
    const handleBlockUser = (userId, isBlocked) => {
        const actionText = isBlocked ? 'бұғаттан шығару' : 'бұғаттау';
        const action = async () => {
            try {
                await axios.put(`/api/users/${userId}/block`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
                toast.success(`Пайдаланушы сәтті ${actionText}`);
                fetchUsers();
                closePanel();
            } catch (error) {
                toast.error('Бұғаттау күйін өзгерту мүмкін болмады');
            }
        };
        openModal(action, `Пайдаланушыны ${actionText}`, `Осы пайдаланушыны ${actionText} келесіз бе?`, actionText);
    };

    const handleEditRole = (user) => {
        setEditingUser(user._id);
        setEditedRole(user.role);
        closePanel();
    };

    const handleSaveRole = async (userId) => {
        try {
            await axios.put(`/api/users/${userId}`, { role: editedRole }, { headers: { Authorization: `Bearer ${getToken()}` } });
            toast.success('Пайдаланушы рөлі жаңартылды!');
            setEditingUser(null);
            fetchUsers();
        } catch (error) { toast.error('Рөлді жаңарту мүмкін болмады'); }
    };

    const handleVerifyClub = (clubId) => {
        const action = async () => {
             try {
                await axios.put(`/api/clubs/${clubId}/verify`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
                toast.success('Клуб сәтті расталды');
                fetchClubs();
                closePanel();
            } catch (error) { toast.error('Клубты растау мүмкін болмады'); }
        };
        openModal(action, 'Клубты растау', 'Бұл клубты растағыңыз келетініне сенімдісіз бе?', 'Растау', 'primary');
    };
    
    const handleDeleteClub = (clubId) => {
        const action = async () => {
            try {
                await axios.delete(`/api/clubs/${clubId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
                toast.success('Клуб сәтті жойылды');
                fetchClubs();
                closePanel();
            } catch (error) { toast.error(error.response?.data?.message || 'Клубты жою мүмкін болмады'); }
        };
        openModal(action, 'Клубты жою', 'Бұл клубты жойғыңыз келетініне сенімдісіз бе? Барлық байланысты ақпарат жойылады!', 'Жою', 'danger');
    };

    return (
        <div className="management-container">
            <ConfirmationModal isOpen={modalState.isOpen} onClose={closeModal} onConfirm={confirmAction} {...modalState} />
            
            {panelLoading && <div className='panel-loader'><Loader className='animate-spin'/></div>}
            {selectedUser && <UserDetailsPanel user={selectedUser} onClose={closePanel} onBlock={handleBlockUser} onEditRole={handleEditRole}/>}
            {selectedClub && <ClubDetailsPanel club={selectedClub} onClose={closePanel} onVerify={handleVerifyClub} onDelete={handleDeleteClub} />}

            <div className="management-header">
                <h1>Пайдаланушылар мен Клубтар</h1>
                <p>Жүйедегі барлық пайдаланушылар мен спорт клубтарын басқарыңыз.</p>
            </div>

            <div className="tabs-navigation">
                <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={18} /> Пайдаланушылар</button>
                <button className={`tab-btn ${activeTab === 'clubs' ? 'active' : ''}`} onClick={() => setActiveTab('clubs')}><Home size={18} /> Клубтар</button>
            </div>

            <div className="toolbar">
                {activeTab === 'users' ? (
                    <>
                        <input
                            type="text"
                            placeholder="Аты, тегі, email бойынша іздеу..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">Барлық рөлдер</option>
                            <option value="admin">Әкімші</option>
                            <option value="coach">Жаттықтырушы</option>
                            <option value="athlete">Спортшы</option>
                            <option value="judge">Төреші</option>
                        </select>
                    </>
                ) : (
                    <div className="filter-buttons">
                        <button className={`filter-btn ${clubStatusFilter === '' ? 'active' : ''}`} onClick={() => setClubStatusFilter('')}>Барлығы</button>
                        <button className={`filter-btn ${clubStatusFilter === 'pending' ? 'active' : ''}`} onClick={() => setClubStatusFilter('pending')}>Күтуде</button>
                        <button className={`filter-btn ${clubStatusFilter === 'verified' ? 'active' : ''}`} onClick={() => setClubStatusFilter('verified')}>Расталғандар</button>
                    </div>
                )}
            </div>

            <div className="tab-content">
                {activeTab === 'users' ? 
                    <UsersTab 
                        users={users} 
                        loading={userLoading} 
                        onUserClick={handleUserClick} 
                        editingUser={editingUser} 
                        handleSave={handleSaveRole} 
                        handleCancelEdit={() => setEditingUser(null)} 
                        editedRole={editedRole} 
                        setEditedRole={setEditedRole} 
                        onEdit={handleEditRole}
                    /> : 
                    <ClubsTab 
                        clubs={clubs} 
                        loading={clubLoading} 
                        onClubClick={handleClubClick} 
                    />}
            </div>
        </div>
    );
};

export default AdminManagement;
