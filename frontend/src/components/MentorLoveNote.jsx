import React from "react";
import CodeFictionImage from "../assets/pulp_fiction_recreated.png";

export default function MentorLoveNote() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-2xl overflow-hidden md:flex md:max-w-6xl mx-auto border border-slate-200">
      
      {/* Image Section - Full Image Display, No Cropping */}
      <div className="md:w-1/2 bg-slate-100 flex items-center justify-center p-8">
        <img
          src={CodeFictionImage}
          alt="Code Fiction: His Vision. My Code."
          className="rounded-xl shadow-lg object-contain w-full h-full max-h-[500px] transition-transform duration-300 hover:scale-[1.03]"
        />
      </div>

      {/* Text Section */}
      <div className="md:w-1/2 p-10 flex flex-col justify-center text-center md:text-left">
        <h2 className="text-3xl font-semibold text-slate-900 mb-6 font-serif">
          A Special Note from the Developer
        </h2>

        <p className="text-slate-700 leading-relaxed mb-4 text-[1.05rem]">
          The <span className="font-medium text-slate-900">X Scheduler</span> project was born from the ideas and vision of my amazing mentor. 
          What started as his spark of inspiration turned into reality through his constant guidance and belief in me.
        </p>

        <p className="text-slate-700 leading-relaxed mb-6 text-[1.05rem]">
          This small tribute — <span className="italic text-slate-900">“Code Fiction: His Vision. My Code.”</span> — 
          is my way of saying thank you for everything. Your mentorship made this journey of learning and building truly special.
        </p>

        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500 italic">
            — With deep respect and gratitude, <br />
            <span className="font-medium text-slate-600 not-italic">Edison S</span>
          </p>
        </div>
      </div>
    </div>
  );
}
