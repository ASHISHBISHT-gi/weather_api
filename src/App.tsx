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
        models:"dwd_icon_seamless",
        current: ["wind_speed_10m", "temperature_2m", "relative_humidity_2m", "precipitation"],
        forecast_days: 7,
};
    const onSelectPlace= async (e) => {

        const responses = await fetchWeatherApi(url,fetch_weather_params);
        console.log("weather is ",responses[0]);
        // task: extract data from response[0]
        const response = responses[0];
        const current = response.current()!;
        const hourly = response.hourly()!;
        const utcOffsetSeconds = response.utcOffsetSeconds();
        const weatherData ={
          current: {
              time: new Date((Number(current?.time()) + utcOffsetSeconds) * 1000),
              wind_speed_10m: current.variables(0)!.value(),
              temperature_2m: current.variables(1)!.value(),
              relative_humidity_2m: current.variables(2)!.value(),
              precipitation: current.variables(3)!.value(),
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
        { weatherdata.current ? <h1>{`${weatherdata.current.temperatue}^`}</h1> : ""}
      </section>

      {/* country weather attributes */}
      <section>
        <div>
          <p>Feels Like</p>
          <h2>64^</h2>
        </div>
        <div>
          <p>Humidity</p>
          <h2>46%</h2>
        </div>
        <div>
          <p>Wind</p>
          <h2>9 mph</h2>
        </div>
        <div>
          <p>Precipitation</p>
          <h2>0 in</h2>
        </div>
      </section>
    </div>
  )
}

// feature: daily_forecast
function Forecast(){
  return(
    <div>
      <h3>Daily forecast</h3>
      {/* week_forecast */}
      <section>
        { /* task: for loop to display weeks data */ }
        <div>
          <p>Tue</p>
          {/* <img src="" alt="" /> */}
          <div>
            <p>68^</p>
            <p>57^</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// feature: display_left
function Display_left({weather_data}){
  return(
    <div>
      <Country weatherdata={weather_data}></Country>
      <Forecast></Forecast>
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
          current: ["wind_speed_10m", "temperature_2m", "relative_humidity_2m","precipitation"],
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