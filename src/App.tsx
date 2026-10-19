//App.tsx 
import { fetchWeatherApi } from "openmeteo";
import { useEffect, useRef, useState, type ReactElement } from "react";
const url = "https://api.open-meteo.com/v1/forecast";

// feature: Header 
function Header(){
  return(
    <header>
      <ul  className="flex justify-between border">
        <li><img className="w-[80%] min-w-[131px]" src="./assets/images/logo.svg" alt="logo"/></li>
        
        {/* right side */}
        <li className="flex  items-center gap-2.5">
          <img className="w-[1.5rem] min-w-[8px]" src="./assets/images/icon-units.svg" alt="setting"/>
          <p>Units</p>
          <img className="w-[1.5rem] min-w-[8px]" src="./assets/images/icon-dropdown.svg" alt="dropdown"/>
        </li>
      </ul>
    </header>
  )
}
function Select_Place({place,setweatherplace,setplacelist, setnameweather}){
    // interface Location{
    //     latitude: number;       
    //     longitude: number;
    //     hourly: string;
    //     forecast_days: number;
    // }
    const fetch_weather_params = {
        latitude: place.latitude,
        longitude:place.longitude,
        hourly:"temperature_2m",
        daily: ["temperature_2m_max" , "temperature_2m_min", "weather_code"],
        models:"dwd_icon_seamless",
        current: ["wind_speed_10m", "temperature_2m", "relative_humidity_2m", "precipitation", "apparent_temperature"],
        forecast_days: 7,
};
    const onSelectPlace= async (e) => {

        const responses = await fetchWeatherApi(url,fetch_weather_params);
        console.log("weather is ",responses[0]);
        // task: extract data from response[0]
        const response = responses[0];
        const current = response.current()!;
        const daily = response.daily()!;
        const hourly = response.hourly()!;
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const weatherData ={
          current: {
              time: new Date((Number(current?.time()) + utcOffsetSeconds) * 1000),
              wind_speed_10m: current.variables(0)!.value(),
              temperature_2m: current.variables(1)!.value(),
              relative_humidity_2m: current.variables(2)!.value(),
              precipitation: current.variables(3)!.value(),
              apparent_temperature: current.variables(4)!.value(),
          }, 
          hourly: {
            // 168 entries -> 24 hours * 7 = 168
            // 7 days perspective is taken from whenever search is done
              time: new Set(Array.from(
                {length: (Number(hourly.timeEnd()) - Number(hourly.time())) / hourly.interval()},
                (_ , i ) => new Date((Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds)*1000).toString()
              )),
              temperature_2m: hourly.variables(0)!.valuesArray(),
          },
          daily:{
            time: Array.from(
              {length: (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval()},
              (_,i) => new Date((Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) * 1000)
            ),
            temperature_2m_max: daily.variables(0)!.valuesArray(),
            temperature_2m_min: daily.variables(1)!.valuesArray(),
            weather_code: daily.variables(2)!.valuesArray(),
          },
          place: {
            country: place.country,
            name: place.name,
          },
        
        }; 
        console.log("current data is ",weatherData.current);
        console.log("Hourly data is ",weatherData.hourly);
        // sets weather_place state in App component
        setweatherplace(weatherData);
        setplacelist([]);
        setnameweather({longitude:place.longitude,latitude:place.latitude});
    }
    console.log("place is ",place);
    return <>
        <p onClick={onSelectPlace}>{place.admin1}/{place.country}</p>
    </>
}
// feature: click search button to get all the places name 
function SearchPlaces({setplace, setcurrentweathername}){
  const search_url: string = "https://geocoding-api.open-meteo.com/v1/search?name="
  const place_ref = useRef(null);
  const [test,setTest] = useState(0);
  const [place_list, setPlaces] = useState([]);
  // when submit button is clicked, fetches all the queried search from the api to place_list
  const getPlacesHandler = async (e)=>{
      e.preventDefault();
      const clientData = new FormData(e.target);
      console.log("place_ref is ",place_ref);
      console.log("place_ref ",place_ref.current.value);
      if(place_ref.current.value){
        const response = await fetch(search_url+place_ref.current.value);
        const response_json = await response.json();
        if(response_json){
            setPlaces(response_json.results);
        }
        console.log("response is ",response_json.results);
      }
      
      // console.log("clientData is ",clientData.has("place"));
      // console.log("lets see ",new URLSearchParams(clientData));
      // const response = await fetch(search_url)
  }
  return(
    // container
    <div className="border text-center box-border ">
      {/* heading and search input */}
      <h1 className="text-6xl font-[dmsans] box-border px-[0.5rem]
      my-[2rem]">How's the sky looking today?</h1>
      <form onSubmit={getPlacesHandler} className="border">
        {/* task: create input state to condition the search result and remove the data */}
        <input ref={place_ref} className="text-black" type="search"   name="place" placeholder="Search for a place..."/>
        <button type="submit">Search</button>
        {/* list all the places */}

        {/* solved: map inside ternary operator not working */}
        <section>
          {/* list all the places to select by the user */}
          { place_list ? (place_list.map((place): ReactElement=> 
          <div key={place.id}><Select_Place setnameweather={setcurrentweathername} place={place} setplacelist={setPlaces} setweatherplace={setplace}></Select_Place></div>)) 
          : ""}
        </section>
      </form>
      <button onClick={()=>(setTest(test+1), console.log("new_place_ref ", place_ref.current.value))}>{test}</button>
      {/* { console.log("new_place_ref ",place_ref.current.value) }  */}
    </div>
  )
}

// feature: country_info
function Country({weatherdata}){
  return(
    <div>
      {/* country info and weather */}
      <section>
        <div>
          { weatherdata.place ? <h1>{` ${weatherdata.place.name}, ${weatherdata.place.country}`} </h1>: "" }
          <p>{weatherdata.current ? weatherdata.current.time.toString() : "data not found"}</p>
        </div>
        { weatherdata.current ? <h1>{`${weatherdata.current.temperature_2m.toFixed(2)}^`}</h1> : ""}
      </section>

      {/* country weather attributes */}
      <section>
        <div>
        { weatherdata.current ? <><p>Feels Like</p> <h2>{`${weatherdata.current.apparent_temperature.toFixed(2)}^`}</h2> </> : "" }
        </div>
        <div>
          <p>Humidity</p>
        { weatherdata.current ?  <h2>{`${weatherdata.current.relative_humidity_2m}%`}</h2> : "" } 
        </div>
        <div>
          <p>Wind</p>
        { weatherdata.current ?  <h2>{`${weatherdata.current.wind_speed_10m} mph`}</h2> : ""}
        </div>
        <div>
          <p>Precipitation</p>
        { weatherdata.current ? <h2> {`${weatherdata.current.precipitation} in`} </h2> : ""}
        </div>
      </section>
    </div>
  )
}

// feature: daily_forecast
function Forecast({weatherdata}){
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weather_codes_name = {
	"0": "Clear sky",
	"1": "Mainly clear",
	"2": "Partly cloudy",
	"3": "Overcast",
	"45": "Fog",
	"48": "Depositing rime fog",
	"51": "Light drizzle",
	"53": "Moderate drizzle",
	"55": "Dense drizzle",
	"56": "Light freezing drizzle",
	"57": "Dense freezing drizzle",
	"61": "Slight rain",
	"63": "Moderate rain",
	"65": "Heavy rain",
	"66": "Light freezing rain",
	"67": "Heavy freezing rain",
	"71": "Slight snowfall",
	"73": "Moderate snowfall",
	"75": "Heavy snowfall",
	"77": "Snow grains",
	"80": "Slight rain showers",
	"81": "Moderate rain showers",
	"82": "Violent rain showers",
	"85": "Slight snow showers",
	"86": "Heavy snow showers",
	"95": "Thunderstorm",
	"96": "Thunderstorm with slight hail",
	"97": "Heavy thunderstorm",
	"99": "Thunderstorm with heavy hail"
};
const pictures = {
  "Light drizzle" : "../assets/images/icon-drizzle.webp",
  "Moderate drizzle" : "../assets/images/icon-drizzle.webp",
  "Dense drizzle" : "../assets/images/icon-drizzle.webp",
  "Light freezing drizzle" : "../assets/images/icon-drizzle.webp",
  "Dense freezing drizzle" : "../assets/images/icon-drizzle.webp",
  "slight rain" : "../assets/images/icon-rain.webp",
  "Moderate rain" : "../assets/images/icon-rain.webp",
  "Heavy rain" : "../assets/images/icon-rain.webp",
  "Light freezing rain" : "../assets/images/icon-rain.webp",
  "Heavy freezing rain" : "../assets/images/icon-rain.webp",
  "Slight rain showers" : "../assets/images/icon-rain.webp",
  "Moderate rain showers" : "../assets/imagses/icon-rain.webp",
  "Violent rain showers" : "../assets/images/icon-rain.webp",
  "Slight snowfall" : "../assets/images/icon-snow.webp",
  "Moderate snowfall" : "../assets/images/icon-snow.webp",
  "Heavy snowfall" : "../assets/images/icon-snow.webp",
  "Snow grains" : "../assets/images/icon-snow.webp",
  "Slight snow showers" : "../assets/images/icon-snow.webp",
  "Heavy snow showers" : "../assets/images/icon-snow.webp",
  "Thunderstorm" : "../assets/images/icon-storm.webp",
  "Thunderstorm with slight hail" : "../assets/images/icon-storm.webp",
  "Heavy thunderstorm" : "../assets/images/icon-storm.webp",
  "Thunderstorm with heavy hail" : "../assets/images/icon-storm.webp",
  "Fog" : "../assets/images/icon-fog.webp",
  "Depositing rime fog" : "../assets/images/icon-fog.webp",
  "Overcast" : "../assets/images/icon-overcast.webp",
  "Partly cloudy" : "../assets/images/icon-partly-cloudy.webp",
  "Clear sky" : "../assets/images/icon-sunny.webp",
  "Mainly clear" : "../assets/images/icon-sunny.webp"
}
  return(
    <div>
      <h3>Daily forecast</h3>
      {/* week_forecast */}
      <section>
        { /* task: for loop to display weeks data */ }
        
      { weatherdata.daily ? (weatherdata.daily.time.map((time , index) => 
        <div key={time.toString()+index}>
          <p>{days[weatherdata.daily.time[index].getDay()]}</p>
          <img src={pictures[weather_codes_name[weatherdata.daily.weather_code[index].toString()]]} />
          <div>
            <p>{weatherdata.daily.temperature_2m_max[index]}</p>
            <p>{weatherdata.daily.temperature_2m_min[index]}</p>
          </div>
        </div>
      )) : ""}

      </section>
    </div>
  )
}

// feature: display_left
function Display_left({weather_data}){
  return(
    <div>
      <Country weatherdata={weather_data}></Country>
      <Forecast weatherdata={weather_data}></Forecast>
    </div>
  )
}
// feature: display_right
function Display_right(){
  return(
    <div>

    </div>
  )
}

// feature: display
function Display({weather_data}){
  return(
    <div>
        <Display_left weather_data={weather_data}></Display_left>
        <Display_right></Display_right>
    </div>
  )
}

// feature: App 
export default function App(){
  const [weather_place, setWeatherPlace] = useState({}); // current, hourly
  const [ current_weather_name, set_current_weather_name ] = useState({});
  // loop current temperatue every 2 mins
    useEffect(()=>{
      if(Object.keys(current_weather_name).length){
        const intervalid = setInterval(() => {

        const fetch_current_params = {
          latitude: current_weather_name.latitude,
          longitude: current_weather_name.longitude,
          models:"dwd_icon_seamless",
          current: ["wind_speed_10m", "temperature_2m", "relative_humidity_2m","precipitation", "apparent_temperature"],
        }
        const fetchdata = async () => {
            const responses = await fetchWeatherApi(url,fetch_current_params);
            const response = responses[0];
            const current = response.current()!;
            const utcOffsetSeconds = response.utcOffsetSeconds();
            // task: object expand to change weather_place current key
            const current_data = {
              current:{
                time: new Date((Number(current?.time())+utcOffsetSeconds)* 1000),
                wind_speed_10m: current.variables(0)!.value(),
                temperature_2m: current.variables(1)!.value(),
                relative_humidity_2m: current.variables(2)!.value(),
                precipitation: current.variables(3)!.value(),
                apparent_temperature: current.variables(4)!.value(),
              },
            }
            // set weather_place 
            setWeatherPlace({...weather_place,current:current_data.current});
        };
        fetchdata();
        console.log("useEffect ran");
        console.log("weather_place_is ",weather_place);
        console.log("current_weather_name ",current_weather_name);
        
      },10000); // 15min -> 900000
      
      return () => {
        clearInterval(intervalid);
      };
      }
      },[ current_weather_name ]);
  
  return<>
  <main className="bg-[hsl(248,70%,36%)] min-h-[100dvh] text-white box-border
  px-[1rem] pt-[1rem] pb-[2rem]">
    <Header></Header>
    <div className="flex flex-col items-center">
      <SearchPlaces setplace={setWeatherPlace} setcurrentweathername={set_current_weather_name}></SearchPlaces>
      <Display weather_data={weather_place}></Display>
    </div>
  </main>
  </>
}

// precipitation ,  relative humidity , time , temperature , wind_speed

// total 168 entries  ->  24 hours * 7 days  -> 5:30   , 6:30  , 7:30   Thu Oct 15 2026 05:30:00 GMT+0530  Date object


// time[168]  =  time[168 * Date() Object]