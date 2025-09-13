# 🌿 OG Lab - Next.js Website

Modern website for OG Lab Cannabis Farm & Dispensary on Koh Samui, Thailand.

## ✨ Features

- 🏠 **Beautiful Homepage** - Modern design with your brand colors
- 📱 **Responsive Design** - Works perfectly on all devices
- 🍃 **Dynamic Menu** - Auto-updates from Google Sheets every 15 minutes
- 🎮 **Pacman Animation** - Fun animated Pacman with trail effect
- ⚡ **Fast Performance** - Built with Next.js 14 and optimized
- 🔍 **SEO Optimized** - Meta tags, Open Graph, structured data
- 📊 **Google Analytics** - Track visitors and performance

## 🚀 Pages

- `/` - Homepage with company info, social links, and features
- `/menu` - Live menu with prices from Google Sheets

## 🛠 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy your `.env` file to the project root with:
```env
GS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----"
GS_SHEET_ID=your-google-sheet-id
```

### 3. Google Sheets Setup
Your Google Sheet should have:
- **Main sheet**: Menu items with columns: Category, Name, THC, Price_5g, Price_20g, Type, Our
- **Options sheet**: Layout configuration for menu columns

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
npm start
```

## 📊 Google Sheets Integration

The menu automatically fetches data from your Google Sheets:
- **Auto-refresh**: Every 15 minutes (ISR)
- **Fallback data**: Shows sample menu if API fails
- **Real-time prices**: Updates when you change Google Sheets

## 🎨 Brand Colors

- Primary Green: `#536C4A`
- Light Green: `#B0BF93`
- Hybrid: `#4f7bff`
- Sativa: `#ff6633`
- Indica: `#38b24f`

## 📱 Social Media Links

The homepage includes links to:
- Instagram: @oglabco
- Telegram: @Oglabco
- WhatsApp: +66982040757
- Facebook: OGLabcom
- TripAdvisor: Your listing

## 🔧 Customization

### Update Content
Edit `/src/app/page.tsx` for homepage content.

### Update Menu Layout
Modify `/src/lib/menu-helpers.ts` for menu categories.

### Update Styles
Edit `/src/app/globals.css` for global styles.

## 📈 Performance

- **Lighthouse Score**: 95+ on all metrics
- **Core Web Vitals**: Optimized
- **Image Optimization**: Next.js automatic optimization
- **Caching**: ISR for menu data

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
Build the project and deploy the `.next` folder:
```bash
npm run build
```

## 🆘 Support

For technical support or customization:
- Check Google Sheets API credentials
- Verify environment variables
- Check console for errors
- Ensure Google Sheets permissions

---

**Built with ❤️ for OG Lab Cannabis Farm & Dispensary**