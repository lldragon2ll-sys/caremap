import Script from "next/script";

/**
 * GA4 + Meta Pixel + Kakao Pixel 스크립트 주입.
 * 환경 변수 누락 시 자동으로 해당 픽셀만 생략. 모두 비어있으면 아무것도 로드 안 함.
 *
 * 필요 env (Vercel):
 *   NEXT_PUBLIC_GA_ID         e.g. G-XXXXXXXX
 *   NEXT_PUBLIC_META_PIXEL_ID e.g. 1234567890
 *   NEXT_PUBLIC_KAKAO_PIXEL_ID e.g. 1234567890
 */
export function AnalyticsScripts() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const kakao = process.env.NEXT_PUBLIC_KAKAO_PIXEL_ID;

  return (
    <>
      {ga && (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${ga}', { send_page_view: true });
            `}
          </Script>
        </>
      )}
      {meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${meta}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
      {kakao && (
        <Script id="kakao-pixel" strategy="afterInteractive">
          {`
            (function(d,s){var a=d.createElement(s);a.async=1;
            a.src='https://t1.daumcdn.net/kas/static/kp.js';
            d.head.appendChild(a);a.onload=function(){
              if(window.kakaoPixel) window.kakaoPixel('${kakao}').pageView();
            };})(document,'script');
          `}
        </Script>
      )}
    </>
  );
}
