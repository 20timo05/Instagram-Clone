// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        {/* Fontawesome CDN */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css"
          integrity="sha512-KfkfwYDsLkIlwQp6LFnl8zNdLGxu9YAA1QvwINks4PhcElQSvqcyVLLD9aMhXd13uQjoXtEKNosOWaZqXgel0g=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@700&family=Roboto:wght@100;400;700&display=swap"
          rel="stylesheet"
        />

        <meta name="description" content="Instagram Clone using Next.js!" />
        <meta
          name="keywords"
          content="Instagram, Coding, HTML, CSS, JavaScript, Next.js, React"
        />
        <meta name="author" content="Timo Rolf" />
      </Head>
      <body>
        <Main />
        {/* show user list as popup */}
        <div id="usersModal"></div>
        <div id="locationModal"></div>
        <NextScript />
      </body>
    </Html>
  );
}
