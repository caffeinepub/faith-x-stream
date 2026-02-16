import { Heart } from 'lucide-react';
import { useState } from 'react';
import ContextualModal from './ContextualModal';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: 'info' | 'coming-soon' | 'under-construction' | 'feature-preview';
    title: string;
    description: string;
  }>({
    type: 'info',
    title: '',
    description: '',
  });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, type: string) => {
    e.preventDefault();
    
    const configs = {
      privacy: {
        type: 'info' as const,
        title: 'Privacy Policy',
        description: 'Your privacy is important to us. We are committed to protecting your personal information and being transparent about how we collect, use, and share your data. Our full privacy policy is currently being finalized and will be available soon.',
      },
      terms: {
        type: 'info' as const,
        title: 'Terms of Service',
        description: 'By using FAITH X-Stream, you agree to our terms of service. These terms govern your access to and use of our streaming platform, including all content, features, and services. Our complete terms document is being prepared and will be published shortly.',
      },
      contact: {
        type: 'info' as const,
        title: 'Contact Us',
        description: 'We\'d love to hear from you! For support inquiries, feedback, or partnership opportunities, please reach out to us at support@faithxstream.com. Our team typically responds within 24-48 hours.',
      },
    };

    const config = configs[type as keyof typeof configs];
    if (config) {
      setModalConfig(config);
      setModalOpen(true);
    }
  };

  return (
    <>
      <footer className="border-t-2 border-[#660000] bg-[#330000] backdrop-blur-xl mt-12">
        <div className="container py-8 px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>© 2025 FAITH X-Stream. Built with</span>
              <Heart className="h-4 w-4 fill-[#cc0000] text-[#cc0000]" />
              <span>using</span>
              <a
                href="https://caffeine.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#cc0000] hover:text-[#ff0000] transition-colors duration-300 font-bold focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] rounded px-1"
              >
                caffeine.ai
              </a>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <a 
                href="#" 
                onClick={(e) => handleLinkClick(e, 'privacy')}
                className="hover:text-[#cc0000] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] rounded px-1 font-medium"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                onClick={(e) => handleLinkClick(e, 'terms')}
                className="hover:text-[#cc0000] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] rounded px-1 font-medium"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                onClick={(e) => handleLinkClick(e, 'contact')}
                className="hover:text-[#cc0000] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#cc0000] focus:ring-offset-2 focus:ring-offset-[#330000] rounded px-1 font-medium"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      <ContextualModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
      />
    </>
  );
}
