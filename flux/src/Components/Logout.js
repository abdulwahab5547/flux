import { useNavigate } from 'react-router-dom';

function Logout({cancel}){
    const navigate = useNavigate();
    return(
        <div className="logout px-2">
            <div>
                <p>Are you sure you want to log out?</p>
            </div>
            <div className="d-flex logout-btn-div align-items-center py-2">
                <button className="normal-btn" onClick={() => navigate('/start')}
                >Yes</button>
                <button onClick={cancel} className="cancel-btn">Cancel</button>
            </div>
        </div>
    )
}

export default Logout; 