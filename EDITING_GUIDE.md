# 📝 Website Editing Guide - No Coding Required!

This guide shows you how to edit your Projekt Susi website without any programming knowledge. Perfect for content managers, marketing teams, and business owners.

## 🚀 Quick Start (5 Minutes)

1. **Open your website in browser**: `http://localhost:3000`
2. **Download VS Code** (free text editor): https://code.visualstudio.com/
3. **Open the website folder** in VS Code
4. **Edit text files** → **Save** → **Refresh browser** = **See changes instantly!**

---

## 🎯 What You Can Edit (Beginner-Friendly)

### ✅ **Text Content** - Safe to Edit
- Page titles and headlines
- Button text
- Descriptions and paragraphs
- Contact information
- Pricing information
- Menu items

### ❌ **Code Files** - Don't Touch
- Files ending in `.tsx`, `.ts`, `.js`
- Lines with `<div>`, `className=`
- Anything with lots of symbols like `{`, `}`, `[`, `]`

---

## 📁 **File Guide - Where to Find Everything**

### **📝 Text Content (German)**
**File**: `/public/locales/de/common.json`

```json
{
  "hero": {
    "title": "Die Schweizer KI-Lösung für Schweizer Unternehmen",
    "subtitle": "Vollständige Datenkontrolle + Regulatorische Compliance",
    "cta_demo": "Live Demo starten",
    "cta_consultation": "Beratung anfordern"
  }
}
```

**How to edit**: Change text between quotes `""`

### **📝 Text Content (English)**  
**File**: `/public/locales/en/common.json`
- Same structure as German file
- Edit English translations

### **📞 Contact Information**
**File**: `/public/locales/de/common.json` (and `/en/common.json`)

```json
{
  "common": {
    "email": "contact@projektsusi.ch",
    "phone": "+41 XX XXX XX XX",
    "address": "Your Swiss Address"
  }
}
```

---

## 🎨 **Common Editing Tasks**

### **Change Homepage Title**
1. Open: `/public/locales/de/common.json`
2. Find: `"title": "Die Schweizer KI-Lösung für Schweizer Unternehmen"`
3. Change to: `"title": "Your New Title Here"`
4. Save file
5. Refresh browser

### **Update Button Text**
1. Find: `"cta_demo": "Live Demo starten"`
2. Change to: `"cta_demo": "Try Our Demo"`
3. Save and refresh

### **Change Contact Info**
1. Find: `"email": "contact@projektsusi.ch"`  
2. Change to: `"email": "your@email.com"`
3. Save and refresh

### **Update Pricing**
1. Open: `/public/locales/de/common.json`
2. Find the `"pricing"` section
3. Edit titles, prices, descriptions
4. Save and refresh

---

## 🔧 **Tools You Need**

### **Option 1: VS Code (Recommended)**
- **Download**: https://code.visualstudio.com/
- **Why**: Shows file structure, syntax highlighting, auto-save
- **Perfect for**: Regular website updates

### **Option 2: Any Text Editor**
- **Windows**: Notepad, Wordpad
- **Mac**: TextEdit
- **Online**: Any web text editor
- **Perfect for**: Quick text changes

---

## ⚡ **Live Development Workflow**

### **Setup Once**
1. Open terminal/command prompt
2. Navigate to website folder
3. Run: `npm run dev`
4. Open browser to: `http://localhost:3000`

### **Daily Editing**
1. **Left screen**: Your website in browser
2. **Right screen**: Text editor with files
3. **Edit** → **Save** → **See changes instantly!**

---

## 📚 **File Structure Guide**

