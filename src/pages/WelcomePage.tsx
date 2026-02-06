<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import './WelcomePage.css';

export function WelcomePage() {
  const navigate = useNavigate();
  const logos = [
    { name: 'Kaduna State Government', url: '/1000491869.jpg', alt: 'Kaduna State Government Logo' },
    { name: 'Kaduna High Court', url: '/1000491875.jpg', alt: 'Kaduna High Court Logo' },
  ];

  return (
    <div className="welcome-page bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" aria-hidden />

      {/* Green accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-white to-green-600" aria-hidden />

      <div className="welcome-page__card welcome-page__card-inner bg-white rounded-2xl shadow-2xl relative z-10 border border-slate-100">
        <div className="welcome-page__card-body flex flex-col items-center text-center">
          {/* Logos */}
          <div className="welcome-page__logos">
            {logos.map((logo, index) => (
              <div
                key={index}
                className="welcome-page__logo-item group animate-in slide-in-from-top-8 duration-700"
                data-animation-delay={index * 150}
              >
                <div className="welcome-page__logo-box relative transition-transform duration-300 group-hover:scale-105 drop-shadow-md">
                  <img src={logo.url} alt={logo.alt} />
                </div>
                <p className="welcome-page__logo-label text-slate-600 font-semibold uppercase tracking-wider">
                  {logo.name}
                </p>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="welcome-page__content">
            <h1 className="welcome-page__title font-serif font-bold text-slate-900 uppercase">
              WELCOME TO THE DESIGN, DEVELOPMENT, AND EVALUATION OF AN INFORMATION MANAGEMENT SYSTEM FOR LEGAL PRACTICE
            </h1>
            <div className="welcome-page__divider" aria-hidden>
              <div className="welcome-page__divider-line bg-slate-300" />
              <div className="welcome-page__divider-dot bg-green-600" />
              <div className="welcome-page__divider-line bg-slate-300" />
            </div>
            <h2 className="welcome-page__subtitle text-slate-600 uppercase tracking-widest">
=======
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';
export function WelcomePage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

      {/* Green accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-600 via-white to-green-600"></div>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in duration-500 border border-slate-100">
        <div className="p-8 md:p-16 flex flex-col items-center text-center">
          {/* Logos Section */}
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 mb-16">
            {logos.map((logo, index) =>
            <div
              key={index}
              className="flex flex-col items-center gap-4 group animate-in slide-in-from-top-8 duration-700"
              style={{
                animationDelay: `${index * 150}ms`
              }}>

                <div className="h-24 w-24 md:h-32 md:w-32 relative transition-transform duration-500 group-hover:scale-105">
                  <img
                  src={logo.url}
                  alt={logo.alt}
                  className="h-full w-full object-contain drop-shadow-md" />

                </div>
                <p className="text-xs md:text-sm text-slate-600 font-semibold max-w-[140px] uppercase tracking-wider">
                  {logo.name}
                </p>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-slate-900 leading-tight tracking-tight uppercase">
              WELCOME TO THE DESIGN, DEVELOPMENT, AND EVALUATION OF AN
              INFORMATION MANAGEMENT SYSTEM FOR LEGAL PRACTICE
            </h1>

            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-16 bg-slate-300"></div>
              <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
              <div className="h-px w-16 bg-slate-300"></div>
            </div>

            <h2 className="text-lg md:text-xl font-medium text-slate-600 uppercase tracking-widest">
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
              (A CASE STUDY OF THE KADUNA STATE HIGH COURT JUDICIARY)
            </h2>
          </div>

<<<<<<< HEAD
          {/* CTA */}
          <div className="welcome-page__cta-wrap animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="welcome-page__cta-button group bg-green-600 hover:bg-green-700 border-none text-white"
            >
              click here to login
              <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" aria-hidden />
            </Button>
            <p className="welcome-page__cta-hint text-slate-400 font-medium tracking-wide">
=======
          {/* CTA Button */}
          <div className="mt-16 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-green-200 hover:bg-green-700 bg-green-600 border-none transition-all duration-300 group font-medium tracking-wide uppercase">

              click here to login
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="mt-4 text-xs text-slate-400 font-medium tracking-wide">
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
              SECURE JUDICIAL PORTAL
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* Footer */}
        <div className="welcome-page__footer bg-slate-50 text-center border-t border-slate-100">
          <p className="text-slate-400 font-medium tracking-wider">
=======
        {/* Footer decoration */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium tracking-wider">
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
            © 2024 KADUNA STATE JUDICIARY. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
<<<<<<< HEAD
    </div>
  );
}
=======
    </div>);

}
>>>>>>> 7c3b96b4dbd39a8d6f1d7eb0413ba4492ca45fb0
