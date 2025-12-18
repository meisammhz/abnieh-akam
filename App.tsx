import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import InputSidebar from './components/InputSidebar';
import Dashboard from './components/Dashboard';
import ProposalView from './components/ProposalView';
import PdfDashboard from './components/PdfDashboard';
import PdfReport from './components/PdfReport';
import { ProjectInputs, ProposalContent, ViewMode, AnalysisSection } from './types';
import { generateProposalContent, suggestConstructionPhases } from './services/geminiService';

const INITIAL_INPUTS: ProjectInputs = {
  projectName: 'پروژه نارنجستان ۷',
  companyLogo: '',
  facadeImage: '',
  
  // Areas & Dimensions
  landArea: 18500,
  parkingOccupancyPercentage: 80, 
  groundFloorOccupancyPercentage: 60,
  residentialOccupancyPercentage: 40, 
  
  grossTotalArea: 55000,
  netResidentialArea: 41000,
  netCommercialArea: 7000,
  
  // Structure
  floors: 13,
  undergroundFloors: 4, 
  blocks: 3,
  constructionType: 'Concrete',
  landCondition: 'Normal',
  facade: 'تلفیقی مدرن (کرتین وال و سنگ)',
  
  // Timing & Costs
  elapsedMonths: 0,
  constructionPhases: [
    { id: 1, name: 'گودبرداری و فونداسیون', durationMonths: 9, costPerMeter: 18000000 },
    { id: 2, name: 'اسکلت و سقف‌ها', durationMonths: 12, costPerMeter: 28000000 },
    { id: 3, name: 'سفت‌کاری و نما', durationMonths: 12, costPerMeter: 24000000 },
    { id: 4, name: 'نازک‌کاری و تاسیسات', durationMonths: 9, costPerMeter: 15000000 },
  ],
  
  // Sales
  unitShareSize: 10,
  unitSharePrice: 630000000, // Legacy, cost is now based on installments
  installments: [
    { id: 1, name: 'پرداخت اولیه (زمین و تراکم)', amount: 680000000, dueMonth: 0 },
    { id: 2, name: 'شروع اسکلت', amount: 250000000, dueMonth: 9 },
    { id: 3, name: 'اتمام سفت‌کاری', amount: 250000000, dueMonth: 21 },
    { id: 4, name: 'شروع نازک‌کاری', amount: 200000000, dueMonth: 33 },
    { id: 5, name: 'تحویل واحد', amount: 150000000, dueMonth: 42 },
  ],
  secondPaymentDate: '1403/12/20',
  additionalFee: 50000000,
  unitMix: [
    { size: '۶۰-۸۰ متر', percentage: 30 },
    { size: '۸۰-۱۰۰ متر', percentage: 45 },
    { size: '۱۰۰-۱۲۰ متر', percentage: 25 },
  ],
  
  // Scenarios
  constructionQuality: 'Luxury',
  pessimisticMarketGrowth: 25,
  optimisticMarketGrowth: 45,
  constructionCostEscalation: 30,

  // Overheads
  adminOverheadPercentage: 15,
  salesCommissionPercentage: 3,

  // Market & Strategic Analysis
  marketPricePerMeter: 250000000,
  projectVibe: "یک برج باغ مدرن و لوکس در قلب یکی از اصیل‌ترین و آرام‌ترین محله‌های غرب تهران، طراحی شده برای خانواده‌هایی که به دنبال ترکیبی از آرامش، دسترسی شهری و امکانات رفاهی کامل هستند.",
  locationAdvantages: "دسترسی به مترو صادقیه (۵ دقیقه), نزدیکی به مرکز خرید هایپراستار باکری, فاصله کوتاه تا فرودگاه مهرآباد, بافت شهری اصیل و آرام, مجاورت با پارک ارم و فضای سبز, دسترسی سریع به بزرگراه حکیم و ستاری",
  
  // Descriptions
  location: 'تهران، منطقه ۵، بلوار فردوس غرب، بلوار بهار جنوبی',
  access: 'دسترسی سریع و چندجهته به شریان‌های اصلی غرب تهران شامل بزرگراه‌های حکیم، ستاری، باکری و تهران-کرج',
  projectDescription: 'این پروژه عظیم شامل ۵۵۰۰۰ متر مربع فضای مفید است که ۷۰۰۰ متر آن تجاری (متعلق به مالک زمین) و ۴۸۰۰۰ متر آن مسکونی می‌باشد. پروژه به صورت مستقل توسط شرکت تعاونی عمرانی نوین ساز ابنیه آکام اجرا می‌شود. واگذاری در فاز اول به صورت امتیاز سهام‌های ۱۰ متری با قیمت قطعی ۶۸۰ میلیون تومان (بابت زمین و تراکم مفید - متری ۶۸ میلیون) انجام می‌شود. هزینه ساخت نیز به صورت علی‌الحساب متری ۷۰ میلیون تومان برآورد شده است که مجموع هزینه پایه را به ۱۳۸ میلیون تومان می‌رساند.',
  architectureStyle: 'معماری مدرن و پایدار با استفاده از سیستم‌های هوشمند BMS، دارای لابی مجلل هتلی، روف گاردن ۳۶۰ درجه و فضاهای سبز عمودی.',
  commonAmenities: 'مجموعه آبی کامل (استخر، سونا، جکوزی)، سالن بدنسازی مجهز، سالن اجتماعات چندمنظوره، مهدکودک اختصاصی، سینما، کارواش و خشکشویی مرکزی.',
  builderResume: 'شرکت تعاونی عمرانی نوین ساز ابنیه آکام، سازنده تخصصی و مستقل بدون مشارکت پیمانکار ثالث، با سابقه درخشان در انبوه سازی منطقه ۲۲ تهران.',
  constructionDescription: 'عملیات ساخت با رعایت کامل مقررات ملی ساختمان و با استفاده از به‌روزترین تکنولوژی‌های صنعتی‌سازی انجام خواهد شد. نظارت دقیق و کنترل کیفیت مصالح در تمامی مراحل از اولویت‌های اصلی پروژه است.',
  facadeDescription: 'نمای پروژه با الهام از معماری مدرن اروپایی، ترکیبی هوشمندانه از سنگ تراورتن عباس‌آباد و پنل‌های کرتین وال با شیشه‌های لمینت دوجداره است که علاوه بر زیبایی بصری، عایق کامل حرارتی و صوتی را فراهم می‌آورد.',
  coreShellDescription: 'سازه بتنی پروژه با سیستم سقف وافل دوطرفه اجرا می‌شود که علاوه بر ایجاد دهانه‌های بزرگ و حذف ستون‌های مزاحم در پارکینگ و فضاهای داخلی، مقاومت بسیار بالایی در برابر زلزله دارد.',

  // Technical Details
  foundationSystem: "فونداسیون رادیه ژنرال (گسترده)",
  roofSystem: "سقف وافل دوطرفه",
  interiorFinishes: "دیوارها کناف با رنگ‌آمیزی درجه یک، کف سرامیک پرسلان سایز بزرگ، شیرآلات توکار برند KWC",
  hvacSystem: "سیستم سرمایش و گرمایش مرکزی با چیلر و فن‌کویل",
  electricalSystem: "سیستم برق هوشمند (BMS) با قابلیت کنترل از راه دور، کلید و پریز برند Schneider",
};

