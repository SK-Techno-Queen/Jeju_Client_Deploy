import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from './Table';
import './Main.css';

const Main = () => {
  // 상태 관리: 모달을 여는 구역
  const [modalSection, setModalSection] = useState(null);

  // 모달 열기
  const handleOpenModal = (section) => {
    setModalSection(section);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setModalSection(null);
  };

  const navigate = useNavigate();

  return (
    <div className="main-container">
      {/* 기본 화면 */}
      <div className="section map-section">
        <iframe
          src={`${process.env.REACT_APP_CLIENT}/map`}  
          title="Kakao Map"
          width="100%"
          height="500px"
          frameBorder="0"
        ></iframe>
        <button className="botton-btn" onClick={() => navigate('/botton')}>버튼</button>
        <button className="expand-btn" onClick={() => handleOpenModal('map')}>확대</button>
      </div>
      <div className="section table-section">
        <iframe
            src={`${process.env.REACT_APP_CLIENT}/table`}  
            title="Table"
            width="100%"
            height="500px"
            frameBorder="0"
          ></iframe>
        <button className="expand-btn" onClick={() => handleOpenModal('table')}>확대</button>
      </div>
      <div className="section prometheus-section">
        <iframe
          src={`http://${process.env.REACT_APP_IP}:9090`}  
          title="Prometheus"
          width="100%"
          height="100%"
          frameBorder="0"
        ></iframe>
        <button className="expand-btn" onClick={() => handleOpenModal('prometheus')}>확대</button>
      </div>
      <div className="section grafana-section">
        <iframe
          src={`http://${process.env.REACT_APP_IP}:3000/d/qu-QZdfZz/kafka-cluster?orgId=1&refresh=1m`}  
          title="Grafana"
          width="100%"
          height="100%"
          frameBorder="0"
        ></iframe>
        <button className="expand-btn" onClick={() => handleOpenModal('grafana')}>확대</button>
      </div>

      {/* 모달 배경 흐리게 처리 */}
      {modalSection && <div className="modal-overlay" onClick={handleCloseModal}></div>}

      {/* 모달: 확대된 화면 */}
      {modalSection && (
        <div className={`modal ${modalSection === 'map' ? 'map-modal' : ''}`}>
          {/* 각 구역에 해당하는 내용을 모달에서 표시 */}
          {modalSection === 'map' && (
            <iframe
              src={`${process.env.REACT_APP_CLIENT}/map`}  
              title="Kakao Map"
              width="100%"
              height="500px"
              frameBorder="0"
            ></iframe>
          )}
          {modalSection === 'table' && <Table />}
          {modalSection === 'prometheus' && (
            <iframe
              src={`http://${process.env.REACT_APP_IP}:9090`}  
              title="Prometheus"
              width="100%"
              height="100%"
              frameBorder="0"
            ></iframe>
          )}
          {modalSection === 'grafana' && (
            <iframe
              src={`http://${process.env.REACT_APP_IP}:3000/d/qu-QZdfZz/kafka-cluster?orgId=1&refresh=1m`}  
              title="Grafana"
              width="100%"
              height="100%"
              frameBorder="0"
            ></iframe>
          )}

          {/* 축소 버튼 */}
          <button className="collapse-btn" onClick={handleCloseModal}>축소</button>
        </div>
      )}
    </div>
  );
};

export default Main;