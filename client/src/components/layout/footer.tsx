import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-8 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Lorg<span className="text-primary">X</span>
            </h2>
            <p className="text-gray-300">
              Discover, Book, and Socialize at the Most Exciting Events, All in One Place.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/events">
                  <a className="text-gray-300 hover:text-white">Events</a>
                </Link>
              </li>
              <li>
                <Link href="/events?filter=places">
                  <a className="text-gray-300 hover:text-white">Places</a>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <a className="text-gray-300 hover:text-white">Communities</a>
                </Link>
              </li>
              <li>
                <Link href="/create-event">
                  <a className="text-gray-300 hover:text-white">Create Event</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} LorgX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
