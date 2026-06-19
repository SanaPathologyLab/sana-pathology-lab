import React, { useState } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Calendar, User, Clock, ArrowRight, X } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: "Understanding Your Complete Blood Count (CBC) Report",
    excerpt: "A CBC test is one of the most common blood tests. Learn what your red blood cells, white blood cells, and platelets indicate about your health.",
    date: "June 12, 2026",
    readTime: "4 min read",
    author: "Dr. Sana, Director",
    content: `
A Complete Blood Count (CBC) is a standard blood test requested by physicians to evaluate your overall health and detect a wide range of disorders, including anemia, leukemia, and systemic infections. A CBC measures several critical components of your blood:

1. Red Blood Cells (RBCs): These cells carry oxygen from your lungs to the rest of your body. Low RBC count or low hemoglobin indicates anemia, which causes fatigue and weakness. High RBC count can occur in dehydration or cardiovascular disorders.
2. White Blood Cells (WBCs): WBCs are part of your immune system and fight infections. A high WBC count often suggests an active bacterial infection, inflammation, or stress. A low WBC count can indicate bone marrow issues or autoimmune conditions.
3. Platelets: These are cell fragments essential for blood clotting. A low platelet count (thrombocytopenia) can cause easy bruising or bleeding, while a high platelet count increases the risk of blood clots.

Understanding your CBC values helps monitor baseline wellness and acts as an early indicator for metabolic corrections. We recommend a baseline CBC screening at least once a year.
    `
  },
  {
    id: 2,
    title: "Thyroid Profile (T3, T4, TSH) Explained",
    excerpt: "Struggling with unexplained weight changes or fatigue? Your thyroid might be the cause. Learn about Hyperthyroidism vs Hypothyroidism.",
    date: "June 08, 2026",
    readTime: "5 min read",
    author: "Dr. Sana, Director",
    content: `
The thyroid is a butterfly-shaped gland located in the front of your neck. It produces hormones that regulate metabolism, heart rate, temperature, and energy levels. A Thyroid Profile test measures three key markers:

1. Triiodothyronine (T3) and Thyroxine (T4): The active hormones produced by the thyroid gland.
2. Thyroid Stimulating Hormone (TSH): Produced by the pituitary gland, TSH signals your thyroid to produce T3 and T4.

Common Thyroid Disorders:
- Hypothyroidism (Underactive Thyroid): Occurs when T3 and T4 are low, causing the pituitary to produce high levels of TSH. Symptoms include fatigue, weight gain, constipation, dry skin, and sensitivity to cold.
- Hyperthyroidism (Overactive Thyroid): Occurs when T3 and T4 are high, suppressing TSH production. Symptoms include rapid heart rate, weight loss, anxiety, hand tremors, and heat intolerance.

Testing your thyroid profile is crucial for managing unexplained energy loss or metabolic fluctuations. A simple blood test is all it takes to evaluate your thyroid function.
    `
  },
  {
    id: 3,
    title: "The Importance of HbA1c in Managing Diabetes",
    excerpt: "Unlike daily finger-prick blood sugar tests, the HbA1c test gives a 3-month average of your blood glucose levels. Here is why it is the gold standard.",
    date: "May 28, 2026",
    readTime: "4 min read",
    author: "Dr. Sana, Director",
    content: `
If you are monitoring diabetes or insulin resistance, you are likely familiar with daily fasting blood sugar tests. While helpful, these tests represent a single point in time. The HbA1c (Glycosylated Hemoglobin) test measures the percentage of hemoglobin coated with sugar, providing an average blood glucose level over the past 8 to 12 weeks.

Why HbA1c is the Gold Standard:
- Accuracy: It is not affected by short-term changes, such as what you ate the night before or stress on the day of the test.
- Convenience: No fasting is required. You can have this test done at any time of the day.
- Risk Assessment: Studies show that keeping your HbA1c level below 7% significantly reduces the risk of long-term diabetes complications, such as neuropathy, retinopathy, and kidney damage.

A normal HbA1c level is below 5.7%. A level between 5.7% and 6.4% indicates prediabetes, and 6.5% or higher indicates diabetes.
    `
  },
  {
    id: 4,
    title: "Fasting Guidelines for Lab Tests: What You Need to Know",
    excerpt: "Fasting for a blood test involves more than just skipping breakfast. Learn why fasting is critical and how to fast correctly for accurate results.",
    date: "May 15, 2026",
    readTime: "3 min read",
    author: "Dr. Sana, Director",
    content: `
Fasting before certain blood tests is absolutely critical for accuracy. Eating and drinking before a test introduces nutrients, sugars, and fats into your bloodstream, which can temporarily alter parameters like glucose and cholesterol levels.

Key Fasting Guidelines:
1. Duration: Most fasting tests (e.g., Fasting Blood Sugar, Lipid Profile) require 8 to 12 hours of fasting. Do not fast for more than 14 hours, as prolonged starvation can also skew results.
2. What to Drink: Only plain water is allowed during the fasting period. Do not drink juice, soda, tea, coffee, or alcohol. Avoid smoking, as nicotine can affect blood glucose levels.
3. Medication: Continue taking prescription medications unless your physician explicitly directs you otherwise. Let your collection technician know about any medications you have taken.

Following correct fasting protocols prevents false highs or lows, ensuring your diagnostic reports reflect your true physiological baseline.
    `
  },
  {
    id: 5,
    title: "How Regular Health Checkups Can Identify Silent Illnesses",
    excerpt: "Hypertension, high cholesterol, and prediabetes often develop without any visible symptoms. Discover the power of preventative healthcare.",
    date: "May 02, 2026",
    readTime: "5 min read",
    author: "Dr. Sana, Director",
    content: `
Many chronic diseases develop slowly over several years without causing any pain or noticeable symptoms. These silent illnesses, such as hypertension (high blood pressure), hypercholesterolemia (high cholesterol), and prediabetes, are often only diagnosed during routine screenings.

Preventative Care Benefits:
- Early Detection: Diagnosing conditions in their pre-clinical stages allows for simple lifestyle adjustments (diet, exercise) to reverse the damage, avoiding lifetime medication dependency.
- Baseline Tracking: Having regular test reports gives you a baseline to compare against in the future.
- Peace of Mind: Knowing your kidney, liver, and cardiac markers are normal provides reassurance for you and your family.

Investing in a yearly basic checkup package is one of the most effective decisions you can make for your long-term well-being and health span.
    `
  }
];

