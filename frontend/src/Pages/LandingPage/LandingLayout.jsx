import Feature from "./Feature"
import Hero from "./Hero"
import Navbar from "./Navbar"
import Footer from "./Footer"
import Faqs from "./Faqs"
import Contact from "./Contact"
// import { useEffect } from "react"
// import { useUser } from "@clerk/clerk-react"

function LandingLayout() {
  //  const {user} = useUser()

  //  useEffect(() =>{

  //   if(!user){
  //      localStorage.removeItem("form-storage");
  //      localStorage.removeItem("tasks");

  //   }

  //  },[])
  

  return (
    <>
    <Navbar />
    <Hero />
    <Feature />
    <Contact />
    <Faqs />
    <Footer />

    </>
  )
}

export default LandingLayout