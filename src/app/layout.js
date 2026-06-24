import './globals.css';
import { Public_Sans, Source_Serif_4 } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const sans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Mountain Top University — Student Portal',
    template: '%s · Mountain Top University',
  },
  description:
    'The official Mountain Top University learning portal: courses, assignments, quizzes, live classes, and academic resources.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
