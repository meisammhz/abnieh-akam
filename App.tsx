import React, { useState, useEffect } from 'react';
import InputSidebar from './components/InputSidebar';
import Dashboard from './components/Dashboard';
import ProposalView from './components/ProposalView';
import { ProjectInputs, ProposalContent, ViewMode } from './types';
import { generateProposalContent } from './services/geminiService';

const INITIAL_INPUTS: ProjectInputs = {
  projectName: 'نارنجستان ۷',
  companyLogo: 'https://via.placeholder.com/500x150/ffffff/16a34a?text=NOVIN+SAZ+ABNIEH+AKAM+Co.',
  
  // Areas
  landArea: 10000, 
  parkingOccupancyPercentage: 81.5, 
  residentialOccupancyPercentage: 45, 
  
  grossTotalArea: 85000, 
  totalArea: 55000, 
  commercialArea: 5000, 
  
  // Structure
  floors: 12,
  blocks: 4, 
  constructionType: 'بتنی',
  facade: 'تلفیقی مدرن',
  
  // Timing & Costs
  durationMonths: 42,
  elapsedMonths: 6, // Default progress
  constructionCostPerMeter: 70000000, // Ali-al-hesab
  baseConstructionCost: 55000000,
  
  // Sales
  unitShareSize: 10,
  unitSharePrice: 650000000, // 650 Million Toman Total (65m per meter)
  secondPaymentDate: '1403/12/20', // Default date for second payment
  additionalFee: 0,
  
  // Scenarios
  constructionQuality: 'SuperLuxury',
  pessimisticGrowth: 35,
  optimisticGrowth: 65,
  
  // Description
  location: 'تهران، منطقه ۵، بلوار فردوس غرب',
  access: 'دسترسی سریع به بزرگراه حکیم، ستاری و باکری، نزدیکی به مترو ارم سبز',
  projectDescription: 'پروژه لوکس نارنجستان ۷ شامل ۵ طبقه منفی پارکینگ، پودیوم تجاری/لابی با سطح اشغال ۸۱۵۰ متر و برج‌های مسکونی.',
  architectureStyle: 'معماری مدرن با رویکرد سبز، طراحی پودیوم یکپارچه و لابی هتلینگ با سقف مرتفع.',
  commonAmenities: 'لابی مجلل، سالن اجتماعات، سالن ورزش، استخر و سونا، روف گاردن، کارواش اختصاصی، سیستم هوشمند BMS.',
  builderResume: 'شرکت تعاونی عمرانی نوین ساز ابنیه آکام با سابقه درخشان در ساخت پروژه‌های موفق نارنجستان.',
};

const INITIAL_CONTENT: ProposalContent = {
  executiveSummary: "پروژه نارنجستان ۷ در یکی از بهترین نقاط منطقه ۵ تهران (بلوار فردوس غرب) واقع شده است. سازه شامل ۵ طبقه منفی پارکینگ و تاسیسات، یک طبقه همکف پودیوم با مساحت ۸۱۵۰ متر مربع و بلوک‌های مسکونی ۱۲ طبقه متصل به هم بر روی پودیوم می‌باشد.",
  locationAnalysis: "منطقه ۵ تهران به دلیل بافت مدرن، خیابان‌کشی اصولی و دسترسی فوق‌العاده به شریان‌های اصلی غرب تهران، یکی از پرتقاضاترین مناطق برای سکونت و سرمایه‌گذاری است. موقعیت پروژه دسترسی عالی به بزرگراه‌ها و مراکز خرید را فراهم می‌کند.",
  financialOutlook: "با توجه به قیمت زمین در این منطقه و تراکم مفید پروژه، ارزش افزوده سهام پس از تکمیل اسکلت و سفت‌کاری جهش قابل توجهی خواهد داشت. پیش‌بینی بازدهی سرمایه در این پروژه بیش از ۶۰٪ نسبت به تورم عمومی مسکن است.",
  architecturalVision: "معماری پروژه بر اساس اتصال بلوک‌ها بر روی یک پودیوم عظیم طراحی شده است. لابی با سقف بلند، فضایی هتلینگ و بی‌نظیر را ایجاد می‌کند. ۵ طبقه پارکینگ منفی نیاز تمام واحدها و بخش تجاری را تامین می‌نماید.",
  riskAssessment: "هزینه ساخت متری ۷۰ میلیون تومان به‌صورت علی‌الحساب بوده و تغییرات نرخ تورم و مصالح در مجمع عمومی سالانه بررسی و لحاظ می‌گردد."
};

// Helper functions for URL encoding/decoding of state (Handling Persian characters)
const encodeState = (state: ProjectInputs): string => {
  try {
    const json = JSON.stringify(state);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.error("Error encoding state", e);
    return "";
  }
};

const decodeState = (encoded: string): Partial<ProjectInputs> | null => {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch (e) {
    console.error("Error decoding state", e);
    return null;
  }
};

const App: React.FC = () => {
  // Initialize state from URL if present, otherwise use defaults
  const [inputs, setInputs] = useState<ProjectInputs>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dataParam = params.get('data');
      if (dataParam) {
        const decoded = decodeState(dataParam);
        if (decoded) {
          return { ...INITIAL_INPUTS, ...decoded };
        }
      }
    }
    return INITIAL_INPUTS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [proposalContent, setProposalContent] = useState<ProposalContent>(INITIAL_CONTENT);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      const newContent = await generateProposalContent(inputs);
      setProposalContent(newContent);
      setViewMode(ViewMode.PROPOSAL);
    } catch (e) {
      alert("خطا در ارتباط با هوش مصنوعی");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    const encoded = encodeState(inputs);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('لینک اختصاصی این پروژه کپی شد!\nمی‌توانید آن را برای دیگران ارسال کنید تا دقیقاً همین تنظیمات را مشاهده کنند.');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      prompt("لطفا لینک زیر را کپی کنید:", url);
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Controls - Right Side */}
      <InputSidebar 
        inputs={inputs} 
        setInputs={setInputs} 
        onGenerate={handleGenerateProposal}
        isGenerating={isGenerating}
      />

      {/* Main Content - Left Side */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-akam-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
               {inputs.companyLogo ? (
                 <img src={inputs.companyLogo} alt="Logo" className="w-full h-full object-cover" />
               ) : "A"}
             </div>
             <div>
               <h1 className="text-sm font-bold text-gray-800">داشبورد مدیریت پروژه {inputs.projectName}</h1>
               <p className="text-xs text-gray-500">شرکت تعاونی عمرانی نوین ساز ابنیه آکام</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-akam-600 transition-colors"
              title="اشتراک‌گذاری لینک پروژه"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">اشتراک‌گذاری</span>
            </button>

            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode(ViewMode.DASHBOARD)}
                className={`px-4 py-2 text-sm rounded-md transition-all ${viewMode === ViewMode.DASHBOARD ? 'bg-white shadow text-akam-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                داشبورد و تحلیل
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.PROPOSAL)}
                className={`px-4 py-2 text-sm rounded-md transition-all ${viewMode === ViewMode.PROPOSAL ? 'bg-white shadow text-akam-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
              >
                پیش‌نمایش پروپوزال
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 scroll-smooth">
          {viewMode === ViewMode.DASHBOARD ? (
            <Dashboard inputs={inputs} />
          ) : (
            <ProposalView inputs={inputs} content={proposalContent} />
          )}
        </main>

      </div>
    </div>
  );
};

export default App;