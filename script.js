async function getWeather(city) {
try {
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f777e360e70831b017b92916f3319d13`;
const response = await fetch(url);
const data = await response.json();


document.getElementById("temp").textContent = `Temp: ${data.main.temp}`;
document.getElementById("description").textContent = `Weather: ${data.weather[0].description}`;
} catch (error) {
handleError(error);
}
}


function handleError(error) {
console.error("Error occurred:", error);
}


document.getElementById("searchBtn").addEventListener("click", () => {
const city = document.getElementById("cityInput").value;
if (city) getWeather(city);
});