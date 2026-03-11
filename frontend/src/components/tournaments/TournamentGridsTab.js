
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GridDisplay from './GridDisplay'; // Предполагаем, что GridDisplay в той же папке
import { BarChart2 } from 'lucide-react';

const TournamentGridsTab = () => {
    const { id: tournamentId } = useParams();
    const [grids, setGrids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrids = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`/api/tournaments/${tournamentId}/grids`);
                setGrids(data.grids || []);
            } catch (err) {
                const message = err.response?.data?.message || 'Сеткаларды жүктеу кезінде қате пайда болды.';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchGrids();
    }, [tournamentId]);

    if (loading) {
        return <div className="loading-indicator">Сеткалар жүктелуде...</div>;
    }

    if (error) {
        return <div className="error-indicator">Қате: {error}</div>;
    }

    if (grids.length === 0) {
        return (
            <div className="no-data-info">
                <BarChart2 size={40} />
                <h3>Сеткалар әлі құрылмаған</h3>
                <p>Администратор сеткаларды генерациялағаннан кейін олар осында пайда болады.</p>
            </div>
        );
    }

    // GridDisplay ожидает массив, поэтому мы передаем ему все сетки
    // Убедимся, что GridDisplay может обработать массив сеток
    return <GridDisplay grids={grids} tournamentId={tournamentId} />;
};

export default TournamentGridsTab;
