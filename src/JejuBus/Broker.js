import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Broker.css'; 

const Broker = () => {

  const navigate = useNavigate();

    // Controller 시작하는 함수
    const startController = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/start/controller/${ip}`);
        alert(`Controller started: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };
    
    // Controller 중단하는 함수
    const stopController = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/stop/controller/${ip}`);
        alert(`Controller stopped: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };

    // Broker를 시작하는 함수
    const startBroker = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/start/broker/${ip}`);
        alert(`Broker started: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };

    // Broker를 중단하는 함수
    const stopBroker = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/stop/broker/${ip}`);
        alert(`Broker stopped: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };

    // Connect를 시작하는 함수
    const startConnect = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/start/connect/${ip}`);
        alert(`Connect started: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };
  
    // Connect를 중단하는 함수
    const stopConnect = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/stop/connect/${ip}`);
        alert(`Connect stopped: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };

    // SR를 시작하는 함수
    const startSR = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/start/sr/${ip}`);
        alert(`SR started: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };
  
    // SR를 중단하는 함수
    const stopSR = async (ip) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_SERVER}/stop/sr/${ip}`);
        alert(`SR stopped: ${response.data}`); // 성공 메시지
      } catch (error) {
        alert(`Error: ${error.response ? error.response.data : error.message}`);
      }
    };

  
  return (
    <div className="broker-container">
      <div className="center-line"></div>
      {/* 메인 버튼 */}
      <button className="main-btn" onClick={() => navigate('/')}>메인</button>

      {/* 카테고리 1 */}
      <div className="category">
      <div className="start-buttons">
        <button className="controller-btn" onClick={() => startController(`${process.env.REACT_APP_Controller1}`)}>Start Controller 1</button>
        <button className="controller-btn" onClick={() => startController(`${process.env.REACT_APP_Controller2}`)}>Start Controller 2</button>
        <button className="controller-btn" onClick={() => startController(`${process.env.REACT_APP_Controller3}`)}>Start Controller 3</button>
      </div>
      <div className="stop-buttons">
        <button className="controller-btn" onClick={() => stopController(`${process.env.REACT_APP_Controller1}`)}>Stop Controller 1</button>
        <button className="controller-btn" onClick={() => stopController(`${process.env.REACT_APP_Controller2}`)}>Stop Controller 2</button>
        <button className="controller-btn" onClick={() => stopController(`${process.env.REACT_APP_Controller3}`)}>Stop Controller 3</button>
      </div>
      </div>

      {/* 카테고리 2 */}
      <div className="category">
      <div className="start-buttons">
        <button className="broker-btn" onClick={() => startBroker(`${process.env.REACT_APP_Broker1}`)}>Start Broker 1</button>
        <button className="broker-btn" onClick={() => startBroker(`${process.env.REACT_APP_Broker2}`)}>Start Broker 2</button>
        <button className="broker-btn" onClick={() => startBroker(`${process.env.REACT_APP_Broker3}`)}>Start Broker 3</button>
      </div>
      <div className="stop-buttons">
        <button className="broker-btn" onClick={() => stopBroker(`${process.env.REACT_APP_Broker1}`)}>Stop Broker 1</button>
        <button className="broker-btn" onClick={() => stopBroker(`${process.env.REACT_APP_Broker2}`)}>Stop Broker 2</button>
        <button className="broker-btn" onClick={() => stopBroker(`${process.env.REACT_APP_Broker3}`)}>Stop Broker 3</button>
      </div>
      </div>
      
      {/* 카테고리 3 */}
      <div className="category">
      <div className="start-buttons">
        <button className="connect-btn" onClick={() => startConnect(`${process.env.REACT_APP_Connect1}`)}>Start Connect 1</button>
        <button className="connect-btn" onClick={() => startConnect(`${process.env.REACT_APP_Connect2}`)}>Start Connect 2</button>
      </div>
      <div className="stop-buttons">
        <button className="connect-btn" onClick={() => stopConnect(`${process.env.REACT_APP_Connect1}`)}>Stop Connect 1</button>
        <button className="connect-btn" onClick={() => stopConnect(`${process.env.REACT_APP_Connect2}`)}>Stop Connect 2</button>
      </div>
      </div>

      {/* 카테고리 4 */}
      <div className="category">
      <div className="start-buttons">
        <button className="schema-registry-btn" onClick={() => startSR(`${process.env.REACT_APP_SR1}`)}>Start Schema Registry 1</button>
        <button className="schema-registry-btn" onClick={() => startSR(`${process.env.REACT_APP_SR2}`)}>Start Schema Registry 2</button>
      </div>
      <div className="stop-buttons">
        <button className="schema-registry-btn" onClick={() => stopSR(`${process.env.REACT_APP_SR1}`)}>Stop Schema Registry 1</button>
        <button className="schema-registry-btn" onClick={() => stopSR(`${process.env.REACT_APP_SR2}`)}>Stop Schema Registry 2</button>
      </div>
      </div>

    </div>
  );
};

export default Broker;
