import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to Our App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying our amazing platform. 
            Sign up today and get started!
          </p>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center">
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Sign Up</h3>
              <p className="text-gray-600">Create your account in just 30 seconds</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Login</h3>
              <p className="text-gray-600">Your data is protected with advanced security</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Powerful Dashboard</h3>
              <p className="text-gray-600">Access amazing features after login</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Sign Up
              </Link>
              <Link 
                href="/login" 
                className="bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg border border-blue-600 transition duration-200"
              >
                Sign In
              </Link>
            </div>
        </main>
      </div>
    </div>
  );
}