export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-gray-800">About</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-4">
            This is a Next.js Single Page Application (SPA) that demonstrates modern web development
            practices using React and Next.js.
          </p>
          <p className="text-gray-600 mb-4">
            Built with Next.js 14, this application uses the App Router for file-based routing,
            providing a seamless single-page experience while maintaining the benefits of
            server-side rendering and static site generation.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Next.js App Router with file-based routing</li>
            <li>Static export for SPA deployment</li>
            <li>Tailwind CSS for styling</li>
            <li>Responsive design</li>
            <li>Modern React patterns</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
