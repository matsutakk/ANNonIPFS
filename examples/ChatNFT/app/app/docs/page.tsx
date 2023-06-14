export default function About() {
  return (
    <div className="flex">
      <aside id="sidebar-multi-level-sidebar" className="sm:hidden md:block fixed mt-14 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
        <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <ul className="space-y-2 font-medium">
              <li>
                  <a href="#overview" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="ml-3">Overview</span>
                  </a>
              </li>
              <li>
                  <a href="#technologies" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="ml-3">Technologies</span>
                  </a>
              </li>
              <li>
                  <a href="#source-code" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="ml-3">Source code</span>
                  </a>
              </li>
              <li>
                  <a href="#references" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="ml-3">References</span>
                  </a>
              </li>
            </ul>
        </div>
      </aside>
      
      <div className="h-full">
        <section id="overview" className="mb-8 sm:ml-72 mt-20">
          <h2 className="text-2xl font-bold mb-2">Overview</h2>
          <p>Overview details...</p>
        </section>
        <section id="technologies" className="mb-8 sm:ml-72">
          <h2 className="text-2xl font-bold mb-2">Technologies</h2>
          <p>Technologies details...</p>
        </section>
        <section id="source-code" className="mb-8 sm:ml-72">
          <h2 className="text-2xl font-bold mb-2">Source code</h2>
          <p>Source code details...</p>
        </section>
        <section id="references" className="mb-8 sm:ml-72">
          <h2 className="text-2xl font-bold mb-2">References</h2>
          <p>References details...</p>
        </section>
      </div>
    </div>
  );
}
