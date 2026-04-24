import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Hero() {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("currentUser")) {
      setIsLogged(true);
    }
  }, []);

  return (
    <>
      <section className="p-20">
        <div className="container flex flex-col items-center justify-start mt-16">
          <div className="flex">
            <div className=" rounded-full inline-flex border-2 border-[#1FBCF9]/34 gap-2 px-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400">
              <span>&#10038;</span>
              <span className=" text-sm">Introducing Arogya</span>
            </div>
          </div>

          <div className=" text-xl md:text-3xl text-center font-medium mt-7 lg:p-14 lg:mt-10">
            <h1>
              Your Personal <span className=" text-[#1FBCF9]">Healthcare</span>{" "}
              Assistant
            </h1>
            <p className=" text-lg text-gray-500 font-medium mt-3">
              Instantly get right medication for your symptoms with AI powered
              recommendations
            </p>
          </div>

          {/* Normal Button */}
          <div className="flex items-center mt-6">
            {isLogged ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-[#1FBCF9] hover:bg-blue-600 text-white rounded-lg font-medium transition duration-300"
              >
                Go to Dashboard →
              </button>
            ) : (
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 bg-[#1FBCF9] hover:bg-blue-600 text-white rounded-lg font-medium transition duration-300"
              >
                Sign up →
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
