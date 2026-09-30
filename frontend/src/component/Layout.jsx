import { Outlet } from "react-router-dom";
import  NavBar  from "./Navbar";
import Slider from "./Slider";
import Footer from "./Footer";


export const Layout = () => {
  return (
    <>
      <NavBar />
        <main className="main-content">
    <Outlet />
  </main>
     

    
      <Footer/>
    </>
  );
};