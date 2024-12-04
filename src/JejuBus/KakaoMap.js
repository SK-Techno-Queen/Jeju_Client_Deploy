import React, { useEffect, useState, useRef } from 'react';
import './KakaoMap.css';

const KakaoMap = () => {
  const [buses, setBuses] = useState([]); // 버스 데이터를 저장하는 상태
  const [spots, setSpots] = useState([]); // 관광지 데이터를 저장하는 상태
  const [map, setMap] = useState(null); // KakaoMap 객체를 저장하는 상태
  const [markers, setMarkers] = useState([]); // 버스 마커를 저장하는 상태
  const [spotMarkers, setSpotMarkers] = useState([]); // 관광지 마커를 저장하는 상태
  const [selectedInfo, setSelectedInfo] = useState(null); // 선택된 마커의 정보를 저장하는 상태
  const [activeInfoWindow, setActiveInfoWindow] = useState(null); // 현재 열려있는 인포 윈도우를 저장하는 상태

  const markerMap = useRef(new Map()); // 전역처럼 사용할 마커 맵

  
  // 버스 데이터를 가져오는 함수
  const fetchBusData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER}/bus`);
      const data = await response.json();

      const filteredBuses = data.map(bus => ({
        plateNo: bus.plateNo,
        localY: bus.localY,
        localX: bus.localX,
        currStationNm: bus.currStationNm,
        routeNum: bus.routeNum,
      }));
      
      // plateNo를 기준으로 중복 제거
      const uniqueBuses = filteredBuses.filter((bus, index, self) =>
        index === self.findIndex((b) => b.plateNo === bus.plateNo)
      );
      
     // console.log(JSON.stringify(uniqueBuses));
      setBuses(uniqueBuses);
    } catch (error) {
      console.error('버스 데이터를 가져오는 데 실패했습니다:', error);
    }
  };

  // 관광지 데이터를 가져오는 함수
  const fetchSpotData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER}/spot`);
      const data = await response.json();
      setSpots(data.items || []);
    } catch (error) {
      console.error('관광지 데이터를 가져오는 데 실패했습니다:', error);
    }
  };

  // KakaoMap 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_API_KEY}&autoload=false`;
    script.async = true;

    script.onload = () => {
      const kakao = window.kakao;
      if (!kakao || !kakao.maps) return;

      kakao.maps.load(() => {
        const container = document.getElementById('map');
        const options = {
          center: new kakao.maps.LatLng(33.48485, 126.52509),
          level: 7,
        };
        const createdMap = new kakao.maps.Map(container, options);
        setMap(createdMap);
      });
    };

    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  
  useEffect(() => {
    if (!map || buses.length === 0) return;
  
    const { kakao } = window;
  
    // 새로운 마커 배열을 생성
    const newMarkers = [];
  
    buses.forEach(bus => {
      const targetPosition = new kakao.maps.LatLng(bus.localY, bus.localX);
      let marker;

        // 버스 마커 이미지 설정
      const busImageSrc = '/location_blue.png'; // 버스 아이콘 이미지 경로
      const busImageMovingSrc = '/location_red.png'; // 이동 중일 때 사용하는 이미지 경로
      const busImageSize = new kakao.maps.Size(20, 28); // 이미지 크기
      const busImageOption = { offset: new kakao.maps.Point(10, 28) }; // 마커 위치 조정

      const busMarkerImage = new kakao.maps.MarkerImage(busImageSrc, busImageSize, busImageOption);
      const busMarkerImageMoving = new kakao.maps.MarkerImage(busImageMovingSrc, busImageSize, busImageOption);

  
      if (markerMap.current.has(bus.plateNo)) {
        // 기존 마커가 있으면 부드럽게 이동
        marker = markerMap.current.get(bus.plateNo);

        if (marker.animationInProgress) return; // 애니메이션이 진행 중이면 반복하지 않음
        
        const startLat = marker.getPosition().getLat();
        const startLng = marker.getPosition().getLng();
        const endLat = bus.localY;
        const endLng = bus.localX;
  
        let startTime = null;
        const animationThreshold = 0.0005; // 위도, 경도의 차이가 이 값보다 작으면 애니메이션 종료로 간주

        // 부드럽게 이동시키는 함수
        const animateMarker = (timestamp) => {
          if (!startTime) {
            startTime = timestamp;

            // 애니메이션이 진행 중인지 확인
            if (marker.animationInProgress) {
              console.log(`${bus.plateNo}: 애니메이션이 이미 진행 중입니다.`);
              return; // 이미 애니메이션이 진행 중이면 반복하지 않음
            } else {
              console.log(`${bus.plateNo}: 애니메이션 시작`);

              marker.animationInProgress = true; // 애니메이션 시작 표시
            }
          }
          const progress = Math.min((timestamp - startTime) / 1000, 1); // 1초 동안 애니메이션 진행
          const currentLat = startLat + (endLat - startLat) * progress;
          const currentLng = startLng + (endLng - startLng) * progress;
  
          marker.setPosition(new kakao.maps.LatLng(currentLat, currentLng));

          // 이동 중이면 이미지 변경
          marker.setImage(busMarkerImageMoving); // 이동 중 빨간색

          console.log(`${bus.plateNo}: 애니메이션 진행 중, 현재 위치 - lat: ${currentLat}, lng: ${currentLng}`);
  
          // 좌표 차이가 일정 기준 이하로 작아지면 애니메이션 종료
          if (Math.abs(endLat - currentLat) < animationThreshold && Math.abs(endLng - currentLng) < animationThreshold) {
            marker.setPosition(new kakao.maps.LatLng(endLat, endLng)); // 정확한 최종 위치 설정
            marker.setImage(busMarkerImage); // 이동 끝나면 파란색으로
            marker.animationInProgress = false; // 애니메이션 종료 표시
            console.log(`${bus.plateNo}: 애니메이션 종료`);
            return; // 애니메이션 종료 후 더 이상 호출되지 않음
          }
            // 애니메이션이 종료되지 않았을 경우 계속해서 애니메이션을 진행
            if (progress < 1) {
              requestAnimationFrame(animateMarker); // 애니메이션 진행 중 계속 업데이트
            } else {
              marker.animationInProgress = false; // 애니메이션이 끝나면 종료 표시
            }
          };

        requestAnimationFrame(animateMarker);

      } else {
        // 새 마커를 생성
        marker = new kakao.maps.Marker({
          position: targetPosition,
          image: busMarkerImage, // 이미지 추가
          zIndex: 3,
        });
        marker.setMap(map); // 지도에 새 마커 추가
        marker.key = bus.plateNo; // 마커에 key를 추가하여 추적 가능하게 설정
        markerMap.current.set(bus.plateNo, marker); // markerMap을 업데이트
      }
  
      newMarkers.push(marker); // 새 마커 배열에 추가
    });
  
    // 이전 마커들을 지도에서 제거하고, 새 마커들을 상태에 반영
    markers.forEach(marker => {
      if (!newMarkers.includes(marker)) {
        marker.setMap(null); // 새 마커 배열에 포함되지 않은 마커는 제거
        markerMap.current.delete(marker.key); // markerMap에서 제거
      }
    });
  
    // 상태 갱신: 새로운 마커 상태로 변경
    setMarkers(newMarkers);
  }, [buses, map]); // buses와 map이 변경될 때만 실행
  
  

  // 인포윈도우 관리 (버스 마커 클릭 시)
  const activeInfoWindowRef = useRef(null);

  useEffect(() => {
    if (!map || markers.length === 0) return;

    const { kakao } = window;
    const infowindow = new kakao.maps.InfoWindow({
      removable: true,
      zIndex: 10,
    });

    markers.forEach(marker => {
      const bus = buses.find(b => b.plateNo === marker.key);
      if (!bus) return;

      const busInfoContent = `
        <div class="custom-infowindow">
          <strong>${bus.plateNo}</strong><br />
          <em>${bus.currStationNm}</em>
        </div>
      `;

      kakao.maps.event.addListener(marker, 'click', () => {
        // 이전에 열려있는 인포윈도우가 있으면 닫기
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
        }

        // 새 인포윈도우 열기
        infowindow.setContent(busInfoContent);
        infowindow.open(map, marker);

        // 현재 열린 인포윈도우를 ref에 저장
        activeInfoWindowRef.current = infowindow;

        setSelectedInfo({
          type: 'bus',
          data: bus,
        });
      });
    });
  }, [map, markers, buses]); // 의존성 배열에서 activeInfoWindow 제거

  // 관광지 마커를 생성
  useEffect(() => {
    if (!map || spots.length === 0) return;

    const { kakao } = window;
    const spotImageSrc = '/location.png';
    const spotImageSize = new kakao.maps.Size(30, 30);
    const spotImageOption = { offset: new kakao.maps.Point(15, 30) };
    const spotMarkerImage = new kakao.maps.MarkerImage(spotImageSrc, spotImageSize, spotImageOption);

    const newMarkers = spots.map(spot => {
      const position = new kakao.maps.LatLng(spot.latitude, spot.longitude);
      const marker = new kakao.maps.Marker({
        position,
        image: spotMarkerImage,
        map,
        zIndex: 2,
      });

      const infoContent = `
        <div class="custom-infowindow">
          <strong>${spot.title || '정보 없음'}</strong><br />
          <em>${spot.roadaddress || '주소 없음'}</em>
        </div>
      `;
      const infowindow = new kakao.maps.InfoWindow({
        content: infoContent,
        removable: true,
        zIndex: 10,
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        if (activeInfoWindow) {
          activeInfoWindow.close();
        }
        infowindow.open(map, marker);
        setActiveInfoWindow(infowindow);
        setSelectedInfo({
          type: 'spot',
          data: spot,
        });
      });

      return marker;
    });

    setSpotMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [spots, map, activeInfoWindow]);

  // 관광지 데이터를 한 번만 가져오기
  useEffect(() => {
    fetchSpotData();
  }, []);

  // 주기적으로 버스 데이터 갱신
  useEffect(() => {
    fetchBusData();
    const interval = setInterval(fetchBusData, 3000);
    return () => clearInterval(interval);
  }, []);

    return (
    <div className="map-container">
      <div id="map"></div> {/* 지도 표시 영역 */}

      {selectedInfo && (
        <div className="info-panel">
          <button
            className="close-button"
            onClick={() => setSelectedInfo(null)} // 정보 패널 닫기 버튼
          >
            닫기
          </button>
          {selectedInfo.type === 'bus' ? (
            <>
              <h3>버스 상세 정보</h3>
              <p><strong>버스 번호:</strong> {selectedInfo.data.plateNo || '정보 없음'}</p>
              <p><strong>노선 번호:</strong> {selectedInfo.data.routeNum || '정보 없음'}</p>
              <p><strong>정류장 이름:</strong> {selectedInfo.data.currStationNm || '정보 없음'}</p>
              <p><strong>위도:</strong> {selectedInfo.data.localY || '정보 없음'}</p>
              <p><strong>경도:</strong> {selectedInfo.data.localX || '정보 없음'}</p>
            </>
          ) : (
            <>
              <h3>관광지 상세 정보</h3>
              <p><strong>관광지 이름:</strong> {selectedInfo.data.title || '정보 없음'}</p>
              <p><strong>주소:</strong> {selectedInfo.data.roadaddress || '주소 없음'}</p>
              <p><strong>설명:</strong> {selectedInfo.data.introduction || '설명 없음'}</p>
              <p><strong>전화번호:</strong> {selectedInfo.data.phoneno || '전화번호 없음'}</p>
              {selectedInfo.data.repPhoto.photoid.imgpath ? (
                <img src={selectedInfo.data.repPhoto.photoid.imgpath} alt="관광지 이미지" />
              ) : (
                <p><strong>이미지:</strong> 이미지 없음</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KakaoMap;