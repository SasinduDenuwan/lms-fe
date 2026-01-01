function LoadingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">

      {/* Main Content */}
      <div className="relative text-center">
        
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-teal-400 to-indigo-400 rounded-2xl blur-xl opacity-50"></div>
            <div className="relative bg-linear-to-br from-teal-500 to-indigo-500 p-5 rounded-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl font-bold mb-8 bg-linear-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
          NovaEdu
        </h1>
        
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <svg className="animate-spin h-12 w-12" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="url(#spinnerGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="80, 200"
            />
            <defs>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading your courses...</p>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage; 