const Blog = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  return (
    <PublicLayout>
      <div className="bg-[#F5F7F6] min-h-screen py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-black uppercase px-4 py-1.5 rounded-full border border-[#1D9E75]/20 tracking-wider inline-block">
              Sana Wellness Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-heading text-[#085041] tracking-tight">
              Health Tips & Insights
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Read expert advice on diagnostic tests, health indicators, and lifestyle updates written by our laboratory team.
            </p>
          </div>

          {/* Grid of Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ARTICLES.map(article => (
              <div 
                key={article.id} 
                className="bg-white rounded-3xl border border-slate-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group cursor-pointer"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="p-6 space-y-4">
                  {/* Meta info */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {article.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={13} /> {article.readTime}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 leading-tight group-hover:text-[#1D9E75] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
                
                <div className="p-6 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1"><User size={13} /> {article.author}</span>
                  <span className="text-[#1D9E75] font-black uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read More <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Article Reading Modal */}
          {selectedArticle && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                  <div className="space-y-1 pr-6">
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>{selectedArticle.date}</span>
                      <span>•</span>
                      <span>{selectedArticle.readTime}</span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800">{selectedArticle.title}</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedArticle(null)} 
                    className="p-2 text-gray-400 hover:bg-slate-100 hover:text-gray-700 rounded-xl transition-all shadow-sm shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-8 overflow-y-auto flex-1 text-slate-700 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
                
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold px-8">
                  <span>Written by: {selectedArticle.author}</span>
                  <span>Sana Pathology Diagnostics Center</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PublicLayout>
  );
};

export default Blog;
