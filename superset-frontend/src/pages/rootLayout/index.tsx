/* eslint-disable */
import { LayoutProvider } from "../../layout/context/layoutcontext";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/primereact.css";
import "primeflex/primeflex.css";

// Import PrimeReact styles
import 'primereact/resources/themes/lara-light-blue/theme.css';  // Replace with the desired PrimeReact theme
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css'; 

import "../../styles/layout/layout.scss";
import { ToastProvider } from "src/components/CsightCommon/context/ToastContext";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>EveryOps CSight</title>
        <meta charSet="UTF-8" />
        <meta
          name="description"
          content="The ultimate collection of design-agnostic, flexible and accessible React UI Components."
        />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta property="og:type" content="website"></meta>
        <meta
          property="og:title"
          content="Diamond by PrimeReact for NextJS"
        ></meta>
        <meta property="og:url" content="https://diamond.primereact.org"></meta>
        <meta
          property="og:description"
          content="The ultimate collection of design-agnostic, flexible and accessible React UI Components."
        />
        <meta
          property="og:image"
          content="https://www.primefaces.org/static/social/diamond-react.png"
        ></meta>
        <meta property="og:ttl" content="604800"></meta>
        <link
          rel="icon"
          href={`/static/assets/images/everyops-favicon.png`}
          type="image/png"
        ></link>
        {/* <link
          id="theme-link"
          href={`/theme/theme-light/blue/theme.css`}
          rel="stylesheet"
        ></link> */}
      </head>
      <body>
        <PrimeReactProvider>
          <ToastProvider>
          <LayoutProvider>
          {/* <AuthProvider> */}
                 {children}
            {/* </AuthProvider> */}
             
            </LayoutProvider>
          </ToastProvider>
            
        </PrimeReactProvider>
      </body>
    </html>
  );
}
