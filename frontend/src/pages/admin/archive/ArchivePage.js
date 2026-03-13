import React from 'react';
import { Archive } from 'lucide-react';

const ArchivePage = () => {
    return (
        <div className="user-list-container"> 
            <div className="user-list-header">
                <Archive size={28} />
                <h1>Турнирлер Мұрағаты</h1>
            </div>
            <p>Мұнда аяқталған және мұрағатталған турнирлердің қорытынды хаттамалары мен есептері көрсетіледі.</p>
        </div>
    );
};

export default ArchivePage;
