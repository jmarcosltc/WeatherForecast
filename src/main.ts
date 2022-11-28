import Excel from 'exceljs';
import axios from 'axios';
import * as path from 'path';
import * as dotenv from 'dotenv'
dotenv.config({path: '../.env'})

type Weather = {
    name: string;
    temperature: number;
    feelsLike: number;
    temperature_min: number;
    temperature_max: number;
    humidity: number;
    pressure: number;
    wind: number;
    date: string;
    time: string;
    latitude: number;
    longitude: number; 
};

const cities: any = [
    // {"example": {lat: 00, lon: 00}},
    {Belo_Horizonte: {lat: -19.91, lon: -43.93}},
    {Sao_Paulo: {lat: -23.55, lon: -46.63}},
    {Aracaju: {lat: -10.54, lon: -37.04}},
    {Brasilia: {lat: -15.46, lon: -47.55}},
    {Curitiba: {lat: -25.25, lon: -49.16}},
    {Natal: {lat: -5.47, lon: -35.12}},
    {Goiânia: {lat: -16.40, lon: -49.15}},
    {Fortaleza: {lat: -3.43, lon: -38.32}},
]

// const citiese: any = Object.keys(cities[0]).toString();
// console.log(cities[0][citiese].lat)


const main = async () => {
    let WEATHER_URLs: string[] = [];
    for(let i = 0; i < cities.length; i++) {
        const citiesIndex: any = Object.keys(cities[i]).toString();
        WEATHER_URLs[i] = `https://api.openweathermap.org/data/2.5/weather?lat=${cities[i][citiesIndex].lat}&lon=${cities[i][citiesIndex].lon}&appid=${process.env.API_KEY}`
    }

    writeCsv(WEATHER_URLs)
}

const weatherProps = async (url: string) => {
    return await axios
            .get(url);
}

const writeCsv = async (url: string[]) => {
    var weather_data: Weather[] = []
    var timer = 0;

    const addWeather = setInterval(async function () {
        for (var i = 0; i < url.length; i++) {
            const props = await weatherProps(url[i]);
            // Temperatur
            const temp = props?.data.main.temp - 273.15;
            const feelsLike = props?.data.main.feels_like - 273.15
            const temp_min = props?.data.main.temp_min - 273.15;
            const temp_max = props?.data.main.temp_max - 273.15;
    
            // Other
            const humidity = props?.data.main.humidity;
            const pressure = props?.data.main.pressure;
    
            // Date and time
            const now = new Date();
            const currentTime = now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit',});
            const currentDate = now.toLocaleDateString('pt-BR', {year: 'numeric', month: '2-digit', day: '2-digit'});
    
            // Latitude and Longitude
            const lat = props?.data.coord.lat;
            const lon = props?.data.coord.lon;

            // City name
            const name = Object.keys(cities[i]).toString()
    
            // Wind
            const wind = props?.data.wind.speed;
            weather_data.push(
                { name: name, temperature: temp, feelsLike: feelsLike, temperature_max: temp_max, wind: wind, humidity: humidity, pressure: pressure, temperature_min: temp_min, date: currentDate, time: currentTime, latitude: lat, longitude: lon }
            )
        }

        timer++;
        if (timer == 6) {
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet('Weather');
            
            const weatherColumns = [
                { key: 'name', header: 'City' },
                { key: 'temperature', header: 'Temperature (°C)' },
                { key: 'feelsLike', header: 'Feels Like  (°C)' },
                { key: 'temperature_min', header: 'Max Temp  (°C)' },
                { key: 'temperature_max', header: 'Min Temp  (°C)' },
                { key: 'humidity', header: 'Humidity (%)' },
                { key: 'pressure', header: 'Pressure (hPa)' },
                { key: 'wind', header: 'Wind (meter/sec)' },
                { key: 'date', header: 'Date' },
                { key: 'time', header: 'Time' },
                { key: 'latitude', header: 'Latitude' },
                { key: 'longitude', header: 'Longitude' },
            ];
            
            worksheet.columns = weatherColumns;
            
            weather_data.forEach((weather) => {
                worksheet.addRow(weather);
            });
            
            const exportPath = path.resolve('./data/weatherForecast.csv');
            
            await workbook.csv.writeFile(exportPath);
            clearInterval(addWeather);
        }
        console.log(weather_data)
    }, 10000)

}

main();
