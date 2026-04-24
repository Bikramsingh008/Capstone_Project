import { Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
  { label: "FAQs", href: "#faqs" },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("currentUser")) {
      setIsLogged(true);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("currentUser");
    setIsLogged(false);
    navigate("/");
  };

  const handleNavigation = (href) => {
    // If Home clicked
    if (href === "/") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
      return;
    }

    // If section clicked (Features, Contact, FAQs)
    navigate("/");
    setTimeout(() => {
      const section = document.querySelector(href);
      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 100);
  };

  return (
    <section className="flex items-center justify-center p-5 fixed w-full bg-[#0a0a0a] z-50">
      <div className="container mx-auto">
        <div className="border-2 rounded-[27px] md:rounded-full border-white/15">
          <div className="grid grid-cols-2 md:grid-cols-3 items-center p-3 px-4">

            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavigation("/")}
            >
              <Activity size={34} color="#1FBCF9" />
              <h3 className="text-2xl md:text-3xl font-semibold text-white">
                Arogya
              </h3>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex">
              <nav className="flex justify-center gap-10 font-medium text-gray-300">
                {navLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(link.href)}
                    className="hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

          {/* Right Side */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-white text-2xl"
              >
                ☰
              </button>

              {isLogged ? (
                <>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="hidden md:flex text-white bg-transparent border border-[#1FBCF9] rounded-full px-5 py-2 hover:bg-[#1FBCF9]/10 transition"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex text-white bg-red-500 rounded-full px-5 py-2 hover:bg-red-600 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="hidden md:flex text-white bg-[#1FBCF9] rounded-full px-5 py-2 hover:bg-[#1aa7de] transition"
                >
                  Sign Up
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="flex flex-col gap-4 py-4 items-center md:hidden text-gray-300">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleNavigation(link.href);
                    setIsOpen(false);
                  }}
                  className="hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              {isLogged ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setIsOpen(false);
                    }}
                    className="text-white bg-transparent border border-[#1FBCF9] rounded-full px-5 py-2 w-full max-w-[200px]"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="text-white bg-red-500 rounded-full px-5 py-2 w-full max-w-[200px]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/signup");
                    setIsOpen(false);
                  }}
                  className="text-white bg-[#1FBCF9] rounded-full px-5 py-2 w-full max-w-[200px]"
                >
                  Sign Up
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Navbar;
