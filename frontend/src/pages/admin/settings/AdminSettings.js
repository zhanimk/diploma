import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminSettings.css';
import { Save, Loader, Plus, Trash2 } from 'lucide-react';

// --- Начальная структура данных для футера ---
const initialFooterState = {
    brand: { logoText: '', description: '' },
    nav: [],
    widget: { statusText: '' },
    bottom: { watermark: '', copyrightText: '', links: [] },
};

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        contactPhone: '',
        socialLinks: { instagram: '', facebook: '', telegram: '' },
        footer: initialFooterState
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/settings');
            // Убеждаемся, что вложенные объекты существуют
            data.socialLinks = data.socialLinks || { instagram: '', facebook: '', telegram: '' };
            data.footer = data.footer || initialFooterState;
            data.footer.brand = data.footer.brand || initialFooterState.brand;
            data.footer.nav = data.footer.nav || initialFooterState.nav;
            data.footer.widget = data.footer.widget || initialFooterState.widget;
            data.footer.bottom = data.footer.bottom || initialFooterState.bottom;
            setSettings(data);
        } catch (error) {
            toast.error('Настройки не удалось загрузить.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // --- Функции для управления футером ---
    const handleFooterChange = (section, field, value) => {
        setSettings(prev => ({...prev, footer: {...prev.footer, [section]: {...prev.footer[section], [field]: value}}}));
    };

    const handleNavItemChange = (groupIndex, linkIndex, field, value) => {
        const newNav = [...settings.footer.nav];
        if(linkIndex === null) { // Меняем заголовок группы
            newNav[groupIndex].title = value;
        } else { // Меняем ссылку
            newNav[groupIndex].links[linkIndex][field] = value;
        }
        setSettings(prev => ({...prev, footer: {...prev.footer, nav: newNav}}));
    };
    
    const addNavGroup = () => handleFooterChange('nav', 'nav', [...settings.footer.nav, { title: 'Новая группа', links: []}]);
    const removeNavGroup = (index) => {
        const newNav = settings.footer.nav.filter((_, i) => i !== index);
        handleFooterChange('nav', 'nav', newNav);
    };
    const addNavLink = (groupIndex) => {
        const newNav = [...settings.footer.nav];
        newNav[groupIndex].links.push({ text: 'Новая ссылка', url: '/' });
        handleFooterChange('nav', 'nav', newNav);
    };
    const removeNavLink = (groupIndex, linkIndex) => {
        const newNav = [...settings.footer.nav];
        newNav[groupIndex].links = newNav[groupIndex].links.filter((_, i) => i !== linkIndex);
        handleFooterChange('nav', 'nav', newNav);
    };

    // Функции для нижних ссылок футера
    const handleBottomLinkChange = (index, field, value) => {
        const newLinks = [...settings.footer.bottom.links];
        newLinks[index][field] = value;
        handleFooterChange('bottom', 'links', newLinks);
    };
    const addBottomLink = () => handleFooterChange('bottom', 'links', [...settings.footer.bottom.links, { text: 'Новая ссылка', url: '/'}]);
    const removeBottomLink = (index) => {
        const newLinks = settings.footer.bottom.links.filter((_, i) => i !== index);
        handleFooterChange('bottom', 'links', newLinks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const toastId = toast.loading('Сохранение...');
        try {
            await axios.put('/api/settings', settings);
            toast.success('Настройки успешно сохранены!', { id: toastId });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка при сохранении.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="loader-container"><Loader className="animate-spin" size={48} /></div>;
    }

    return (
        <div className="admin-settings-container">
            <form onSubmit={handleSubmit} className="settings-form">
                {/* --- Общие настройки и соцсети (как и были) --- */}

                {/* --- НОВЫЙ РАЗДЕЛ: НАСТРОЙКИ ФУТЕРА --- */}
                <div className="form-section">
                    <h2 className="section-header">Настройки футера</h2>
                    
                    {/* Блок "Бренд" */}
                    <div className="form-subsection">
                        <h3>Бренд</h3>
                        <div className="form-group">
                            <label>Текст логотипа (поддерживает HTML)</label>
                            <input type="text" value={settings.footer.brand.logoText} onChange={e => handleFooterChange('brand', 'logoText', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Описание под логотипом</label>
                            <textarea value={settings.footer.brand.description} onChange={e => handleFooterChange('brand', 'description', e.target.value)} />
                        </div>
                    </div>

                    {/* Блок "Навигация" */}
                    <div className="form-subsection">
                        <h3>Навигация</h3>
                        {settings.footer.nav.map((group, groupIndex) => (
                            <div key={groupIndex} className="nav-group-admin">
                                <div className="form-group">
                                    <label>Заголовок группы</label>
                                    <div className="input-with-action">
                                        <input type="text" value={group.title} onChange={e => handleNavItemChange(groupIndex, null, 'title', e.target.value)} />
                                        <button type="button" className="danger-btn" onClick={() => removeNavGroup(groupIndex)}><Trash2 size={16}/></button>
                                    </div>
                                </div>
                                {group.links.map((link, linkIndex) => (
                                    <div key={linkIndex} className="link-item-admin">
                                        <input type="text" placeholder="Текст" value={link.text} onChange={e => handleNavItemChange(groupIndex, linkIndex, 'text', e.target.value)} />
                                        <input type="text" placeholder="URL" value={link.url} onChange={e => handleNavItemChange(groupIndex, linkIndex, 'url', e.target.value)} />
                                        <button type="button" className="danger-btn-small" onClick={() => removeNavLink(groupIndex, linkIndex)}><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                <button type="button" className="add-btn-small" onClick={() => addNavLink(groupIndex)}><Plus size={16}/> Добавить ссылку</button>
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={addNavGroup}><Plus size={18}/> Добавить группу навигации</button>
                    </div>

                     {/* Блок "Виджет статуса" */}
                    <div className="form-subsection">
                        <h3>Виджет статуса</h3>
                        <div className="form-group">
                            <label>Текст статуса</label>
                             <input type="text" value={settings.footer.widget.statusText} onChange={e => handleFooterChange('widget', 'statusText', e.target.value)} />
                             <p className="field-description">Значения для виджета (пользователи и клубы) подгружаются автоматически.</p>
                        </div>
                    </div>

                    {/* Блок "Нижняя часть" */}
                    <div className="form-subsection">
                        <h3>Нижняя часть (подвал)</h3>
                        <div className="form-group">
                           <label>Водяной знак</label>
                           <input type="text" value={settings.footer.bottom.watermark} onChange={e => handleFooterChange('bottom', 'watermark', e.target.value)} />
                        </div>
                        <div className="form-group">
                           <label>Текст копирайта</label>
                           <input type="text" value={settings.footer.bottom.copyrightText} onChange={e => handleFooterChange('bottom', 'copyrightText', e.target.value)} />
                        </div>
                        <h4>Ссылки в подвале</h4>
                        {settings.footer.bottom.links.map((link, index) => (
                             <div key={index} className="link-item-admin">
                                <input type="text" placeholder="Текст" value={link.text} onChange={e => handleBottomLinkChange(index, 'text', e.target.value)} />
                                <input type="text" placeholder="URL" value={link.url} onChange={e => handleBottomLinkChange(index, 'url', e.target.value)} />
                                <button type="button" className="danger-btn-small" onClick={() => removeBottomLink(index)}><Trash2 size={14}/></button>
                            </div>
                        ))}
                        <button type="button" className="add-btn-small" onClick={addBottomLink}><Plus size={16}/> Добавить ссылку</button>
                    </div>
                </div>

                <button type="submit" className="save-btn" disabled={isSaving}>
                    {isSaving ? <><Loader size={18} className="animate-spin" /> Сохранение...</> : <><Save size={18} /> Сохранить все изменения</>}
                </button>
            </form>
        </div>
    );
};

export default AdminSettings;