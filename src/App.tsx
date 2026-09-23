//App.tsx 
import { fetchWeatherApi } from "openmeteo";
import { useRef } from "react";
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
// feature: search
function Search(){
  const search_url: string = "https://geocoding-api.open-meteo.com/v1/search?name="
  // search place
  const submitHandler = async (e)=>{
      e.preventDefault();
      const clientData = new FormData(e.target);
      console.log("clientData is ",clientData);
      // const response = await fetch(search_url)
  }
  return(
    // container
    <div className="border text-center box-border ">
      {/* heading and search input */}
      <h1 className="text-6xl font-[dmsans] box-border px-[0.5rem]
      my-[2rem]">How's the sky looking today?</h1>
      <form onSubmit={submitHandler} className="border">
        <input className="text-black" type="search" placeholder="Search for a place..."/>
        <button>Search</button>
      </form>
    </div>
  )
}

// feature: country_info
function Country(){
  return(
    <div>
      {/* country info and weather */}
      <section>
        <div>
          <h2>Berlin, Germany</h2>
          <p>Tuesday, Aug5,2025</p>
        </div>
        <h1>68^</h1>
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
function Display_left(){
  return(
    <div>
      <Country></Country>
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
function Display(){
  return(
    <div>
        <Display_left></Display_left>
        <Display_right></Display_right>
    </div>
  )
}

// feature: App 
export default function App(){
  return<>
  <main className="bg-[hsl(248,70%,36%)] min-h-[100dvh] text-white box-border
  px-[1rem] pt-[1rem] pb-[2rem]">
    <Header></Header>
    <div className="flex flex-col items-center">
      <Search></Search>
      <Display></Display>
    </div>
  </main>
  </>
}