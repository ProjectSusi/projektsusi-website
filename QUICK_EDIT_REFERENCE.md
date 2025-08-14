# ⚡ Quick Edit Reference Card

## 🎯 **Most Common Edits**

### **Change Homepage Title**
📁 File: `/public/locales/de/common.json`  
📍 Line 13: `"title": "Your new title here"`

### **Update Contact Email**  
📁 File: `/public/locales/de/common.json`  
📍 Line 60: `"email": "your@email.com"`

### **Change Button Text**
📁 File: `/public/locales/de/common.json`  
📍 Line 15: `"cta_demo": "New button text"`

### **Update Phone Number**
📁 File: `/public/locales/de/common.json`  
📍 Line 62: `"phone": "+41 XX XXX XX XX"`

---

## 🚀 **3-Step Edit Process**

1. **Open**: `/public/locales/de/common.json`
2. **Edit**: Text between quotes `""`
3. **Save**: File → Refresh browser → Done!

---

## ✅ **Safe to Edit** | ❌ **Don't Touch**

```json
✅ "title": "Edit this text"     ❌ { } [ ] : ,
✅ "email": "your@email.com"     ❌ .tsx .js files  
✅ "phone": "+41 123 456"        ❌ className= 
```

---

## 🌍 **Multi-Language Files**

- **German**: `/public/locales/de/common.json`
- **English**: `/public/locales/en/common.json`

**Rule**: Keep same structure, translate text only!

---

## 🆘 **Quick Fixes**

| Problem | Solution |
|---------|----------|
| Changes don't show | Hard refresh: `Ctrl+F5` |
| Website broken | Check for missing `"` or `,` |
| Can't save file | Run editor as administrator |

---

## 🔧 **Recommended Tool**

**VS Code** (Free): https://code.visualstudio.com/
- Shows file structure
- Highlights errors
- Auto-saves changes

---

*🎯 **Golden Rule**: Only edit text between quotes `""`*