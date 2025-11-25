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
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        const tempElem = document.getElementById("temp");
        const descElem = document.getElementById("description");

        tempElem.textContent = `Temp: ${data.main.temp.toFixed(1)}°C / ${celsiusToFahrenheit(data.main.temp).toFixed(1)}°F`;
        descElem.textContent = `Weather: ${data.weather[0].description}`;

        // --- 3일 단기예보 ---
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        const dailyDataMap = {};
        const today = new Date().getDate();

        forecastData.list.forEach(item => {
            const d = new Date(item.dt * 1000);
            const day = d.getDate();
            if(day === today) return; // 오늘 제외

            const dateStr = `${d.getMonth()+1}/${day}`;

            if(!dailyDataMap[dateStr]) {
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

        const forecast3Days = Object.keys(dailyDataMap).slice(0,3).map(dateStr => {
            return { date: dateStr, ...dailyDataMap[dateStr] };
        });

        // --- 카드 생성 ---
        const forecastContainer = document.querySelector(".forecast-container");
        forecastContainer.innerHTML = "";

        forecast3Days.forEach(day => {
            const card = document.createElement("div");
            card.className = "forecast-card";
            card.innerHTML = `
                <p class="date">${day.date}</p>
                <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.desc}">
                <p class="temp">${day.tempMax.toFixed(1)}°C / ${day.tempMin.toFixed(1)}°C</p>
                <p class="desc">${day.desc}</p>
            `;
            forecastContainer.appendChild(card);
        });

    } catch (error) {
        handleError(error);
    }
}

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