const EMPTY_ANALYSIS: AnalysisSection = {
  text: "در انتظار تحلیل...",
  image: "",
  imagePrompt: "",
};

const INITIAL_CONTENT: ProposalContent = {
  executiveSummary: "برای مشاهده تحلیل جامع، لطفاً اطلاعات پروژه را در سایدبار تنظیم کرده و روی دکمه 'بروزرسانی پروپوزال' کلیک کنید.",
  architecturalDeepDive: "در انتظار تحلیل...",
  locationAndAccessAnalysis: "در انتظار تحلیل...",
  financialModelAndProfitability: "در انتظار تحلیل...",
  investorValueProposition: "در انتظار تحلیل...",
  riskAndMitigation: "در انتظار تحلیل...",
  conceptualImage: "",
  conceptualImagePrompt: "",
  investorAnalysis: EMPTY_ANALYSIS,
  cooperativeAnalysis: EMPTY_ANALYSIS,
};

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
  const [inputs, setInputs] = useState<ProjectInputs>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dataParam = params.get('data');
      if (dataParam) {
        const decoded = decodeState(dataParam);
        if (decoded) {
          const mergedInputs = { ...INITIAL_INPUTS, ...decoded };
          // For backward compatibility with old shared links
          if (('totalArea' in decoded) && !('netResidentialArea' in decoded)) {
              mergedInputs.netResidentialArea = (decoded as any).totalArea - ((decoded as any).commercialArea || 0);
          }
          if (('commercialArea' in decoded) && !('netCommercialArea' in decoded)) {
              mergedInputs.netCommercialArea = (decoded as any).commercialArea;
          }

          if (decoded.constructionPhases) {
              mergedInputs.constructionPhases = decoded.constructionPhases;
          }
          if (decoded.unitMix) {
            mergedInputs.unitMix = decoded.unitMix;
          }
           if (decoded.installments) {
            mergedInputs.installments = decoded.installments;
          }
          return mergedInputs;
        }
      }
    }
    return INITIAL_INPUTS;
  });

  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [proposalContent, setProposalContent] = useState<ProposalContent>(INITIAL_CONTENT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    setViewMode(ViewMode.PROPOSAL);
    setProposalContent({
      ...INITIAL_CONTENT,
      executiveSummary: "در حال تولید تحلیل متنی و ساخت تصاویر مفهومی توسط هوش مصنوعی...",
      conceptualImage: proposalContent.conceptualImage, // Keep old image while generating
    });
    try {
      const newContent = await generateProposalContent(inputs);
      setProposalContent(newContent);
    } catch (e) {
      alert("خطا در ارتباط با هوش مصنوعی");
      setProposalContent(INITIAL_CONTENT);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestPhases = async () => {
    setIsSuggesting(true);
    try {
        const suggestedPhases = await suggestConstructionPhases(inputs);
        if (suggestedPhases.length > 0) {
            setInputs(prev => ({...prev, constructionPhases: suggestedPhases}));
        } else {
            alert("هوش مصنوعی نتوانست فازبندی مناسبی پیشنهاد دهد. لطفا مجددا تلاش کنید.");
        }
    } catch(e) {
        alert("خطا در دریافت پیشنهاد فازبندی از هوش مصنوعی.");
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleShare = () => {
    const encoded = encodeState(inputs);
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('لینک کپی شد!');
    }).catch(err => {
      prompt("لینک:", url);
    });
  };

  const handleExportPDF = async () => {
    setIsDownloading(true);
    try {
      let doc;
      let filename = 'project.pdf';

      if (viewMode === ViewMode.DASHBOARD) {
        doc = <PdfDashboard inputs={inputs} />;
        filename = `${inputs.projectName}-dashboard.pdf`;
      } else {
        doc = <PdfReport inputs={inputs} content={proposalContent} />;
        filename = `${inputs.projectName}-proposal.pdf`;
      }

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Generation failed', err);
      alert('خطا در تولید فایل PDF. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    // "print:h-auto print:overflow-visible print:block" forces the container to expand fully on paper
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden app-container print:h-auto print:overflow-visible print:block">
      
      <div className="input-sidebar no-print print:hidden">
        <InputSidebar 
          inputs={inputs} 
          setInputs={setInputs} 
          onGenerate={handleGenerateProposal}
          isGenerating={isGenerating}
          onSuggestPhases={handleSuggestPhases}
          isSuggesting={isSuggesting}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative content-wrapper print:h-auto print:overflow-visible print:block">
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center shadow-sm shrink-0 z-20 print:border-none print:shadow-none">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-akam-600 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden shadow-md print:shadow-none">
               {inputs.companyLogo ? (
                 <img src={inputs.companyLogo} alt="Logo" className="w-full h-full object-cover" />
               ) : <span className="text-xl">آ</span>}
             </div>
             <div>
               <h1 className="text-sm font-bold text-gray-800">سامانه مدیریت پروژه {inputs.projectName}</h1>
               <p className="text-[10px] text-gray-500">شرکت تعاونی عمرانی نوین ساز ابنیه آکام</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 no-print print:hidden">
            <button 
              onClick={handleExportPDF} 
              disabled={isDownloading}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-colors shadow-sm ${isDownloading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isDownloading ? (
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                )}
                {isDownloading ? 'در حال تولید فایل...' : (viewMode === ViewMode.DASHBOARD ? 'دانلود PDF داشبورد' : 'دانلود PDF پروپوزال')}
            </button>
            <button onClick={handleShare} className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-akam-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              اشتراک‌گذاری
            </button>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode(ViewMode.DASHBOARD)} className={`px-4 py-2 text-xs rounded-md transition-all ${viewMode === ViewMode.DASHBOARD ? 'bg-white shadow text-akam-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>داشبورد</button>
              <button onClick={() => setViewMode(ViewMode.PROPOSAL)} className={`px-4 py-2 text-xs rounded-md transition-all ${viewMode === ViewMode.PROPOSAL ? 'bg-white shadow text-akam-700 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>پروپوزال</button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 scroll-smooth main-content print:h-auto print:overflow-visible print:block print:p-0">
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