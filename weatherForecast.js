async function getWeatherByCoords(lat, lon) {

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

        //3일 카드뉴스 생성 
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

    // 도시 입력창에도 현재 도시 이름 넣어주면 편함
    cityInput.value = name;
  } catch (err) {
    console.error(err);
    alert("현재 위치의 날씨 정보를 가져오는 중 오류가 발생했습니다.");
  }
}

