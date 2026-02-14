import handsomeman from "./handsomeman.png"


export default function Contact() {
    return (
      <section id="contact" className=" py-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center">
          <div className=" hidden md:flex md:w-1/2 ">
            <img
              src= {handsomeman}
              alt=""
              className="w-md max-w-sm md:max-w-md mx-auto"
            />
          </div>

 
          {/* Right - Text Content */}
          <div className="md:w-1/2 text-center md:text-left mt-8 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Contact Us And Start your journey to better <span className="text-[#1FBCF9]" >health</span>
            </h1>
            <p className="text-gray-600 mt-4">
              Tired of feeling sick? Get started with Arogya today and get the right medications for your symptoms.
            </p>

            {/* Input Field */}
            <div className="flex w-full max-w-sm items-center space-x-2 mt-3">
              {/* <Input type="email" placeholder="Email" /> */}
              {/* <Button type="submit" className=" bg-[#1FBCF9]">Subscribe</Button> */}
            </div>
          </div>
        </div>
      </section>
    );
  }
  