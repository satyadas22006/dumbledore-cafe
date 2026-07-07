import React, { useState } from 'react';

// Add to your index.html <head>:
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Permanent+Marker&display=swap" rel="stylesheet">

const Receipt = ({ data }) => {
  const items = data.items || [
    'AVNI', 'HAH', 'MEOW', 'SPAGHETTI ME...', 'FUSILLI ARRA...'
  ];

  return (
    <div
      id="print-only-receipt"
      className="w-[340px] mx-auto relative overflow-hidden"
    >
      {/* Pink header section */}
      <div
        className="pt-8 pb-4 px-6"
        style={{
          backgroundImage: `
            linear-gradient(180deg, #2B3A67 1px, transparent 1px),
            linear-gradient(90deg, #2B3A67 1px, transparent 1px),
            linear-gradient(180deg, #F6D9CE 0%, #F0DCC9 100%)
          `,
          backgroundSize: '100% 46px, 25% 100%, 100% 100%',
        }}
      >
        <h1
          className="text-5xl text-center text-[#2B3A67] mb-2"
          style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}
        >
          Thank You!
        </h1>
        <p className="text-[11px] text-center font-bold tracking-wide uppercase text-[#2B3A67] pb-2">
          Your patronage is appreciated
        </p>
        <div className="grid grid-cols-4 text-[10px] font-bold uppercase text-[#2B3A67] text-center border-t-2 border-[#2B3A67] pt-2">
          <span>Table</span>
          <span>No. Persons</span>
          <span>Waiter</span>
          <span>Check No.</span>
        </div>
        <div className="grid grid-cols-4 text-center pt-2">
          <span></span><span></span><span></span>
          <span className="text-red-600 font-bold">{data.checkNo || '256712'}</span>
        </div>
      </div>

      {/* Tan body section -- ruled lines + item list */}
      <div
        className="px-6 pt-6 pb-6"
        style={{
          backgroundColor: '#EFE0CB',
          backgroundImage: 'linear-gradient(180deg, #2B3A67 1px, transparent 1px)',
          backgroundSize: '100% 58px',
        }}
      >
        <div
          className="text-red-600 leading-[58px]"
          style={{ fontFamily: "'Permanent Marker', cursive", fontSize: '34px' }}
        >
          {items.map((item, i) => (
            <div key={i} className="truncate">{item}</div>
          ))}
          <div className="text-center">:)</div>
        </div>

        <div className="mt-8 flex justify-between items-end border-t-2 border-[#2B3A67] pt-3">
          <span className="text-xs font-bold uppercase text-[#2B3A67]">Tax</span>
          <span
            className="text-red-600 text-2xl"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            - {data.signature || 'guest'}
          </span>
        </div>
        <p className="text-[11px] text-center mt-2 font-bold text-[#2B3A67]">
          Thank You -- Call Again
        </p>
      </div>
    </div>
  );
};

// ---- Parent component: gates the receipt behind the button ----
const ReceiptPage = ({ data }) => {
  const [showReceipt, setShowReceipt] = useState(false);

  const handleGetReceipt = () => {
    setShowReceipt(true);
    // wait a tick so the receipt is in the DOM before print() fires
    setTimeout(() => window.print(), 50);
  };

  return (
    <div>
      {/* Everything with class "no-print" disappears when printing */}
      <div className="no-print p-8">
        <button
          onClick={handleGetReceipt}
          className="px-6 py-3 bg-[#2B3A67] text-white rounded-lg font-bold"
        >
          Get Your Receipt
        </button>
      </div>

      {/* Only rendered at all once the button has been clicked */}
      {showReceipt && (
        <div className="print-only">
          <Receipt data={data} />
        </div>
      )}

      <style>{`
        /* On screen: hide the receipt block entirely until it's shown */
        .print-only { }

        @media print {
          /* Hide everything except the receipt */
          body * { visibility: hidden; }
          #print-only-receipt, #print-only-receipt * { visibility: visible; }
          #print-only-receipt {
            position: absolute;
            top: 0;
            left: 0;
          }
          .no-print { display: none !important; }

          /* Force backgrounds/colors to actually print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Fit everything on exactly one page, no matter the browser's
             default page size -- this is what fixes the blank 2nd page */
          @page {
            size: auto;
            margin: 0;
          }
          html, body {
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #print-only-receipt {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptPage;