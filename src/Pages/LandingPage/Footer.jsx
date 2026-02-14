import { Twitter } from 'lucide-react';
import { Instagram } from 'lucide-react';
import { Linkedin } from 'lucide-react';
import { Youtube } from 'lucide-react';

export default function Footer() {
    return (
      <footer className=" text-white py-8 border-t-2 border-white/15">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {/* Left Section */}
          <div>
            <h2 className="text-xl font-bold">Arogya Health</h2>
            <p className="text-gray-400 mt-2">
              Your trusted healthcare companion for a better and healthier life.
            </p>
          </div>
  
          {/* Middle Section - Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
              <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
              <li><a href="#integrations" className="text-gray-400 hover:text-white">Integrations</a></li>
              <li><a href="#faqs" className="text-gray-400 hover:text-white">FAQs</a></li>
            </ul>
          </div>
  
          {/* Right Section - Socials */}
          <div>
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="mt-2 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white text-2xl"> <Twitter /></a>
              <a href="#" className="text-gray-400 hover:text-white text-2xl"><Instagram /></a>
              <a href="#" className="text-gray-400 hover:text-white text-2xl">  <Linkedin /></a>
              <a href="#" className="text-gray-400 hover:text-white text-2xl">  <Youtube /></a>
            </div>
          </div>
        </div>
  
        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-500 text-sm">
          &copy; 2025 Arogya Health. All rights reserved.
        </div>
      </footer>
    );
  }
  