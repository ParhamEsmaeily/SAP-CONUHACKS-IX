import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            WildFire Monitor
          </Link>
          <div className="flex space-x-6">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/analysis" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Analysis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;