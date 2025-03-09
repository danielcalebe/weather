import { StatusBar } from 'expo-status-bar';
import { Button, Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location'; // Usando a biblioteca do Expo para geolocalização
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconApp from '..//..//assets/icon.svg'
import axios from 'axios';
import Svg, { Circle } from 'react-native-svg';
import Day from '..//..//assets/s.svg';
import ClearSkyDay from '../../assets/01d.svg';
import ClearSkyNight from '../../assets/01n.svg';
import FewCloudsDay from '../../assets/02d.svg';
import FewCloudsNight from '../../assets/02n.svg';
import ScatteredCloudsDay from '../../assets/03d.svg';
import ScatteredCloudsNight from '../../assets/03d.svg';
import BrokenCloudsDay from '../../assets/03d.svg';
import BrokenCloudsNight from '../../assets/03d.svg';
import ShowerRainDay from '../../assets/09d.svg';
import ShowerRainNight from '../../assets/09n.svg';
import RainDay from '../../assets/10d.svg';
import RainNight from '../../assets/10n.svg';
import ThunderstormDay from '../../assets/11d.svg';
import ThunderstormNight from '../../assets/11n.svg';
import SnowDay from '../../assets/13d.svg';
import SnowNight from '../../assets/13n.svg';
import MistDay from '../../assets/50d.svg';
import MistNight from '../../assets/50n.svg';

import Search from '../../assets/search.svg';
const API_KEY = 'e624326258a7446ca5a766a1b80d0f95';

export function Home() {


  const [time, setTime] = useState('');
  const [colorsGradient, setColorsGradient] = useState<string[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [city, setCity] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dataWeather, setDataWeather] = useState("");
  const [forecast, setForecast] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [cityValue, setCityValue] = useState("");


  // Função para verificar e pedir permissão de localização
  const requestLocationPermission = async () => {
    const permissionStatus = await AsyncStorage.getItem('locationPermission');
    if (permissionStatus !== 'granted') {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await AsyncStorage.setItem('locationPermission', 'granted');
        console.log('Permissão de localização concedida');
      } else {
        setErrorMsg('Permissão de localização negada');
        console.log('Permissão de localização negada');
      }
    }
  };

  const { width, height } = Dimensions.get('window');
  const NUM_STARS = 50;

  const generateStars = () => {
    return Array.from({ length: NUM_STARS }).map((_, i) => ({
      cx: Math.random() * width,
      cy: Math.random() * height,
      r: Math.random() * 1 + 1, // Tamanho aleatório entre 1 e 3
      opacity: Math.random() * 0.2 + 0.3, // Opacidade aleatória entre 0.5 e 1
    }));
  };

  const stars = generateStars();


  useEffect(() => {
    requestLocationPermission();

    const getLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
        fetchCity(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg('Erro ao obter localização');
      }
    };

    getLocation();
  }, []);

  const fetchCity = async (latitude: number, longitude: number) => {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${API_KEY}`;
    try {
      const response = await axios.get(url);
      const city = response.data.results[0]?.components.city || 'Cidade não encontrada';
      setCity(city);
    } catch (error) {
      setErrorMsg('Erro ao obter a cidade');
    }
  };


  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTime('morning');
      } else if (hour >= 12 && hour < 18) {
        setTime('afternoon');
      } else {
        setTime('night');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateColors = () => {
      if (time === 'morning') {
        setColorsGradient(['#eeaeca', '#94bbe9']);
      } else if (time === 'afternoon') {
        setColorsGradient(['#94bbe9', '#bf9076', '#f09956', '#17204a']);
      } else {
        setColorsGradient(['#17204a', '#1d2b69', '#3852c2', '#4b73c9', '#4b4fc9', '#21246b', '#000']);
      }
    };

    updateColors();
    const interval = setInterval(updateColors, 60000);

    return () => clearInterval(interval);
  }, [time]);

  let text = 'Aguardando cidade...';
  if (errorMsg) {
    text = errorMsg;
  }

  const apiKeyOW = "2beacc30a5d768a0d06ee2f263a0713b"

  const fetchWeather = async () => {
    if (!city) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKeyOW}`;

    try {
      const response = await axios.get(url);
      if (response.data.cod === "404") {
        setErrorMsg('Cidade não encontrada!');
      } else {
        setDataWeather(response.data);
        setErrorMsg(null); // Limpar a mensagem de erro quando a cidade for encontrada
      }
    } catch (error) {
      setErrorMsg('Erro ao obter a cidade');
    }
  };

  console.log(dataWeather)

  const fetchForecast = async () => {
    if (!city) return;

    const apiKeyOW = "2beacc30a5d768a0d06ee2f263a0713b";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKeyOW}&units=metric`;

    try {
      const response = await axios.get(url);
      const forecastData = response.data.list;

      // Filtrando apenas 1 previsão por dia (pegamos sempre o meio-dia)
      const dailyForecast = forecastData.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setForecast(dailyForecast);
    } catch (error) {
      setErrorMsg("Erro ao obter a previsão");
    }
  };


  useEffect(() => {
    if (city) {
      fetchWeather()
      fetchForecast()
    } else {

    }
  }, [city]);


  const convertTemperature = (tempKelvin: number, unit: "C" | "F" = "C") => {
    if (unit === "C") {
      return (tempKelvin - 273.15).toFixed(1) + "°C";
    } else if (unit === "F") {
      return (((tempKelvin - 273.15) * 9) / 5 + 32).toFixed(1) + "°F";
    }
    return tempKelvin + "K";
  };


  console.log(forecast)
  return (
    <LinearGradient colors={colorsGradient} style={
      styles.container
    }
    >
      {
        time == 'night' ?
          <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
            {stars.map((star, index) => (
              <Circle key={index} cx={star.cx} cy={star.cy} r={star.r} fill="white" opacity={star.opacity} />
            ))}
          </Svg>
          :
          ''
      }

      <View style={styles.header}>

        <View style={[styles.headerWelcome, isSearching ? { display: 'none' } : { backgroundColor: 'rgba(51, 56, 61, 0.3)' }]} >

          <View>
            <Text style={styles.headerText}>

              {time === 'morning' ? 'Bom dia!' : time === 'afternoon' ? 'Boa tarde!' : 'Boa noite'}
            </Text>
            <Text style={styles.headerText2}>
              <Text style={styles.headerText2}>

                {errorMsg ? errorMsg : city ? `${city}, ${dataWeather.sys?.country || ''}` : text}
              </Text>            </Text>

          </View>
          <View style={styles.headerIcons}>
            <Search
              onPress={() => {
                setIsSearching(true);
              }}
              width={60} height={60} style={{ marginTop: 20 }} fill={time === 'night' || time === 'afternoon' ? '#fff' : '#000'} />
            <IconApp width={60} height={60} fill={time === 'night' || time === 'afternoon' ? '#fff' : '#000'} />

          </View>

        </View>
        <TextInput
          style={[styles.headerInput, isSearching && { display: 'flex' }]}
          placeholderTextColor={'#fff'}
          onBlur={() => setIsSearching(false)}
          value={cityValue}
          onChangeText={setCityValue}
          onSubmitEditing={() => {
            setCity(cityValue);
            fetchWeather();
            setIsSearching(false);
          }}
          placeholder="Cidade:"
          keyboardType="default"
        />


      </View>

      <View style={[styles.errorBox, errorMsg ? { display: 'flex', opacity: 1 } : { display: 'none', opacity: 1 }]}>
        <Text style={styles.errorText}>
          ERRO AO ENCONTRAR AS INFORMAÇÕES DA CIDADE{" "}
          <Text style={styles.boldText}>"{city}"</Text>
        </Text>
        <Text style={styles.errorText}>

          Tente pesquisar outra coisa
        </Text>
      </View>

      <View style={styles.mainCenter}>
        <Text style={[styles.mainCenterText, isSearching && { display: 'none' }]}>Bem vindo!</Text>
        {dataWeather ? (
          dataWeather.weather[0].icon === '01d' ? (
            <ClearSkyDay />
          ) : dataWeather.weather[0].icon === '01n' ? (
            <ClearSkyNight />
          ) : dataWeather.weather[0].icon === '02d' ? (
            <FewCloudsDay />
          ) : dataWeather.weather[0].icon === '02n' ? (
            <FewCloudsNight />
          ) : dataWeather.weather[0].icon === '03d' ? (
            <ScatteredCloudsDay />
          ) : dataWeather.weather[0].icon === '03n' ? (
            <ScatteredCloudsNight />
          ) : dataWeather.weather[0].icon === '04d' ? (
            <BrokenCloudsDay />
          ) : dataWeather.weather[0].icon === '04n' ? (
            <BrokenCloudsNight />
          ) : dataWeather.weather[0].icon === '09d' ? (
            <ShowerRainDay />
          ) : dataWeather.weather[0].icon === '09n' ? (
            <ShowerRainNight />
          ) : dataWeather.weather[0].icon === '10d' ? (
            <RainDay />
          ) : dataWeather.weather[0].icon === '10n' ? (
            <RainNight />
          ) : dataWeather.weather[0].icon === '11d' ? (
            <ThunderstormDay />
          ) : dataWeather.weather[0].icon === '11n' ? (
            <ThunderstormNight />
          ) : dataWeather.weather[0].icon === '13d' ? (
            <SnowDay />
          ) : dataWeather.weather[0].icon === '13n' ? (
            <SnowNight />
          ) : dataWeather.weather[0].icon === '50d' ? (
            <MistDay />
          ) : dataWeather.weather[0].icon === '50n' ? (
            <MistNight />
          ) : null
        ) : null}


        <Text style={styles.mainCenterText2}>{dataWeather && dataWeather.main?.temp ? convertTemperature(dataWeather.main.temp, "C") : "..."}</Text>
        <Text style={styles.mainCenterText3}>
          Min: {dataWeather && dataWeather.main?.temp_min ? convertTemperature(dataWeather.main.temp_min, "C") : "..."};
          Max: {dataWeather && dataWeather.main?.temp_max ? convertTemperature(dataWeather.main.temp_max, "C") : "..."}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Os próximos 5 dias
        </Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {forecast && forecast.length > 0 ? (
            forecast.map((day, index) => (
              <View key={index} style={styles.footerCarrousselCard}>
                <Text style={styles.footerCarrousselCardText}>
                  {new Date(day.dt * 1000).toLocaleDateString("pt-BR", { weekday: "short" })}
                </Text>
                <Text style={styles.footerCarrousselCardText2}>
                  {new Date(day.dt * 1000).toLocaleDateString("pt-BR")}
                </Text>

                {day.weather && day.weather[0].icon ? (
                  day.weather[0].icon === '01d' ? (
                    <ClearSkyDay width={60} height={60}/>
                  ) : day.weather[0].icon === '01n' ? (
                    <ClearSkyNight width={60} height={60}/>
                  ) : day.weather[0].icon === '02d' ? (
                    <FewCloudsDay width={60} height={60}/>
                  ) : day.weather[0].icon === '02n' ? (
                    <FewCloudsNight width={60} height={60}/>
                  ) : day.weather[0].icon === '03d' ? (
                    <ScatteredCloudsDay width={60} height={60} />
                  ) : day.weather[0].icon === '03n' ? (
                    <ScatteredCloudsNight width={60} height={60}/>
                  ) : day.weather[0].icon === '04d' ? (
                    <BrokenCloudsDay width={60} height={60}/>
                  ) : day.weather[0].icon === '04n' ? (
                    <BrokenCloudsNight width={60} height={60}/>
                  ) : day.weather[0].icon === '09d' ? (
                    <ShowerRainDay width={60} height={60}/>
                  ) : day.weather[0].icon === '09n' ? (
                    <ShowerRainNight width={60} height={60}/>
                  ) : day.weather[0].icon === '10d' ? (
                    <RainDay width={60} height={60}/>
                  ) : day.weather[0].icon === '10n' ? (
                    <RainNight width={60} height={60}/>
                  ) : day.weather[0].icon === '11d' ? (
                    <ThunderstormDay width={60} height={60}/>
                  ) : day.weather[0].icon === '11n' ? (
                    <ThunderstormNight width={60} height={60}/>
                  ) : day.weather[0].icon === '13d' ? (
                    <SnowDay width={60} height={60}/>
                  ) : day.weather[0].icon === '13n' ? (
                    <SnowNight width={60} height={60}/>
                  ) : day.weather[0].icon === '50d' ? (
                    <MistDay width={60} height={60}/>
                  ) : day.weather[0].icon === '50n' ? (
                    <MistNight width={60} height={60}/>
                  ) : null
                ) : null}

                <Text style={styles.footerCarrousselCardText3}>
                  {Math.round(day.main.temp)}°C
                </Text>
              </View>
            ))
          ) : null}
        </ScrollView>



      </View>
      <StatusBar style="light" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
    paddingVertical: 30,
  },
  header: {
    flex: 1,
    flexDirection: "column",
    width: '100%',
    maxHeight: '12%',
    borderRadius: 10,
    padding: 4,
    paddingHorizontal: 10

  },
  headerWelcome: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    width: '100%',
    justifyContent: 'space-between',
    padding: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'semibold',
    color: '#fff',
  },
  headerText2: {
    fontSize: 14,
    fontWeight: 'semibold',
    color: '#fff',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInput: {
    backgroundColor: 'rgba(51, 56, 61, 0.3)',
    borderRadius: 10,
    display: 'none',
    margin: 10,
    height: 40,
    color: "#FFF"
  },
  mainCenter: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',


  },
  mainCenterText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '200',
  },
  mainCenterText2: {
    color: '#fff',
    fontSize: 80,
    fontWeight: '100',

  },
  mainCenterText3: {
    color: '#fff',

  },
  footer: {
    gap: 20,
    paddingLeft: 20,
  },
  footerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: '300'
  },
  footerCarrousselCard: {
    width: 100,
    height: 140,
    backgroundColor: 'rgba(51, 56, 61, 0.3)',
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    marginRight: 12

  },
  footerCarrousselCardText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500"


  },
  footerCarrousselCardText2: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center"

  },
  footerCarrousselCardText3: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "100"
  },
  errorBox: {
    position: 'absolute',
    backgroundColor: '#cc0000',
    flex: 1,
    alignSelf: 'center', // Alinha este item no início (semelhante ao justifySelf)
    marginTop: 300,
    zIndex: 1,
    padding: 20,
    borderRadius: 10,
    fontWeight: 200,
    justifyContent: "center",
    opacity: 1.3,

  },
  errorText: {
    color: '#fff',  // Cor do texto
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold', // Torna o texto em negrito
  },
});
