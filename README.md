# ClearCue - AI-Powered Skincare Consultation Platform

![ClearCue Logo](public/logo.png)

ClearCue is a modern, AI-powered skincare consultation platform that provides personalized skin analysis, treatment recommendations, natural remedies, and product suggestions. Built with Next.js 14, TypeScript, and powered by Google's Gemini AI.

## ✨ Features

- **🤖 AI-Powered Analysis**: Advanced skin condition analysis using Google Gemini AI
- **📸 Image Upload**: Support for up to 4 high-quality skin images
- **📝 Detailed Consultation**: Comprehensive questionnaire for accurate analysis
- **💊 Treatment Plans**: Personalized treatment recommendations
- **🌿 Natural Remedies**: Safe, evidence-based home remedies
- **🛍️ Product Recommendations**: Specific skincare product suggestions with brand names
- **📄 PDF Export**: Download comprehensive analysis reports
- **💬 Follow-up Chat**: Ask questions about your analysis
- **🌙 Dark Mode**: Beautiful dark theme support
- **📱 Responsive Design**: Works perfectly on all devices
- **🔒 Privacy-First**: Secure image processing and data handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/clearcue-skincare.git
   cd clearcue-skincare
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your Google Gemini API key:
   \`\`\`env
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Required: Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: App URL (defaults to localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

## 📁 Project Structure

\`\`\`
clearcue-skincare/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── analyze/       # Skin analysis endpoint
│   │   └── generate-pdf/  # PDF generation endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Main application
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── hero-section.tsx  # Landing page hero
│   └── theme-provider.tsx # Theme management
├── lib/                  # Utilities
│   ├── config.ts         # App configuration
│   └── utils.ts          # Helper functions
├── public/               # Static assets
│   └── logo.png         # App logo
├── .env.example         # Environment variables template
├── .env.local          # Your environment variables
└── README.md           # This file
\`\`\`

## 🎨 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **AI**: Google Gemini AI
- **PDF Generation**: jsPDF
- **Icons**: Lucide React

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. 
## 🔒 Security & Privacy

- **No Data Storage**: Images and analysis are not stored permanently
- **Secure Processing**: All image processing happens server-side
- **API Key Protection**: Environment variables keep your API key secure
- **HTTPS Only**: All communications are encrypted
- **Privacy First**: No tracking or analytics by default

## 🎯 Usage

1. **Upload Images**: Add 1-4 clear photos of your skin concern
2. **Describe Your Concern**: Fill out the detailed questionnaire (optional but recommended)
3. **Get Analysis**: Receive comprehensive AI-powered analysis including:
   - Professional diagnosis
   - Possible causes
   - Treatment plan
   - Prevention tips
   - Medicine recommendations
   - Natural remedies
   - Product suggestions
4. **Download PDF**: Export your complete analysis report
5. **Ask Questions**: Use the chat feature for follow-up questions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Medical Disclaimer

**Important**: ClearCue is for informational purposes only and should not replace professional medical advice. For persistent, severe, or concerning skin conditions, please consult a qualified dermatologist or healthcare provider.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/clearcue-skincare/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/clearcue-skincare/discussions)
- **Email**: support@clearcue.com

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful image analysis
- **shadcn/ui** for beautiful UI components
- **Vercel** for seamless deployment
- **The open-source community** for amazing tools and libraries

## 📊 Roadmap

- [ ] Multi-language support
- [ ] Progress tracking with before/after photos
- [ ] Dermatologist finder integration
- [ ] Skincare routine builder
- [ ] Mobile app (React Native)
- [ ] Ingredient checker
- [ ] Community features

---

**Made with ❤️ by Enigma's**






