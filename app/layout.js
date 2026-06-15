import "./globals.css";

export const metadata = {
  title: "Voteview — Global Election Comparator",
  description: "Compare political party positions side by side.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}