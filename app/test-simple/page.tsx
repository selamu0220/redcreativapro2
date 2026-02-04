export default function TestSimplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p className="text-lg">If you can see this, the deployment is working!</p>
        <div className="mt-8">
          <a href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go to Home
          </a>
        </div>
      </div>
    </div>
  )
}
