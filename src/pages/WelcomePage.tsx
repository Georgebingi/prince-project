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
              (A CASE STUDY OF THE KADUNA STATE HIGH COURT JUDICIARY)
            </h2>
          </div>

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
              SECURE JUDICIAL PORTAL
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="welcome-page__footer bg-slate-50 text-center border-t border-slate-100">
          <p className="text-slate-400 font-medium tracking-wider">
            © 2024 KADUNA STATE JUDICIARY. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>);

}
