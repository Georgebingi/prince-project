import React from 'react';
export function LogoBanner() {
  const logos = [
  {
    name: 'Kaduna State Government',
    url: "/1000491869.jpg",
    alt: 'Kaduna State Government Logo'
  },
  {
    name: 'Kaduna High Court',
    url: "/1000491875.jpg",
    alt: 'Kaduna High Court Logo'
  }];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16">
          {logos.map((logo, index) =>
          <div
            key={index}
            className="flex flex-col items-center gap-2 group animate-in fade-in slide-in-from-top-4 duration-700"
            style={{
              animationDelay: `${index * 100}ms`
            }}>

              <div className="relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 flex items-center justify-center">
                <img
                src={logo.url}
                alt={logo.alt}
                className="h-full w-full object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-md" />

              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium text-center max-w-[100px] leading-tight transition-colors duration-300 group-hover:text-slate-900">
                {logo.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>);

}