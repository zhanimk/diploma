import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader, Zap, ChevronDown, Users, Sword, Crown } from 'lucide-react';
import './GridsTab.css';

const getToken = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? userInfo.token : null;
};

const GridsTab = () => {
    const { id: tournamentId } = useParams();
    const [grids, setGrids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);

    const fetchGrids = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`/api/tournaments/${tournamentId}/grids`, { headers: { Authorization: `Bearer ${getToken()}` } });
            setGrids(data);
        } catch (err) {
            setGrids([]);
        } finally {
            setLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => { fetchGrids(); }, [fetchGrids]);

    const handleGenerateGrids = async () => {
        if (!window.confirm('Торларды қайта құрастыру керек пе? Бұл ағымдағы нәтижелерді жояды.')) return;
        setGenerating(true);
        try {
            await axios.post(`/api/tournaments/${tournamentId}/generate-grids`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
            toast.success('Торлар сәтті құрастырылды!');
            fetchGrids();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Құрастыру қатесі.');
        } finally {
            setGenerating(false);
        }
    };

    const handleConductDraw = async (gridId) => {
        if (!window.confirm('Бұл топ үшін жеребе өткізу керек пе?')) return;
        try {
            const { data } = await axios.post(`/api/grids/${gridId}/draw`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
            setGrids(grids.map(g => g._id === gridId ? data : g));
            toast.success('Жеребе өткізілді!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Жеребе өткізу қатесі.');
        }
    };

    const handleSetWinner = async (matchId, winnerId, gridId) => {
        if (!window.confirm('Осы спортшыны жеңімпаз ретінде тағайындау керек пе?')) return;
        try {
            const { data } = await axios.put(`/api/matches/${matchId}`, { winnerId }, { headers: { Authorization: `Bearer ${getToken()}` } });
            setGrids(grids.map(g => g._id === gridId ? data : g));
            toast.success('Жеңімпаз тағайындалды!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Жеңімпазды тағайындау кезінде қате.');
        }
    };
    
    const renderMatch = (match, gridId) => {
        const canSetWinner = match.status !== 'FINISHED' && match.athlete1 && match.athlete2;
        
        const athlete1Name = match.athlete1 ? `${match.athlete1.firstName} ${match.athlete1.lastName}` : 'Күтілуде...';
        const athlete2Name = match.athlete2 ? `${match.athlete2.firstName} ${match.athlete2.lastName}` : 'Күтілуде...';

        return (
            <li key={match._id} className={`match-item status-${match.status.toLowerCase()}`}>
                <span 
                    className={`athlete-name ${canSetWinner ? 'selectable' : ''} ${match.winner?._id === match.athlete1?._id ? 'winner' : ''}`}
                    onClick={() => canSetWinner && handleSetWinner(match._id, match.athlete1._id, gridId)}
                >
                     {match.winner?._id === match.athlete1?._id && <Crown size={16} className="winner-icon"/>} {athlete1Name}
                </span>
                <span className="vs-icon"><Sword size={16} /></span>
                <span 
                    className={`athlete-name ${canSetWinner ? 'selectable' : ''} ${match.winner?._id === match.athlete2?._id ? 'winner' : ''}`}
                    onClick={() => canSetWinner && handleSetWinner(match._id, match.athlete2._id, gridId)}
                >
                    {match.winner?._id === match.athlete2?._id && <Crown size={16} className="winner-icon"/>} {athlete2Name}
                </span>
            </li>
        );
    }

    if (loading) {
        return <div className="loader-container"><Loader className="animate-spin" /> Жүктелуде...</div>;
    }

    return (
        <div className="grids-tab-container">
            <div className="tab-header">
                <h2>Жеребе және торлар</h2>
                <button onClick={handleGenerateGrids} disabled={generating} className="generate-btn">
                    {generating ? <><Loader size={18} className="animate-spin"/>Құрастырылуда...</> : <><Zap size={18}/>Торларды құрастыру</>}
                </button>
            </div>

            {grids.length > 0 ? (
                <div className="accordion-container">
                    {grids.map((grid, index) => (
                        <div key={grid._id} className={`accordion-item ${grid.drawConducted ? 'draw-conducted' : ''}`}>
                            <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}>
                                <div className="header-content"><span>{grid.categoryDescription}</span><span className="athlete-count"><Users size={16}/>{grid.athletes.length}</span></div>
                                <ChevronDown className={`accordion-icon ${activeAccordion === index ? 'open' : ''}`} />
                            </button>
                            {activeAccordion === index && (
                                <div className="accordion-content">
                                    {grid.matches && grid.matches.length > 0 ? (
                                        <div className="matches-list">
                                           <h4>Жекпе-жек торы:</h4>
                                            <ul>{grid.matches.sort((a,b) => a.round - b.round || a.matchNumber - b.matchNumber).map(m => renderMatch(m, grid._id))}</ul>
                                        </div>
                                    ) : (
                                        <div className="pre-draw-content">
                                            <button onClick={() => handleConductDraw(grid._id)} disabled={grid.athletes.length < 2} className="draw-btn">Жеребе өткізу</button>
                                            <ul className="athlete-list">{grid.athletes.map(a => <li key={a._id}>{a.firstName} {a.lastName}</li>)}</ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (<p className="no-grids-message">Торлар әлі құрастырылмаған.</p>)}
        </div>
    );
};

export default GridsTab;
