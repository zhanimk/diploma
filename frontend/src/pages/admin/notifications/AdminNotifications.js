import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Pen, Trash, List, Send } from 'lucide-react';
import './AdminNotifications.css';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [formState, setFormState] = useState({
        id: null,
        title: '',
        content: '',
        status: 'draft',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const API_URL = '/api/notifications/global';

    const getToken = useCallback(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return userInfo ? userInfo.token : null;
    }, []);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${getToken()}` },
            };
            const { data } = await axios.get(API_URL, config);
            setNotifications(data);
        } catch (error) {
            toast.error('Не удалось загрузить публикации.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const resetForm = () => {
        setIsEditing(false);
        setFormState({
            id: null,
            title: '',
            content: '',
            status: 'draft',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.title || !formState.content) {
            toast.error('Заголовок и содержание обязательны.');
            return;
        }
        setIsSubmitting(true);

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${getToken()}`,
            },
        };
        
        const body = { title: formState.title, content: formState.content, status: formState.status };
        const action = isEditing ? axios.put(`${API_URL}/${formState.id}`, body, config) : axios.post(API_URL, body, config);
        const messages = {
            loading: isEditing ? 'Публикация обновляется...' : 'Публикация создается...',
            success: isEditing ? 'Публикация успешно обновлена!' : 'Публикация успешно создана!',
            error: isEditing ? 'Ошибка при обновлении.' : 'Ошибка при создании.',
        };

        try {
            await toast.promise(action, messages);
            resetForm();
            fetchNotifications();
        } catch (error) {
            // Ошибки уже обрабатываются toast.promise, но можно добавить доп. логирование
            console.error("Submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (notification) => {
        setIsEditing(true);
        setFormState({
            id: notification._id,
            title: notification.title,
            content: notification.content,
            status: notification.status,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту публикацию?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${getToken()}` } };
                await toast.promise(
                    axios.delete(`${API_URL}/${id}`, config),
                    {
                        loading: 'Удаление...',
                        success: 'Публикация успешно удалена!',
                        error: 'Ошибка при удалении.',
                    }
                );
                fetchNotifications();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };
    
    const statusTranslations = {
        draft: 'Черновик',
        published: 'Опубликовано'
    };

    return (
        <div className="admin-notifications-page">
            <header className="notifications-header">
                <h1>Управление публикациями</h1>
                <p>Создавайте и управляйте новостями и объявлениями для всех пользователей.</p>
            </header>

            <div className="notifications-container">
                <aside className="publication-form-section">
                    <h2>
                        <Pen size={24}/> 
                        {isEditing ? 'Редактировать публикацию' : 'Создать публикацию'}
                    </h2>
                    <form onSubmit={handleSubmit} className="publication-form">
                        <div className="form-group">
                            <label htmlFor="title">Заголовок</label>
                            <input type="text" id="title" name="title" value={formState.title} onChange={handleInputChange} placeholder="Главные новости..." />
                        </div>
                        <div className="form-group">
                            <label htmlFor="content">Содержание</label>
                            <textarea id="content" name="content" rows="8" value={formState.content} onChange={handleInputChange} placeholder="Полный текст вашей публикации..."></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="status">Статус</label>
                            <select id="status" name="status" value={formState.status} onChange={handleInputChange}>
                                <option value="draft">Черновик</option>
                                <option value="published">Опубликовать</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            {isEditing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Отмена</button>}
                            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                <Send size={18}/> {isEditing ? 'Сохранить' : 'Опубликовать'}
                            </button>
                        </div>
                    </form>
                </aside>

                <main className="publications-list-section">
                     <h2><List size={24}/> Список публикаций</h2>
                    {isLoading ? <p>Загрузка...</p> : notifications.length > 0 ? (
                        notifications.map(n => (
                            <div key={n._id} className={`publication-card ${n.status}`}>
                                <div className="card-header">
                                    <h3>{n.title}</h3>
                                    <div className="card-actions">
                                        <button onClick={() => handleEdit(n)} className="btn-icon" title="Редактировать"><Pen size={16} /></button>
                                        <button onClick={() => handleDelete(n._id)} className="btn-icon delete" title="Удалить"><Trash size={16} /></button>
                                    </div>
                                </div>
                                <div className="card-content">
                                   <p>{n.content.substring(0, 150)}{n.content.length > 150 && '...'}</p>
                                </div>
                                <div className="card-footer">
                                    <span className={`status status-${n.status}`}>
                                        {statusTranslations[n.status]}
                                    </span>
                                    <span className="author-info">
                                        {n.author?.name || 'System'} • {new Date(n.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>Публикаций пока нет. Создайте первую!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminNotifications;