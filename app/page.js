import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-800">
          Welcome to Next.js SPA
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern single-page application built with Next.js, React, and Tailwind CSS
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/about"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Learn More
          </Link>
          <Link
            href="/contact"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Get in Touch
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold mb-2">Fast</h3>
          <p className="text-gray-600">
            Optimized performance with Next.js static generation and modern React features.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">Modern</h3>
          <p className="text-gray-600">
            Built with the latest Next.js App Router and Tailwind CSS for beautiful designs.
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">Scalable</h3>
          <p className="text-gray-600">
            Clean architecture ready to scale with your application needs.
          </p>
        </div>
      </div>
    </div>
  )
}
