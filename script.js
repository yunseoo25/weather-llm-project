// --- 온도 변환 ---
function celsiusToFahrenheit(c) {
    return (c * 9/5) + 32;
}

// --- 에러 핸들링 ---
function handleError(error) {
    console.error("Error occurred:", error);
}

// --- 날씨 가져오기 ---
async function getWeather(city) {
    try {
        const apiKey = "f777e360e70831b017b92916f3319d13";

        // --- 현재 날씨 ---
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=kr&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const tempElem = document.getElementById("temp");
        const descElem = document.getElementById("description");

        tempElem.textContent = `Temp: ${data.main.temp.toFixed(1)}°C / ${celsiusToFahrenheit(data.main.temp).toFixed(1)}°F`;
        descElem.textContent = `Weather: ${data.weather[0].description}`;

        await renderForecast(city, apiKey);
    
        // 화면에 온도 표시
         tempElem.textContent =
        `Temp: ${data.main.temp.toFixed(1)}°C / ${celsiusToFahrenheit(data.main.temp).toFixed(1)}°F`;

      // 옷차림 추천 적용
      const clothesText = getClothesRecommendation(data.main.temp);
      document.getElementById("clothes").textContent = clothesText;

      //기온별 데이트 추천 적용
      const dateIdea=getDateIdeaByTemperature(data.main.temp);
      document.getElementById("dateIdea").textContent=dateIdea;

      //지도위치가져오기
      const lat = data.coord.lat;
      const lon = data.coord.lon;
        
      //미세먼지함수호출
      getAirQuality(lat, lon); // ⭐ 미세먼지 정보 불러오기
      initMap(lat, lon);      // 지도 기능도 여기서 업데이트
      getForecast(lat, lon); //강수확률 업데이트 



    
    } catch (error) {
        handleError(error);
    }
};

// --- 검색 버튼 이벤트 ---
// DOM이 다 준비된 후에 실행되도록
document.addEventListener("DOMContentLoaded", () => {
  const cityInput = document.getElementById("cityInput");
  const searchBtn = document.getElementById("searchBtn");

  // 버튼 클릭 시 실행
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
      getWeather(city);   // 너가 이미 만든 함수
    }
  });

  // 엔터키로도 검색 실행
  cityInput.addEventListener("keydown", (e) => {
    // 콘솔에서 확인해보는 용도 (원하면 지워도 됨)
    console.log("key pressed:", e.key);

    if (e.key === "Enter") {
      e.preventDefault();   // 혹시 폼 새로고침 방지용
      searchBtn.click();    // 위의 클릭 이벤트 재사용
    }
  });
});


//현재위치날씨가져오기

const geoBtn   = document.getElementById("geoBtn");
const apikey="f777e360e70831b017b92916f3319d13";

geoBtn.addEventListener("click", ()=>{
    if (!navigator.geolocation){
        alert("이 브라우저에서는 위치 정보를 지원하지 않아요");
        return ;
    }
    navigator.geolocation.getCurrentPosition(success, error);

});

function success(position){
    const lat=position.coords.latitude;
    const lon=position.coords.longitude;
     console.log("현재 위치:", lat, lon);
  getWeatherByCoords(lat, lon);
}

function error(err){
    console.error(err);
    alert("위치정보를 가져올 수 없어요");
}

