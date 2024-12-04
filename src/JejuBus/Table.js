import React, { useState, useEffect, useCallback } from 'react';
import './Table.css'; // CSS 파일 임포트

const Table = () => {
  const [coordinateHistory, setCoordinateHistory] = useState({});
  const [lastUpdateTime, setLastUpdateTime] = useState({});

  // 실시간으로 버스 데이터 가져오기
  const fetchBusData = async () => {
    try {
      const busResponse = await fetch(`${process.env.REACT_APP_SERVER}/bus`);
      const buses = await busResponse.json(); 

      const updatedHistory = {}; 
      const updatedLastUpdateTime = {}; 

      buses.forEach((bus) => {
        const busId = bus.plateNo; 
        const currentTimestamp = new Date(bus.originalTimestamp); 
        const FilteredTimestamp = new Date(bus.searchTimestamp);

        const diffInMilliseconds = currentTimestamp - (FilteredTimestamp || currentTimestamp);
        const diffInSeconds = Math.max(0, Math.floor(diffInMilliseconds / 1000)); 
        const minutes = Math.floor(diffInSeconds / 60); 
        const seconds = diffInSeconds % 60;

        updatedHistory[busId] = {
          originalTimestamp: currentTimestamp,
          filteredTimestamp: FilteredTimestamp,
          timeDiff: { minutes, seconds },
        };

        updatedLastUpdateTime[busId] = Date.now(); 
      });

      setCoordinateHistory((prev) => ({
        ...prev,
        ...updatedHistory,
      }));

      setLastUpdateTime((prev) => ({
        ...prev,
        ...updatedLastUpdateTime,
      }));
    } catch (error) {
      console.error('Error fetching bus data:', error);
    }
  };

  // 일정 시간이 지나면 버스를 삭제하는 함수 (useCallback 사용)
  const removeStaleBuses = useCallback(() => {
    const currentTime = Date.now();
    const threshold = 10000; // 10초

    const updatedHistory = Object.entries(coordinateHistory).reduce((acc, [busId, data]) => {
      if (currentTime - lastUpdateTime[busId] < threshold) {
        acc[busId] = data; 
      }
      return acc;
    }, {});

    setCoordinateHistory(updatedHistory); 
  }, [coordinateHistory, lastUpdateTime]); // 의존성 배열에 `coordinateHistory`와 `lastUpdateTime` 추가

  // 컴포넌트가 마운트될 때 실행
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusData(); 
      removeStaleBuses(); 
    }, 1000);

    return () => clearInterval(interval); 
  }, [removeStaleBuses]); // `removeStaleBuses`만 의존성 배열에 추가

  return (
    <div className="data-panel">
      <table className="coordinate-table">
        <thead>
          <tr>
            <th>Bus Plate Number</th>
            <th>Original Timestamp</th>
            <th>Filtered Timestamp</th>
            <th>Timestamp Difference (ms)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(coordinateHistory).map(([busId, data]) => (
            <tr key={busId}>
              <td>{busId}</td>
              <td>{data.originalTimestamp ? data.originalTimestamp.toLocaleString() : '-'}</td>
              <td>{data.filteredTimestamp ? data.filteredTimestamp.toLocaleString() : '-'}</td>
              <td>
                {data.timeDiff
                  ? `${data.timeDiff.minutes}m ${data.timeDiff.seconds}s`
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;