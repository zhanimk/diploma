import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProfileRedirectPage = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            if (user.role === 'coach') {
                navigate('/coach/profile', { replace: true });
            } else if (user.role === 'athlete') {
                navigate('/athlete/profile', { replace: true });
            } else {
                // Fallback for other roles, e.g., admin
                navigate('/dashboard', { replace: true }); 
            }
        } else {
            // If for some reason user is not logged in, redirect to login
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    // Render nothing while redirecting
    return null; 
};

export default ProfileRedirectPage;
