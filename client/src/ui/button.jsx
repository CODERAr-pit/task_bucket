export default function DomainName({ domainName = "Loading..." }) {
  const handleNavigation = () => {
    if (domainName && domainName !== "Loading...") {
      // handle navigation using react-router or we will talk about this later about what to do ......
    }
  };

  return (
    <nav className="flex justify-center items-center w-full bg-gray-100 p-4">
      <button 
        onClick={handleNavigation}
        disabled={!domainName || domainName === "Loading..."}
        className={`px-4 py-2 rounded transition-colors ${
          !domainName || domainName === "Loading..."
            ? 'bg-slate-400 text-gray-200 cursor-not-allowed' 
            : 'bg-slate-800 text-white hover:bg-slate-700 cursor-pointer'
        }`}
      >
        {domainName}
      </button>
    </nav>
  );
}
