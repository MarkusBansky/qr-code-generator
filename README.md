# QR Code Generator

A modern, feature-rich QR Code Generator built with React, TypeScript, and Vite. Generate QR codes instantly from any text, URL, or use pre-built templates for common use cases like WiFi networks, contact cards, emails, and more.

![QR Code Generator](https://img.shields.io/badge/QR%20Code-Generator-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎯 **QR Code Templates**
- **📶 WiFi Network**: Generate QR codes for automatic WiFi connection
- **📇 Contact Card**: Create vCard QR codes for easy contact sharing
- **📧 Email**: Pre-compose email messages with recipient, subject, and body
- **📞 Phone Call**: Direct dial phone numbers
- **💬 SMS Message**: Send pre-written text messages
- **📍 Location**: Share GPS coordinates or addresses

### 🛠️ **Advanced Features**
- **Real-time Generation**: QR codes update instantly as you type
- **Multiple Export Formats**: Download as PNG, SVG, or other formats
- **History Management**: Keep track of previously generated QR codes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Character Counter**: Live feedback on input length with 2000 character limit
- **Dark Radix Interface**: Dark-only, accessible UI built with Radix Themes components

### 🎨 **User Experience**
- **Instant Feedback**: Real-time QR code generation with no delays
- **Input Validation**: Smart validation for URLs and other input types
- **Touch-Friendly**: Optimized for mobile usage with proper touch targets
- **Accessibility**: Built with accessibility best practices
- **Dark-Only Theme**: Consistent dark experience powered by Radix Themes

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MarkusBansky/qr-code-generator.git
   cd qr-code-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application running.

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The built files will be available in the `dist` directory.

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) for fast development and optimized builds
- **Styling**: [TailwindCSS](https://tailwindcss.com/) for utility-first CSS
- **UI Components**: [Radix UI](https://www.radix-ui.com/) Themes and Icons for the application interface
- **QR Generation**: [qrcode](https://github.com/soldair/node-qrcode) library
- **Icons**: [Radix Icons](https://www.radix-ui.com/icons) for consistent iconography
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── QRGenerator.tsx  # Main QR generator component
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── styles/              # Global styles and Tailwind configuration
├── App.tsx              # Main application component
└── main.tsx            # Application entry point
```

## 🎯 Usage

### Basic QR Code Generation
1. Select "Custom Text/URL" tab
2. Enter your text or URL in the input field
3. Watch the QR code generate in real-time
4. Click the download button to save as PNG

### Using Templates
1. Choose from available templates (WiFi, Contact, Email, etc.)
2. Fill in the required fields for your chosen template
3. The QR code will generate automatically
4. Download or share your QR code

### Managing History
- Previously generated QR codes are automatically saved to history
- Click the history section to view past QR codes
- Load previous QR codes by clicking the copy icon
- Remove items from history using the trash icon

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started with Contributing

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/qr-code-generator.git
   ```
3. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and test thoroughly
5. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "Add: new QR template for calendar events"
   ```
6. **Push to your fork** and create a Pull Request

### Development Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Testing**: Test your changes across different browsers and devices
- **Documentation**: Update documentation for any new features
- **Performance**: Ensure changes don't negatively impact performance
- **Accessibility**: Maintain accessibility standards for all UI changes

### Types of Contributions

- 🐛 **Bug fixes**: Report and fix bugs
- ✨ **New features**: Add new QR code templates or functionality
- 📚 **Documentation**: Improve documentation and examples
- 🎨 **UI/UX**: Enhance the user interface and experience
- ⚡ **Performance**: Optimize performance and bundle size
- 🔧 **Tooling**: Improve development tools and processes

### Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and device information
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [GitHub Spark](https://githubnext.com/projects/spark) for rapid prototyping
- UI components powered by [Radix UI](https://www.radix-ui.com/)
- Icons from [Phosphor Icons](https://phosphoricons.com/)
- QR code generation by [node-qrcode](https://github.com/soldair/node-qrcode)

## 📞 Contact

Created by [Markiian Benovskyi](https://markiian-benovskyi.com)

- 🌐 Website: [markiian-benovskyi.com](https://markiian-benovskyi.com)
- 💼 LinkedIn: [Connect with me](https://linkedin.com/in/markiian-benovskyi)
- 🐙 GitHub: [@MarkusBansky](https://github.com/MarkusBansky)

---

⭐ **Star this repository** if you find it helpful!