/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  Target, 
  Clock, 
  Menu, 
  X,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Loader2,
  Globe
} from 'lucide-react';
import Admin from './Admin';

// --- Language Context ---
type Language = 'en' | 'ar';
interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
}
const LanguageContext = createContext<LanguageContextType>({ lang: 'en', toggleLang: () => {} });

export const useLanguage = () => useContext(LanguageContext);

// --- Components ---

const Logo = () => (
  <div className="flex items-center justify-center">
    <img src="/logo.png" alt="EZD MEDIA" className="h-10 md:h-12 w-auto object-contain" />
  </div>
);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: lang === 'ar' ? 'الخدمات' : 'Services', href: '#services' },
    { name: lang === 'ar' ? 'أعمالنا' : 'Portfolio', href: '#portfolio' },
    { name: lang === 'ar' ? 'المميزات' : 'Features', href: '#features' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-md border-white/10 py-4' 
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <a href="#" className="relative z-50">
          <Logo />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button onClick={toggleLang} className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            <Globe size={16} /> {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <a 
            href="#contact"
            className="px-5 py-2.5 rounded-full bg-white text-black font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          </a>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4 relative z-50">
          <button onClick={toggleLang} className="text-gray-300 hover:text-white">
            <Globe size={20} />
          </button>
          <button 
            className="text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 w-full h-screen bg-black flex flex-col items-center justify-center gap-8 z-40"
            >
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-heading font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-8 py-4 mt-4 rounded-full bg-white text-black font-medium text-lg hover:bg-gray-200 transition-colors"
              >
                Contact Us
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

const Hero = () => {
  const { lang } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ezd-blue/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ezd-green/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-ezd-green animate-pulse"></span>
            {lang === 'ar' ? 'مخصص لتوسيع الوكالات' : 'Dedicated to Scaling Agencies'}
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold tracking-tight mb-6 leading-[1.1]">
            {lang === 'ar' ? 'نموك، ' : 'Your Growth, '} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
              {lang === 'ar' ? 'بواسطة EZDMEDIA.' : 'Engineered by EZDMEDIA.'}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {lang === 'ar' 
              ? 'تطوير ويب عالي الأداء وإدارة استراتيجية لوسائل التواصل الاجتماعي مصممة حصريًا للوكالات الخدمية الاحترافية.' 
              : 'High-Performance Web Development & Strategic Social Media Management designed exclusively for professional service agencies.'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="#contact"
              className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-base overflow-hidden transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <span className="relative z-10">{lang === 'ar' ? 'حسّن وكالتك' : 'Optimize Your Agency'}</span>
              <ArrowRight size={18} className={`relative z-10 transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </a>
            <a 
              href="#portfolio"
              className="px-8 py-4 bg-transparent text-white border border-white/20 rounded-full font-medium text-base hover:bg-white/5 transition-colors w-full sm:w-auto justify-center flex"
            >
              {lang === 'ar' ? 'شاهد أعمالنا' : 'View Our Work'}
            </a>
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
      >
        <span className="text-xs uppercase tracking-widest">{lang === 'ar' ? 'تمرير' : 'Scroll'}</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
      </motion.div>
    </section>
  );
};

const Services = () => {
  const { lang } = useLanguage();
  return (
    <section id="services" className="py-32 relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-20 md:w-2/3">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">{lang === 'ar' ? 'قدراتنا' : 'Capabilities'}</h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            {lang === 'ar' 
              ? 'نحن لا نقوم فقط ببناء مواقع الويب أو النشر على وسائل التواصل الاجتماعي. نحن نصمم أنظمة رقمية تدفع نموًا قابلاً للقياس لوكالتك.' 
              : 'We don\'t just build websites or post on social media. We engineer digital ecosystems that drive measurable growth for your agency.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Web Dev Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="group relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden hover:border-ezd-blue/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-ezd-blue/5 rounded-full blur-[80px] group-hover:bg-ezd-blue/10 transition-colors"></div>
            
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-ezd-blue">
              <Code2 size={28} />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">{lang === 'ar' ? 'تطوير ويب مخصص' : 'Custom Web Development'}</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {lang === 'ar' 
                ? 'بناء مواقع ويب سريعة تركز على التحويل وتعكس مكانة وكالتك. تصميم متوافق مع الجوال، بنية تحتية آمنة، وتدفقات تجربة مستخدم محسنة.' 
                : 'Building high-speed, conversion-focused websites that reflect your agency’s prestige. Mobile-first design, secure infrastructure, and optimized UX flows.'}
            </p>
            
            <ul className="space-y-4">
              {(lang === 'ar' ? ['أوقات تحميل سريعة', 'واجهة/تجربة مستخدم حديثة', 'بوابات عملاء آمنة'] : ['Fast Load Times', 'Modern UI/UX', 'Secure Client Portals']).map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 size={18} className="text-ezd-blue" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* SMM Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 overflow-hidden hover:border-ezd-green/50 transition-colors"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-ezd-green/5 rounded-full blur-[80px] group-hover:bg-ezd-green/10 transition-colors"></div>
            
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 text-ezd-green">
              <TrendingUp size={28} />
            </div>
            
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">{lang === 'ar' ? 'إدارة وسائل التواصل الاجتماعي' : 'Strategic Social Media'}</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              {lang === 'ar' 
                ? 'استراتيجيات تعتمد على البيانات لبناء السلطة وتوليد عملاء محتملين مؤهلين. إنشاء محتوى، إدارة المجتمع، وحملات مستهدفة.' 
                : 'Data-driven strategies designed to turn visits into leads. Consistent branding, targeted content creation, and active engagement for growth.'}
            </p>
            
            <ul className="space-y-4">
              {(lang === 'ar' ? ['محتوى مستهدف', 'استراتيجية تفاعل', 'تحليلات الأداء'] : ['Targeted Content', 'Engagement Strategy', 'Performance Analytics']).map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                  <CheckCircle2 size={18} className="text-ezd-green" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Portfolio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setProjects(data);
        } else {
          // Fallback data if DB is empty
          setProjects([
            {
              name: "Cleopatra Holidays",
              name_ar: "عطلات كليوباترا",
              category: "Travel Agency",
              category_ar: "وكالة سفر",
              features: "Custom Booking System, High-Speed CDN, SEO Optimized",
              features_ar: "نظام حجز مخصص، شبكة توصيل محتوى سريعة، تحسين محركات البحث",
              image_url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop",
            },
            {
              name: "Apex Financial",
              name_ar: "أبيكس المالية",
              category: "Wealth Management",
              category_ar: "إدارة الثروات",
              features: "Secure Client Portal, Real-time Data Visualization, Lead Generation Funnel",
              features_ar: "بوابة عملاء آمنة، تصور البيانات في الوقت الفعلي، مسار توليد العملاء المحتملين",
              image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
            },
            {
              name: "Meridian Real Estate",
              name_ar: "ميريديان للعقارات",
              category: "Luxury Property",
              category_ar: "عقارات فاخرة",
              features: "3D Virtual Tours, Advanced Property Search, CRM Integration",
              features_ar: "جولات افتراضية ثلاثية الأبعاد، بحث متقدم عن العقارات، دمج إدارة علاقات العملاء",
              image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
            }
          ]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="portfolio" className="py-32 relative bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">{lang === 'ar' ? 'أعمال مختارة' : 'Selected Work'}</h2>
            <p className="text-gray-400 text-lg max-w-xl">
              {lang === 'ar' 
                ? 'دليل على الأداء. شاهد كيف قمنا بتحويل الحضور الرقمي للوكالات الرائدة.' 
                : 'Proof of performance. See how we\'ve transformed digital presence for leading agencies.'}
            </p>
          </div>
          <a href="#" className="hidden md:flex items-center gap-2 text-sm font-medium text-white hover:text-gray-300 transition-colors">
            {lang === 'ar' ? 'عرض جميع المشاريع' : 'View All Projects'} <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-ezd-blue" size={32} /></div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-6 bg-gray-900 border border-white/10">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={project.image_url} 
                    alt={lang === 'ar' && project.name_ar ? project.name_ar : project.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 border border-white/10`}>
                    <ExternalLink size={16} className="text-white" />
                  </div>
                  
                  {/* Features Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm text-gray-300 line-clamp-2">
                        {lang === 'ar' && project.features_ar ? project.features_ar : project.features}
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-heading font-bold mb-1 group-hover:text-white transition-colors">{lang === 'ar' && project.name_ar ? project.name_ar : project.name}</h3>
                <p className="text-sm text-gray-500">{lang === 'ar' && project.category_ar ? project.category_ar : project.category}</p>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-10 md:hidden">
          <a href="#" className="flex items-center justify-center gap-2 text-sm font-medium text-white border border-white/20 rounded-full py-3 hover:bg-white/5 transition-colors">
            {lang === 'ar' ? 'عرض جميع المشاريع' : 'View All Projects'} <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </a>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const { lang } = useLanguage();
  const features = [
    {
      icon: <Zap size={24} />,
      title: lang === 'ar' ? "التميز التقني" : "Technical Excellence",
      desc: lang === 'ar' ? "كود نظيف، أطر عمل حديثة، وأصول محسنة تضمن أداء موقعك بشكل لا تشوبه شائبة." : "Clean code, modern frameworks, and optimized assets ensure your site performs flawlessly."
    },
    {
      icon: <ShieldCheck size={24} />,
      title: lang === 'ar' ? "شريك موثوق" : "Reliable Partner",
      desc: lang === 'ar' ? "نعمل كامتداد لفريقك، ونوفر تواصلاً شفافاً ودعماً يعتمد عليه." : "We act as an extension of your team, providing transparent communication and dependable support."
    },
    {
      icon: <Target size={24} />,
      title: lang === 'ar' ? "مسارات تركز على النتائج" : "Results-Driven Funnels",
      desc: lang === 'ar' ? "يتم اتخاذ كل قرار تصميم مع وضع التحويل في الاعتبار، لتحويل زوارك إلى عملاء محتملين." : "Every design decision is made with conversion in mind, turning your traffic into qualified leads."
    },
    {
      icon: <Clock size={24} />,
      title: lang === 'ar' ? "تسليم سريع" : "Fast Delivery",
      desc: lang === 'ar' ? "تسمح لنا المنهجيات الرشيقة بإطلاق أصول رقمية عالية الجودة بشكل أسرع من الوكالات التقليدية." : "Agile methodologies allow us to launch high-quality digital assets faster than traditional agencies."
    }
  ];

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">{lang === 'ar' ? 'ميزة EZDMEDIA' : 'The EZDMEDIA Advantage'}</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {lang === 'ar' ? 'لماذا تختارنا الوكالات الخدمية الرائدة كشريك نمو رقمي.' : 'Why leading professional service agencies choose us as their digital growth partner.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Contact = () => {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', agency_type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', agency_type: '', message: '' });
      } else {
        alert(lang === 'ar' ? "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى." : "Failed to send message. Please try again.");
      }
    } catch (err) {
      alert(lang === 'ar' ? "خطأ في الشبكة." : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 relative bg-[#050505] border-t border-white/5 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-ezd-blue/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6">{lang === 'ar' ? 'هل أنت مستعد للارتقاء بوكالتك؟' : 'Ready to Elevate Your Agency?'}</h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            {lang === 'ar' ? 'دعنا نناقش كيف يمكن لتطوير الويب عالي الأداء واستراتيجيات وسائل التواصل الاجتماعي توسيع نطاق عملك.' : 'Let\'s discuss how our high-performance web development and SMM strategies can scale your business.'}
          </p>
        </div>

        {success ? (
          <div className="bg-[#0A0A0A] border border-ezd-green/50 rounded-3xl p-12 text-center shadow-2xl">
            <div className="w-16 h-16 bg-ezd-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-ezd-green">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">{lang === 'ar' ? 'تم استلام الرسالة' : 'Message Received'}</h3>
            <p className="text-gray-400">{lang === 'ar' ? 'سنتواصل معك قريبًا لمناقشة نمو وكالتك.' : 'We\'ll be in touch with you shortly to discuss your agency\'s growth.'}</p>
            <button onClick={() => setSuccess(false)} className="mt-8 text-sm font-medium text-white hover:text-ezd-blue transition-colors">{lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send another message'}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-400">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50 focus:ring-1 focus:ring-ezd-blue/50 transition-all"
                  placeholder={lang === 'ar' ? 'جون دو' : 'John Doe'}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-400">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50 focus:ring-1 focus:ring-ezd-blue/50 transition-all"
                  placeholder="john@agency.com"
                />
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              <label htmlFor="agency" className="text-sm font-medium text-gray-400">{lang === 'ar' ? 'نوع الوكالة' : 'Agency Type'}</label>
              <select 
                id="agency" 
                required
                value={formData.agency_type}
                onChange={e => setFormData({...formData, agency_type: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50 focus:ring-1 focus:ring-ezd-blue/50 transition-all appearance-none"
              >
                <option value="" disabled>{lang === 'ar' ? 'اختر مجالك' : 'Select your industry'}</option>
                <option value="Real Estate">{lang === 'ar' ? 'عقارات' : 'Real Estate'}</option>
                <option value="Law Firm">{lang === 'ar' ? 'شركة محاماة' : 'Law Firm'}</option>
                <option value="Financial Services">{lang === 'ar' ? 'خدمات مالية' : 'Financial Services'}</option>
                <option value="Travel & Hospitality">{lang === 'ar' ? 'سفر وضيافة' : 'Travel & Hospitality'}</option>
                <option value="Other">{lang === 'ar' ? 'خدمات مهنية أخرى' : 'Other Professional Service'}</option>
              </select>
            </div>

            <div className="space-y-2 mb-8">
              <label htmlFor="message" className="text-sm font-medium text-gray-400">{lang === 'ar' ? 'تفاصيل المشروع' : 'Project Details'}</label>
              <textarea 
                id="message" 
                required
                rows={4}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-ezd-blue/50 focus:ring-1 focus:ring-ezd-blue/50 transition-all resize-none"
                placeholder={lang === 'ar' ? 'أخبرنا عن أهدافك...' : 'Tell us about your goals...'}
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><span className="relative z-10">{lang === 'ar' ? 'إرسال استفسار' : 'Send Inquiry'}</span> <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} /></>}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

const Footer = () => {
  const { lang } = useLanguage();
  return (
    <footer className="py-12 border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 opacity-80">
          <Logo />
        </div>
        
        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} EZDMEDIA. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </div>
        
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">{lang === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</a>
          <a href="#" className="hover:text-white transition-colors">{lang === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</a>
          <Link to="/admin" className="hover:text-white transition-colors">{lang === 'ar' ? 'تسجيل دخول الإدارة' : 'Admin Login'}</Link>
          <div className="flex items-center gap-4 ml-4">
            {/* Social Icons Placeholders */}
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="sr-only">Twitter</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Landing = () => (
  <div className="min-h-screen bg-black text-white selection:bg-ezd-blue/30 selection:text-white">
    <Navbar />
    <main>
      <Hero />
      <Services />
      <Portfolio />
      <Features />
      <Contact />
    </main>
    <Footer />
  </div>
);

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  
  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LanguageContext.Provider>
  );
}