```
website/
├── 📝 TEXT CONTENT
│   └── public/locales/
│       ├── de/common.json     ← German text
│       └── en/common.json     ← English text
│
├── 🎨 VISUAL COMPONENTS (Advanced)
│   └── src/components/sections/
│       ├── hero.tsx           ← Homepage top section
│       ├── benefits.tsx       ← Benefits section
│       ├── solutions.tsx      ← Solutions section
│       └── pricing.tsx        ← Pricing section
│
├── 📄 PAGES (Advanced)
│   └── pages/
│       ├── index.tsx          ← Homepage
│       ├── contact.tsx        ← Contact page
│       ├── demo.tsx           ← Demo page
│       └── pricing.tsx        ← Pricing page
│
└── 🎨 STYLING (Advanced)
    ├── tailwind.config.js     ← Colors, fonts
    └── src/styles/globals.css ← Custom CSS
```

---

## 🌍 **Multi-Language Editing**

Your website supports German and English:

### **German Content**
- File: `/public/locales/de/common.json`
- Used when visitors select German language

### **English Content**  
- File: `/public/locales/en/common.json`
- Used when visitors select English language

**Important**: Keep the same structure in both files, only translate the text!

---

## 🚨 **Important Rules**

### **✅ Safe to Edit**
```json
"title": "Edit this text freely"
"description": "Change this description"
"button_text": "New button text"
```

### **❌ Don't Touch**
```json
{  ← Don't remove
  "section": {  ← Don't change structure
    "title": "Only edit this part"
  }
}  ← Don't remove
```

### **🔥 Golden Rule**
**Only edit text between quotes `""`**  
**Never delete quotes, commas, or brackets!**

---

## 🆘 **Common Issues & Solutions**

### **Website Won't Load**
- **Problem**: Broken JSON syntax
- **Solution**: Check for missing quotes `"` or commas `,`
- **Quick Fix**: Copy from backup file

### **Changes Don't Appear**
- **Problem**: Browser cache
- **Solution**: Hard refresh (`Ctrl+F5` or `Cmd+Shift+R`)

### **Text Looks Broken**
- **Problem**: Special characters
- **Solution**: Use simple quotes `"` not fancy quotes `""`

### **File Won't Save**
- **Problem**: File permissions
- **Solution**: Run text editor as administrator

---

## 🎯 **Quick Reference**

### **Most Common Edits**
1. **Homepage title**: Line 13 in `/de/common.json`
2. **Contact email**: Line 60 in `/de/common.json`  
3. **Button text**: Lines 15-16 in `/de/common.json`
4. **Phone number**: Line 62 in `/de/common.json`

### **Testing Your Changes**
1. Save file
2. Go to browser
3. Refresh page (`F5`)
4. Check changes appear
5. Test on mobile view

---

## 🎨 **Advanced: Visual Customization**

*For users comfortable with basic code editing*

### **Colors**
Edit: `/tailwind.config.js`
```javascript
colors: {
  primary: '#C41E3A',  // Swiss red
  secondary: '#1F2937', // Dark gray
}
```

### **Fonts & Spacing**
Edit component files in `/src/components/sections/`
- Look for `className=` attributes
- Common classes: `text-lg`, `p-4`, `m-8`

---

## 🚀 **Pro Tips**

1. **Always backup** files before major changes
2. **Test on mobile** - most visitors use phones
3. **Keep text concise** - shorter is better
4. **Use consistent tone** across all pages
5. **Update both languages** when changing content

---

## 📞 **Getting Help**

### **Emergency Reset**
If something breaks:
1. Copy text from this guide
2. Paste into broken file
3. Save and refresh

### **Need Technical Help?**
- Check browser console (`F12`) for errors
- Compare your file with original backup
- Use VS Code's "Compare" feature

---

## ✅ **Checklist Before Publishing**

- [ ] All text updates complete
- [ ] Both German and English updated
- [ ] Contact information current
- [ ] Pricing information accurate
- [ ] Website loads without errors
- [ ] Mobile view looks good
- [ ] All links work
- [ ] Forms submit correctly

---

*This website uses Next.js with hot reloading - your changes appear instantly! Perfect for real-time content management without technical complexity.*