async function getWeatherByCoords(lat, lon) {
  const url =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
    `&appid=${apikey}&units=metric&lang=kr`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("날씨 정보를 가져올 수 없습니다.");

    const data = await res.json();

    // ⬇ 여기에서 화면에 표시 (temp, description 등)는
    // getWeather() 안에서 하던 코드랑 완전히 똑같이 쓰면 돼
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    const name = `${data.name}, ${data.sys.country}`;

    
    const tempElem = document.getElementById("temp");
    const descElem = document.getElementById("description");

    tempElem.textContent = `Temp: ${data.main.temp.toFixed(1)}°C / ${celsiusToFahrenheit(data.main.temp).toFixed(1)}°F`;
    descElem.textContent = `Weather: ${data.weather[0].description}`;


    //기온별 옷차림 추천 적용
    const celsius = data.main.temp;
    const clothesText = getClothesRecommendation(celsius);
    document.getElementById("clothes").textContent = clothesText;

    //기온별 데이트 추천 적용
    const dateIdea=getDateIdeaByTemperature(data.main.temp);
    document.getElementById("dateIdea").textContent=dateIdea;

    await renderForecast(data.name,apikey);

    //지도위치가져오기
    const lat = data.coord.lat;
    const lon = data.coord.lon;
    initMap(lat, lon);  //지도위치업데이트
    getAirQuality(lat, lon); //미세먼지농도업데이트
    getForecast(lat, lon); //강수확률업데이트


    
    // 도시 입력창에도 현재 도시 이름 넣어주면 편함
    cityInput.value = name;
  } catch (err) {
    console.error(err);
    alert("현재 위치의 날씨 정보를 가져오는 중 오류가 발생했습니다.");
  }

  
}
//미세먼지 정보 가져오기 
async function getAirQuality(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apikey}`;
    const response = await fetch(url);
    const data = await response.json();

    const aqi = data.list[0].main.aqi; // 1~5
    const pm10 = data.list[0].components.pm10;
    const pm25 = data.list[0].components.pm2_5;

    let level = "";

    switch (aqi) {
        case 1: level = "매우 좋음 😄"; break;
        case 2: level = "좋음 🙂"; break;
        case 3: level = "보통 😐"; break;
        case 4: level = "나쁨 😷"; break;
        case 5: level = "매우 나쁨 🤢"; break;
    }

    document.getElementById("dust").innerHTML =
        `✨ <b>AQI:</b> ${aqi} (${level})<br>
         💨 <b>PM10:</b> ${pm10} ㎍/m³<br>
         🌫 <b>PM2.5:</b> ${pm25} ㎍/m³`;
}


function getClothesRecommendation(temp) {
    if (temp <= 5) {
        return "🧥 매우 춥습니다! 패딩, 목도리, 장갑, 기모바지 필수!";
    } else if (temp > 5 && temp <= 10) {
        return "🧥 추운 날씨! 코트, 니트, 히트텍 추천.";
    } else if (temp > 10 && temp <= 15) {
        return "🧥 쌀쌀함! 얇은 코트, 가디건, 후드티, 긴바지.";
    } else if (temp > 15 && temp <= 20) {
        return "🧥 선선함! 가벼운 니트, 맨투맨, 청바지.";
    } else if (temp > 20 && temp <= 25) {
        return "👕 따뜻함! 반팔+가벼운 셔츠, 얇은 긴팔.";
    } else if (temp > 25 && temp <= 30) {
        return "☀ 더움! 반팔, 반바지, 시원한 옷차림.";
    } else {
        return "🔥 매우 더움! 민소매, 반바지, 최대한 시원하게!";
    }
}

function getDateIdeaByTemperature(temp) {
    if (temp <= 5) {
        return "❄️ 매우 추워요! 따뜻한 실내 데이트 추천 — 카페, 영화관, 보드게임 카페, 북카페, 전시회.";
    } else if (temp > 5 && temp <= 10) {
        return "☕ 쌀쌀한 날씨! 포근한 카페 데이트 또는 따뜻한 라멘/핫초코 먹으러 가기.";
    } else if (temp > 10 && temp <= 15) {
        return "🍂 선선한 날씨! 산책 데이트, 공원 피크닉(가벼운 담요 필수), 사진 찍기 좋은 날씨.";
    } else if (temp > 15 && temp <= 20) {
        return "🌤 딱 좋은 날씨! 드라이브, 한강 산책, 야외 카페, 간단한 트래킹 데이트 추천.";
    } else if (temp > 20 && temp <= 25) {
        return "☀️ 따뜻한 날씨! 야외 피크닉, 자전거 데이트, 공원 산책, 아이스크림 먹기.";
    } else if (temp > 25 && temp <= 30) {
        return "🌬 조금 더운 날씨! 쇼핑몰 데이트, 아이스 아메리카노 들고 산책, 실내 데이트도 굿.";
    } else {
        return "🔥 매우 더움! 실내 데이트 강추 — 카페, 영화관, VR게임, 방탈출, 박물관, 쇼핑몰.";
    }
}

function updateCurrentTime() {
    const now = new Date();

    // 날짜
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2,'0');
    const day = String(now.getDate()).padStart(2,'0');

    // 시간
    const hours = String(now.getHours()).padStart(2,'0');
    const minutes = String(now.getMinutes()).padStart(2,'0');
    const seconds = String(now.getSeconds()).padStart(2,'0');

    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    document.getElementById("currentTime").textContent = formatted;
}

//기온에 따라 카드뉴스 색상 변경 
function getCardColorByTemp(temp) {
    if (temp <= 5) {
        return "#0986c1dc";   // 추운 날 → 시원한 연파랑
    } else if (temp > 5 && temp <= 10) {
        return "#46c0f8ff";
    } else if (temp > 10 && temp <= 15) {
        return "#86e4ebff";
    } else if (temp > 15 && temp <= 20) {
        return "#4ef5d0ff";   // 선선한 날 → 청록
    } else if (temp > 20 && temp <= 25) {
        return "#f4f276ff";   // 따뜻
    } else if (temp > 25 && temp <= 30) {
        return "#f08d50ff";   // 더움 → 오렌지
    } else {
        return "#f26033ff";   // 매우 더움 → 진한 오렌지
    }
}


async function renderForecast(city, apiKey) {

    const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    const forecastRes = await fetch(forecastUrl);
    const forecastData = await forecastRes.json();

    const dailyDataMap = {};
    const today = new Date().getDate();

    forecastData.list.forEach(item => {
        const d = new Date(item.dt * 1000);
        const day = d.getDate();
        if (day === today) return;

        const dateStr = `${d.getMonth() + 1}/${day}`;

        if (!dailyDataMap[dateStr]) {
            dailyDataMap[dateStr] = {
                tempMax: item.main.temp_max,
                tempMin: item.main.temp_min,
                desc: item.weather[0].description,
                icon: item.weather[0].icon
            };
        } else {
            dailyDataMap[dateStr].tempMax = Math.max(dailyDataMap[dateStr].tempMax, item.main.temp_max);
            dailyDataMap[dateStr].tempMin = Math.min(dailyDataMap[dateStr].tempMin, item.main.temp_min);
        }
    });

    const forecast3Days = Object.keys(dailyDataMap).slice(0, 3).map(dateStr => {
        return { date: dateStr, ...dailyDataMap[dateStr] };
    });

    const forecastContainer = document.querySelector(".forecast-container");
    forecastContainer.innerHTML = "";

    forecast3Days.forEach(day => {
        const card = document.createElement("div");
        card.className = "forecast-card";
        card.innerHTML = `
            <p class="date">${day.date}</p>
            <img src="http://openweathermap.org/img/wn/${day.icon}.png">
            <p class="temp">${day.tempMax.toFixed(1)}°C / ${day.tempMin.toFixed(1)}°C</p>
            <p class="desc">${day.desc}</p>
        `;

        const avgTemp = (day.tempMax + day.tempMin) / 2;

        // 색상 변경 적용
        card.style.background = getCardColorByTemp(avgTemp);

        // 뜨거운 날 → 햇빛
        if (avgTemp >= 25) {
            const sun = document.createElement("div");
            sun.classList.add("sunshine");
            card.appendChild(sun);
        }

        // 추운 날 → 눈
        if (avgTemp <= 5) {
            for (let i = 0; i < 6; i++) {
                const snow = document.createElement("div");
                snow.classList.add("snowflake");
                snow.textContent = '❄';
                snow.style.left = (Math.random() * 80 + 10) + "%";
                snow.style.animationDelay = (Math.random() * 2) + "s";
                snow.style.fontSize = (12 + Math.random() * 4) + "px";
                card.appendChild(snow);
            }
        }

        forecastContainer.appendChild(card);
    });
}

// 1초마다 시간 업데이트
setInterval(updateCurrentTime, 1000);

// 페이지 열리자마자 첫 실행
updateCurrentTime();

function updateSkyImage() {
    const hour = new Date().getHours();
    const body = document.body;

    // 기존 배경 클래스 제거
    body.classList.remove('morning', 'noon', 'evening', 'night');
    body.classList.add("time-bg");  // 공통 스타일 적용

    if (hour >= 5 && hour < 10) {
        body.classList.add('morning');
    } 
    else if (hour >= 10 && hour < 17) {
        body.classList.add('noon');
    } 
    else if (hour >= 17 && hour < 20) {
        body.classList.add('evening');
    } 
    else {
        body.classList.add('night');
    }
}

// 페이지 로드 시 자동 적용
window.onload = updateSkyImage;


let map;       // 지도 객체
let marker;    // 핀(marker)

// 지도 초기 생성 함수
function initMap(lat, lon) {
    if (!map) {
        // 지도 처음 생성
        map = L.map('map').setView([lat, lon], 11);

        // 지도 타일 불러오기
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // 마커 추가
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        // 지도 이미 생성된 경우 → 위치만 업데이트
        map.setView([lat, lon], 11);
        marker.setLatLng([lat, lon]);
    }
}

//강수확률 기반 추천 기능 
function umbrellaRecommend(pop) {
    let message = "";

    if (pop >= 0.6) {
        message = "🌧️ 비 올 확률이 높아요! 우산 꼭 챙기세요.";
    } else if (pop >= 0.3) {
        message = "☁️ 비가 올 수도 있어요. 작은 우산 하나 있으면 좋아요.";
    } else {
        message = "🌞 비 올 가능성은 낮아요. 우산은 필요 없어요!";
    }

    document.getElementById("umbrella").textContent = message;
}

async function getForecast(lat, lon) {

    const apiKey = "f777e360e70831b017b92916f3319d13";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();

    const pop = data.list[0].pop; // 첫 번째 예보의 강수확률 (0~1)

    umbrellaRecommend(pop); // ☔ 우산 추천 기능 실행

    // 나머지 예보 카드 생성하는 기존 코드...
}

