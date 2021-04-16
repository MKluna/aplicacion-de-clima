const axios = require("axios");
const fs = require('fs');
require("dotenv").config();
const token = process.env.TOKEN;

class Busquedas {
  dbPath = './db/database.json'
  historial = [];
  constructor() {}

  get paramsMapbox() {
    return {
      access_token: token,
      limit: 5,
      languaje: 5,
    };
  }

  get paramsWeather() {
    return {
      appid: process.env.TOKEN_CLIMA,
      units: "metrics",
      lang: "es",
    };
  }

  async ciudad(lugar = "") {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });
      const resp = await instance.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather`,
        params: { ...this.paramsWeather, lat, lon },
      });

      const resp = await instance.get();
      const { weather, main } = resp.data;

      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.error(error);
    }
  }

  agregarHistorial(lugar = ''){

    if(this.historial.includes(lugar.toLocaleLowerCase())){
      return;
    }
    this.historial.unshift(lugar.toLocaleLowerCase());
    this.guardarDB();
  }

  guardarDB(){
    const payload = {
      historial: this.historial
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload))
  }
}
module.exports = Busquedas;
