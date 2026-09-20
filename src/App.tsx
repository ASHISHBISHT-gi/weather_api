//App.tsx 

// feature: Header 
function Header(){
  return(
    <header>
      <ul  className="flex justify-between border">
        <li><img className="w-[80%]" src="./assets/images/logo.svg" alt="logo"/></li>
        
        {/* right side */}
        <li className="flex  items-center gap-2">
          <img className="w-[1rem]" src="./assets/images/icon-units.svg" alt="setting"/>
          <p>Units</p>
          <img className="w-[1rem]" src="./assets/images/icon-dropdown.svg" alt="dropdown"/>
        </li>
      </ul>
    </header>
  )
}
// feature: search
function Search(){
  return(
    <>
    <h1>How's the sky looking today?</h1>
    <form method="GET" action="http://192.168.1.10:1234/">
      <input type="search" placeholder="Search for a place..."/>
      <button>Search</button>
    </form>
    </>
  )
}
// feature: App 
export default function App(){
  return<>
  <main className="bg-[hsl(248,70%,36%)] min-h-[100dvh] text-white box-border
  px-[1rem] pt-[1rem] pb-[2rem]">
    <Header></Header>
    <Search></Search>
  </main>
  </>
}