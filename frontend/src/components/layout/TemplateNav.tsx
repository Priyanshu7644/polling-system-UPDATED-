import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Zap,
  HelpCircle,
  ClipboardList
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

function cx(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface TemplateNavProps {
  activeTab?: 'polls' | 'exams' | 'surveys';
  setActiveTab?: (tab: 'polls' | 'exams' | 'surveys') => void;
}

export default function TemplateNav({ activeTab, setActiveTab }: TemplateNavProps) {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Polls', 
      id: 'polls' as const,
      path: '/?tab=polls', 
      icon: <Zap className="w-4 h-4" />
    },
    { 
      name: 'Exams', 
      id: 'exams' as const,
      path: '/?tab=exams', 
      icon: <HelpCircle className="w-4 h-4" />
    },
    { 
      name: 'Surveys', 
      id: 'surveys' as const,
      path: '/?tab=surveys', 
      icon: <ClipboardList className="w-4 h-4" />
    },
    { 
      name: 'Analytics', 
      id: 'analytics' as const,
      path: '/analytics', 
      icon: <BarChart3 className="w-4 h-4" />
    },
  ];

  const secondaryItems = [
    { name: 'Forms', path: '#forms' },
    { name: 'Q&A', path: '#qa' },
  ];

  return (
    <div className="w-full mx-auto my-12 flex flex-col items-center relative px-4">
      {/* Pills Container */}
      <div className="bg-[#11131a]/60 backdrop-blur-xl rounded-full p-1.5 flex items-center shadow-2xl border border-white/10 ring-1 ring-white/5 relative min-w-fit max-w-[95vw]">
        <div className="flex items-center space-x-1 md:space-x-2 px-1 py-1 w-full overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = activeTab ? activeTab === item.id : location.pathname === item.path;
            
            const handleItemClick = (e: React.MouseEvent) => {
               if (setActiveTab && item.id !== 'analytics') {
                  e.preventDefault();
                  setActiveTab(item.id as 'polls' | 'exams' | 'surveys');
               }
            };

            return (
              <div key={item.name} className="relative shrink-0">
                <Link
                  to={item.path}
                  onClick={handleItemClick}
                  className={cx(
                    "flex items-center gap-2 px-3 md:px-6 py-2.5 md:py-3.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 relative whitespace-nowrap",
                    isActive 
                      ? "bg-white text-black shadow-xl" 
                      : "text-gray-400 hover:text-gray-200"
                  )}
                >
                  <span className={cx(isActive ? "text-black" : "text-gray-400")}>{item.icon}</span>
                  {item.name}
                </Link>
              </div>
            );
          })}
          
          <div className="flex items-center h-6 border-l border-white/10 mx-2 shrink-0" />

          {secondaryItems.map(item => (
            <span 
              key={item.name}
              className="text-[10px] font-black uppercase tracking-widest text-gray-600 px-4 cursor-not-allowed select-none transition-colors hover:text-gray-500 shrink-0"
              title="Coming soon"
            >
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
