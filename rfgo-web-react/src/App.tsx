import { ApolloProvider } from '@apollo/client/react';
import { client } from './shared/lib/apollo-client';
import { AppRouter } from './app/routes';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from './shared/store/useThemeStore';
import { Quill } from 'react-quill-new';

// Helper to inline Excel CSS stylesheet rules into element style attributes
function inlineStyles(htmlString: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const styleTags = doc.querySelectorAll('style');
    
    if (styleTags.length === 0) return htmlString;
    
    const rulesMap: { [selector: string]: { [prop: string]: string } } = {};
    
    styleTags.forEach((styleTag) => {
      const cssText = (styleTag.textContent || '')
        .replace(/<!--/g, '')
        .replace(/-->/g, '');
        
      const ruleRegex = /([^{]+)\{([^}]+)\}/g;
      let match;
      while ((match = ruleRegex.exec(cssText)) !== null) {
        const selectors = match[1].split(',');
        const propertiesText = match[2];
        
        const properties: { [prop: string]: string } = {};
        propertiesText.split(';').forEach((propText) => {
          const parts = propText.split(':');
          if (parts.length >= 2) {
            const propName = parts[0].trim().toLowerCase();
            const propValue = parts.slice(1).join(':').trim();
            properties[propName] = propValue;
          }
        });
        
        selectors.forEach((sel) => {
          const selector = sel.trim();
          if (selector) {
            if (!rulesMap[selector]) {
              rulesMap[selector] = {};
            }
            Object.assign(rulesMap[selector], properties);
          }
        });
      }
      styleTag.remove();
    });
    
    Object.keys(rulesMap).forEach((selector) => {
      try {
        const elements = doc.querySelectorAll(selector);
        const properties = rulesMap[selector];
        elements.forEach((el) => {
          if (el instanceof HTMLElement) {
            Object.keys(properties).forEach((prop) => {
              el.style.setProperty(prop, properties[prop]);
            });
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });

    // Post-process table cells to push cell-level styling (background, color, fonts) inside to child inline spans
    // This allows Quill to successfully parse them as inline formats and prevents them from being stripped on td elements.
    const cells = doc.querySelectorAll('td, th');
    cells.forEach((cell) => {
      if (cell instanceof HTMLElement) {
        const bg = cell.style.backgroundColor || cell.style.background;
        const color = cell.style.color;
        const fontWeight = cell.style.fontWeight;
        const fontStyle = cell.style.fontStyle;
        const fontSize = cell.style.fontSize;
        const fontFamily = cell.style.fontFamily;
        const textAlign = cell.style.textAlign;
        
        if (bg || color || fontWeight || fontStyle || fontSize || fontFamily || textAlign) {
          // Create a wrapper span to hold the styling
          const span = doc.createElement('span');
          
          if (bg) span.style.backgroundColor = bg;
          if (color) span.style.color = color;
          if (fontWeight) span.style.fontWeight = fontWeight;
          if (fontStyle) span.style.fontStyle = fontStyle;
          if (fontSize) span.style.fontSize = fontSize;
          if (fontFamily) span.style.fontFamily = fontFamily;
          if (textAlign) span.style.textAlign = textAlign;
          
          // Move all child nodes of the cell into the span
          while (cell.firstChild) {
            span.appendChild(cell.firstChild);
          }
          
          // Append the span back to the cell
          cell.appendChild(span);
          
          // Clear these styles from the td/th element (keep only borders and layout styles)
          cell.style.backgroundColor = '';
          cell.style.background = '';
          cell.style.color = '';
          cell.style.fontWeight = '';
          cell.style.fontStyle = '';
          cell.style.fontSize = '';
          cell.style.fontFamily = '';
        }
      }
    });
    
    return doc.body.innerHTML;
  } catch (err) {
    console.error('Error inlining styles:', err);
    return htmlString;
  }
}

// Register inline styles for pasting Excel tables correctly in Quill
const Parchment = Quill.import('parchment');

// Define custom style attributors with BLOCK scope (as table cells td, tr, etc., are block elements in Quill)
const BorderStyle = new Parchment.StyleAttributor('border', 'border', {
  scope: Parchment.Scope.BLOCK
});
const BorderColorStyle = new Parchment.StyleAttributor('border-color', 'border-color', {
  scope: Parchment.Scope.BLOCK
});
const BorderStyleStyle = new Parchment.StyleAttributor('border-style', 'border-style', {
  scope: Parchment.Scope.BLOCK
});
const BorderWidthStyle = new Parchment.StyleAttributor('border-width', 'border-width', {
  scope: Parchment.Scope.BLOCK
});
const CellBackgroundStyle = new Parchment.StyleAttributor('cell-background', 'background-color', {
  scope: Parchment.Scope.BLOCK
});
const CellColorStyle = new Parchment.StyleAttributor('cell-color', 'color', {
  scope: Parchment.Scope.BLOCK
});

// Import standard inline style attributors to preserve inline styles (rather than default class-based ones)
const InlineBackgroundStyle = Quill.import('attributors/style/background') as any;
const InlineColorStyle = Quill.import('attributors/style/color') as any;
const InlineAlignStyle = Quill.import('attributors/style/align') as any;
const InlineSizeStyle = Quill.import('attributors/style/size') as any;
const InlineFontStyle = Quill.import('attributors/style/font') as any;

Quill.register(BorderStyle, true);
Quill.register(BorderColorStyle, true);
Quill.register(BorderStyleStyle, true);
Quill.register(BorderWidthStyle, true);
Quill.register(CellBackgroundStyle, true);
Quill.register(CellColorStyle, true);
Quill.register(InlineBackgroundStyle, true);
Quill.register(InlineColorStyle, true);
Quill.register(InlineAlignStyle, true);
Quill.register(InlineSizeStyle, true);
Quill.register(InlineFontStyle, true);

// Create and register a custom Clipboard module to preprocess HTML before Quill parses it
const Clipboard = Quill.import('modules/clipboard') as any;
class CustomClipboard extends Clipboard {
  convert(content: any, formats?: any) {
    if (content && typeof content === 'object' && typeof content.html === 'string') {
      content.html = inlineStyles(content.html);
    } else if (typeof content === 'string') {
      content = inlineStyles(content);
    }
    return super.convert(content, formats);
  }
}
Quill.register('modules/clipboard', CustomClipboard, true);

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ApolloProvider client={client}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: theme === 'dark' ? '#0f172a' : '#ffffff',
          color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
        },
      }} />
      <AppRouter />
    </ApolloProvider>
  );
}

export default App;
