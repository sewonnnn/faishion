
import './Fail.css';
import {useNavigate} from "react-router-dom";

export function FailPage() {

    // 👈 2. useNavigate 훅 사용
    const navigate = useNavigate();

    // 이 함수가 window.history.back() 역할을 합니다.
    const handleGoBack = () => {
        navigate(-1); // 👈 3. navigate(-1)을 호출하여 이전 페이지로 돌아갑니다.
    };


    return (
        <div className="fail-page-container">
            <header className="page-header">
                <h1 className="header-title">결제 실패</h1>
            </header>
            <main className="main-content">
                <div className="fail-message-box">
                    <p className="fail-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x-circle">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                    </p>
                    <h2 className="fail-message-title">결제에 실패했습니다.</h2>
                    <p className="fail-reason">
                        결제 실패 사유를 확인하고 다시 시도해 주세요.
                    </p>
                </div>
                <div className="retry-action">
                    <button onClick={handleGoBack} className="retry-button">
                        이전 페이지로 돌아가기
                    </button>
                </div>
            </main>
        </div>
    );
}