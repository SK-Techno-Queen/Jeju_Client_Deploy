import React, { useState, useEffect } from 'react';
import './Table.css'; // CSS 파일 임포트

const Table = () => {
  // 각 버스의 상태(현재 타임스탬프, 이전 타임스탬프, 시간 차이)를 관리하는 state
  const [coordinateHistory, setCoordinateHistory] = useState({});

  // 마지막 업데이트 시간 관리용 (초 단위로 갱신 시간 추적)
  const [lastUpdateTime, setLastUpdateTime] = useState({});

  // 실시간으로 버스 데이터 가져오기
  const fetchBusData = async () => {
    try {
      // /bus API를 호출하여 buses와 allBuses 데이터를 함께 가져옴
      const busResponse = await fetch(`${process.env.REACT_APP_SERVER}/bus`);
      const buses = await busResponse.json(); // buses와 allBuses 분리하여 받기

      const updatedHistory = {}; // 업데이트할 데이터를 저장할 객체
      const updatedLastUpdateTime = {}; // 각 버스에 대한 마지막 갱신 시간을 저장할 객체

      // 각 버스 데이터를 처리
      buses.forEach((bus) => { // busData.buses로 데이터 접근
        const busId = bus.plateNo; // 버스 ID (plateNo) 가져오기
        const currentTimestamp = new Date(bus.originalTimestamp); // "originalTimestamp"를 오리지널 타임스탬프로 사용
        const FilteredTimestamp = new Date(bus.searchTimestamp); // "searchTimestamp"를 필터링된 타임스탬프로 사용


        // 현재 타임스탬프와 이전 타임스탬프의 차이 계산
        const diffInMilliseconds = currentTimestamp - (FilteredTimestamp || currentTimestamp); // 이전 타임스탬프가 없으면 차이는 0
        const diffInSeconds = Math.max(0, Math.floor(diffInMilliseconds / 1000)); // 밀리초를 초 단위로 변환, 음수는 0으로 처리
        const minutes = Math.floor(diffInSeconds / 60); // 분 단위로 변환
        const seconds = diffInSeconds % 60; // 초 단위로 계산

        // 업데이트할 데이터를 객체에 추가
        updatedHistory[busId] = {
          originalTimestamp: currentTimestamp, // 오리지널 타임스탬프 저장
          filteredTimestamp: FilteredTimestamp, // 필터링된 타임스탬프 저장
          timeDiff: { minutes, seconds }, // 시간 차이를 분과 초 단위로 저장
        };

         // 각 버스의 마지막 갱신 시간도 추적
         updatedLastUpdateTime[busId] = Date.now(); // 현재 시간을 마지막 갱신 시간으로 저장
        });

      // 상태 업데이트 (기존 데이터와 새 데이터를 병합)
      setCoordinateHistory((prev) => ({
        ...prev,
        ...updatedHistory,
      }));

       // 마지막 갱신 시간 업데이트
       setLastUpdateTime((prev) => ({
        ...prev,
        ...updatedLastUpdateTime,
      }));
    } catch (error) {
      console.error('Error fetching bus data:', error); // 에러 발생 시 콘솔에 출력
    }
  };
  
    // 일정 시간이 지나면 버스를 삭제하는 함수
    const removeStaleBuses = () => {
      const currentTime = Date.now();
      const threshold = 10000; // 10초
  
      const updatedHistory = Object.entries(coordinateHistory).reduce((acc, [busId, data]) => {
        // 10초 이상 업데이트가 없다면 해당 버스 삭제
        if (currentTime - lastUpdateTime[busId] < threshold) {
          acc[busId] = data; // 10초 이내에 업데이트된 버스만 유지
        }
        return acc;
      }, {});
  
      setCoordinateHistory(updatedHistory); // 필터링된 버스만 상태에 업데이트
    };

  // 컴포넌트가 마운트될 때 실행 (1초마다 fetchBusData 호출)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusData(); // 1초마다 버스 데이터를 가져옴
      removeStaleBuses(); // 오래된 버스 삭제
    }, 1000);

    return () => clearInterval(interval); // 컴포넌트가 언마운트될 때 interval 정리
  }, [coordinateHistory, lastUpdateTime]);

  return (
    <div className="data-panel">
      <table className="coordinate-table">
        <thead>
          <tr>
            <th>Bus Plate Number</th> {/* 버스 번호 열 */}
            <th>Original Timestamp</th> {/* 현재 타임스탬프 열 */}
            <th>Filtered Timestamp</th> {/* 이전 타임스탬프 열 */}
            <th>Timestamp Difference (ms)</th> {/* 타임스탬프 차이 (분, 초) 열 */}
          </tr>
        </thead>
        <tbody>
          {/* state에 저장된 모든 버스 데이터를 기반으로 테이블 행 생성 */}
          {Object.entries(coordinateHistory).map(([busId, data]) => (
            <tr key={busId}>
              <td>{busId}</td> {/* 버스 번호 출력 */}
              <td>{data.originalTimestamp ? data.originalTimestamp.toLocaleString() : '-'}</td> {/* 현재 타임스탬프 출력 (없으면 '-') */}
              <td>{data.filteredTimestamp ? data.filteredTimestamp.toLocaleString() : '-'}</td> {/* 이전 타임스탬프 출력 (없으면 '-') */}
              <td>
                {data.timeDiff
                  ? `${data.timeDiff.minutes}m ${data.timeDiff.seconds}s` // 시간 차이를 '분 초' 형식으로 출력
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
